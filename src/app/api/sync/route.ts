import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWatchedMovies, getWatchedShows, getWatchlist, getShowsInProgress } from "@/lib/trakt";
import { getMovieInfoForSync } from "@/lib/tmdb";
import { getLocalMovies } from "@/lib/local-library";
import { getDB, saveDB, MovieItem } from "@/lib/db";

// Batch size per sync (increased for faster syncing)
const BATCH_SIZE = 100;

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
        const existingTraktIds = new Set(existingItems.map(m => m.id).filter(Boolean));
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

        // 3. Fetch ALL Trakt Watched Movies and Shows (complete data, not paginated)
        const [watchedMovies, watchedShows] = await Promise.all([
            getWatchedMovies(token, clientId),
            getWatchedShows(token, clientId),
        ]);

        console.log("Trakt watched movies:", watchedMovies.length);
        console.log("Trakt watched shows:", watchedShows.length);

        // 4. Fetch Watchlist
        const watchlist = await getWatchlist(token, clientId);

        // 5. Fetch shows in progress (incomplete shows should be marked as "watching")
        const inProgressShows = await getShowsInProgress(token, clientId);
        const inProgressImdbIds = new Set(
            inProgressShows.map(item => item.show.ids?.imdb).filter(Boolean)
        );
        console.log("Shows in progress:", inProgressShows.length);

        // 5. Find NEW items only (not in DB)
        const processedIds = new Set();
        const newItems: any[] = [];

        // Process watched movies
        for (const item of watchedMovies) {
            const movie = item.movie;
            if (!movie?.ids) continue;

            const traktId = movie.ids.trakt;
            const imdbId = movie.ids.imdb;

            if (processedIds.has(traktId)) continue;
            if (imdbId && existingImdbIds.has(imdbId)) continue;
            if (existingTraktIds.has(traktId)) continue;

            processedIds.add(traktId);
            newItems.push({
                type: "movie",
                data: movie,
                date: item.last_watched_at || new Date().toISOString(),
                list: "watched"
            });
        }

        // Process watched shows
        for (const item of watchedShows) {
            const show = item.show;
            if (!show?.ids) continue;

            const traktId = show.ids.trakt;
            const imdbId = show.ids.imdb;

            if (processedIds.has(traktId)) continue;
            if (imdbId && existingImdbIds.has(imdbId)) continue;
            if (existingTraktIds.has(traktId)) continue;

            processedIds.add(traktId);
            newItems.push({
                type: "series",
                data: show,
                date: item.last_watched_at || new Date().toISOString(),
                list: "watched"
            });
        }

        // Process watchlist
        for (const item of watchlist) {
            if (item.type === "movie" && item.movie?.ids) {
                const traktId = item.movie.ids.trakt;
                const imdbId = item.movie.ids.imdb;
                if (processedIds.has(traktId)) continue;
                if (imdbId && existingImdbIds.has(imdbId)) continue;
                if (existingTraktIds.has(traktId)) continue;
                processedIds.add(traktId);
                newItems.push({ type: "movie", data: item.movie, date: item.listed_at, list: "watchlist" });
            } else if (item.type === "show" && item.show?.ids) {
                const traktId = item.show.ids.trakt;
                const imdbId = item.show.ids.imdb;
                if (processedIds.has(traktId)) continue;
                if (imdbId && existingImdbIds.has(imdbId)) continue;
                if (existingTraktIds.has(traktId)) continue;
                processedIds.add(traktId);
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
        // Also update existing items that are now watched (were watchlist before)
        const watchedTraktIds = new Set([
            ...watchedMovies.map((w: any) => w.movie?.ids?.trakt),
            ...watchedShows.map((w: any) => w.show?.ids?.trakt),
        ].filter(Boolean));

        const watchedImdbIds = new Set([
            ...watchedMovies.map((w: any) => w.movie?.ids?.imdb),
            ...watchedShows.map((w: any) => w.show?.ids?.imdb),
        ].filter(Boolean));

        // Update existing items:
        // - watchlist → watched (if now watched)
        // - watched → watching (if show is in progress)
        const updatedExisting = existingItems.map(item => {
            // Mark in-progress shows as "watching"
            if (item.type === "series" && item.imdbId && inProgressImdbIds.has(item.imdbId)) {
                if (item.list !== "watching") {
                    return { ...item, list: "watching" as const };
                }
            }
            // Mark watchlist items as watched if they're now watched
            else if (item.list === "watchlist") {
                const isNowWatched =
                    (item.imdbId && watchedImdbIds.has(item.imdbId)) ||
                    (item.id && watchedTraktIds.has(item.id));
                if (isNowWatched) {
                    return { ...item, list: "watched" as const };
                }
            }
            return item;
        });

        const updatedCollection = [...updatedExisting, ...formattedLocalMovies, ...enrichedItems];
        const uniqueCollection = Array.from(new Map(updatedCollection.map(m => [m.imdbId || m.id, m])).values());
        await saveDB(uniqueCollection);

        console.log(`Synced ${batch.length} items. ${remaining} remaining.`);

        return NextResponse.json({
            success: true,
            synced: batch.length,
            remaining: remaining,
            total: uniqueCollection.length,
            traktMovies: watchedMovies.length,
            traktShows: watchedShows.length,
            message: remaining > 0 ? `Click Sync again (${remaining} more)` : "All synced!"
        });

    } catch (e: any) {
        console.error("Sync failed:", e);
        return NextResponse.json({ error: e.message || "Sync failed" }, { status: 500 });
    }
}
