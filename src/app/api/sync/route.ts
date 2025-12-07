import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWatchedHistory, getWatchlist } from "@/lib/trakt";
import { getMovieInfoForSync } from "@/lib/tmdb";
import { getLocalMovies } from "@/lib/local-library";
import { getDB, saveDB, MovieItem } from "@/lib/db";

// Batch size per sync (keep under 10s timeout)
const BATCH_SIZE = 25;

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get("trakt_access_token")?.value;
    const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;
    const tmdbKey = process.env.TMDB_API_KEY;

    if (!token || !clientId || !tmdbKey) {
        return NextResponse.json({ error: "Missing credentials" }, { status: 401 });
    }

    try {
        // 1. Get existing items from DB
        const existingItems = await getDB();
        const existingImdbIds = new Set(existingItems.map(m => m.imdbId).filter(Boolean));
        console.log("Existing items in DB:", existingItems.length);

        // 2. Fetch Local Movies (quick)
        const localMovies = await getLocalMovies();
        const formattedLocalMovies: MovieItem[] = localMovies
            .filter(m => !existingImdbIds.has(m.id))
            .map(m => ({
                id: parseInt(m.id.replace("tt", ""), 10) || Math.random(),
                imdbId: m.id,
                title: m.title,
                year: m.year,
                posterUrl: m.posterUrl,
                type: m.type as "movie" | "series",
                source: "local",
                date: new Date().toISOString()
            }));

        // 3. Fetch ALL Trakt History (this is fast - just IDs)
        let allHistory: any[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore && page < 15) {
            const history = await getWatchedHistory(token, clientId, page, 100);
            if (history.length === 0) {
                hasMore = false;
            } else {
                allHistory = [...allHistory, ...history];
                page++;
            }
        }

        // 4. Fetch Watchlist
        const watchlist = await getWatchlist(token, clientId);

        // 5. Find NEW items only (not in DB)
        const processedIds = new Set();
        const newItems: any[] = [];

        for (const item of allHistory) {
            if (item.type === "movie") {
                const imdbId = item.movie.ids.imdb;
                if (processedIds.has(item.movie.ids.trakt)) continue;
                if (existingImdbIds.has(imdbId)) continue; // Already in DB
                processedIds.add(item.movie.ids.trakt);
                newItems.push({ type: "movie", data: item.movie, date: item.watched_at, list: "watched" });
            } else if (item.type === "episode") {
                const showId = item.show.ids.trakt;
                const imdbId = item.show.ids.imdb;
                if (processedIds.has(showId)) continue;
                if (existingImdbIds.has(imdbId)) continue; // Already in DB
                processedIds.add(showId);
                newItems.push({ type: "series", data: item.show, date: item.watched_at, list: "watched" });
            }
        }

        for (const item of watchlist) {
            if (item.type === "movie") {
                const imdbId = item.movie.ids.imdb;
                if (processedIds.has(item.movie.ids.trakt)) continue;
                if (existingImdbIds.has(imdbId)) continue;
                processedIds.add(item.movie.ids.trakt);
                newItems.push({ type: "movie", data: item.movie, date: item.listed_at, list: "watchlist" });
            } else if (item.type === "show") {
                const showId = item.show.ids.trakt;
                const imdbId = item.show.ids.imdb;
                if (processedIds.has(showId)) continue;
                if (existingImdbIds.has(imdbId)) continue;
                processedIds.add(showId);
                newItems.push({ type: "series", data: item.show, date: item.listed_at, list: "watchlist" });
            }
        }

        console.log("New items to process:", newItems.length);

        // 6. Process only a batch (to stay within timeout)
        const batch = newItems.slice(0, BATCH_SIZE);
        const remaining = newItems.length - batch.length;

        // 7. Enrich batch with TMDb (parallel for speed)
        const enrichedItems: MovieItem[] = await Promise.all(batch.map(async (item) => {
            const data = item.data;
            const imdbId = data.ids.imdb;

            try {
                const tmdbData = imdbId ? await getMovieInfoForSync(imdbId) : null;

                return {
                    id: data.ids.trakt,
                    imdbId: imdbId,
                    title: data.title,
                    year: (data.year ?? "Unknown").toString(),
                    posterUrl: tmdbData?.posterUrl || null,
                    type: item.type,
                    source: "trakt" as const,
                    date: item.date,
                    list: item.list || "watched",
                    Director: tmdbData?.director || "N/A",
                    Actors: tmdbData?.actors || "N/A",
                    Plot: tmdbData?.plot || "N/A",
                    Genre: tmdbData?.genres || "N/A",
                    Runtime: tmdbData?.runtime || "N/A",
                    tmdbRating: tmdbData?.tmdbRating,
                };
            } catch {
                return {
                    id: data.ids.trakt,
                    imdbId: imdbId,
                    title: data.title,
                    year: (data.year ?? "Unknown").toString(),
                    posterUrl: null,
                    type: item.type,
                    source: "trakt" as const,
                    date: item.date,
                    list: item.list || "watched"
                };
            }
        }));

        // 8. Merge and Save
        const updatedCollection = [...existingItems, ...formattedLocalMovies, ...enrichedItems];
        const uniqueCollection = Array.from(new Map(updatedCollection.map(m => [m.imdbId || m.id, m])).values());
        await saveDB(uniqueCollection);

        console.log(`Synced ${batch.length} items. ${remaining} remaining.`);

        return NextResponse.json({
            success: true,
            synced: batch.length,
            remaining: remaining,
            total: uniqueCollection.length,
            message: remaining > 0 ? `Click Sync again (${remaining} more)` : "All synced!"
        });

    } catch (e: any) {
        console.error("Sync failed:", e);
        return NextResponse.json({ error: e.message || "Sync failed" }, { status: 500 });
    }
}
