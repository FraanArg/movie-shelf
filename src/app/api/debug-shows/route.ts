import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWatchedShows } from "@/lib/trakt";
import { getDB } from "@/lib/db";

// Debug endpoint to compare Trakt shows vs our DB
export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get("trakt_access_token")?.value;
    const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;

    if (!token || !clientId) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        // Get Trakt shows
        const traktShows = await getWatchedShows(token, clientId);

        // Get our DB
        const dbItems = await getDB();
        const dbSeries = dbItems.filter(i => i.type === "series");
        const dbSeriesWatched = dbSeries.filter(i => i.list !== "watchlist");

        // Find shows in Trakt but not in our DB
        const dbImdbIds = new Set(dbItems.map(i => i.imdbId).filter(Boolean));
        const dbTraktIds = new Set(dbItems.map(i => i.id).filter(Boolean));

        const missingFromDb = traktShows.filter((item: any) => {
            const show = item.show;
            if (!show?.ids) return false;
            const inDb = (show.ids.imdb && dbImdbIds.has(show.ids.imdb)) ||
                dbTraktIds.has(show.ids.trakt);
            return !inDb;
        }).map((item: any) => ({
            title: item.show.title,
            year: item.show.year,
            imdbId: item.show.ids?.imdb,
            traktId: item.show.ids?.trakt,
        }));

        // Find shows in DB but not in Trakt watched
        const traktImdbIds = new Set(traktShows.map((s: any) => s.show?.ids?.imdb).filter(Boolean));
        const traktTraktIds = new Set(traktShows.map((s: any) => s.show?.ids?.trakt).filter(Boolean));

        const notInTraktWatched = dbSeriesWatched.filter(item => {
            const inTrakt = (item.imdbId && traktImdbIds.has(item.imdbId)) ||
                traktTraktIds.has(item.id);
            return !inTrakt;
        }).map(item => ({
            title: item.title,
            year: item.year,
            imdbId: item.imdbId,
            source: item.source,
        }));

        return NextResponse.json({
            traktTotal: traktShows.length,
            dbTotal: dbSeries.length,
            dbWatchedOnly: dbSeriesWatched.length,
            missingFromDb: {
                count: missingFromDb.length,
                shows: missingFromDb,
            },
            notInTraktWatched: {
                count: notInTraktWatched.length,
                shows: notInTraktWatched,
            },
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
