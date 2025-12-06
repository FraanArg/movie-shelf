import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWatchedHistory, getWatchlist } from "@/lib/trakt";
import { getMovieMetadata } from "@/lib/omdb";
import { getLocalMovies } from "@/lib/local-library";
import { saveDB, MovieItem } from "@/lib/db";

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get("trakt_access_token")?.value;
    const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;
    const omdbKey = process.env.OMDB_API_KEY;

    if (!token || !clientId || !omdbKey) {
        return NextResponse.json({ error: "Missing credentials" }, { status: 401 });
    }

    try {
        // 1. Fetch Local Manual Movies
        const localMovies = await getLocalMovies();
        const formattedLocalMovies: MovieItem[] = localMovies.map(m => ({
            id: parseInt(m.id.replace("tt", ""), 10) || Math.random(),
            imdbId: m.id,
            title: m.title,
            year: m.year,
            posterUrl: m.posterUrl,
            type: m.type as "movie" | "series",
            source: "local",
            date: new Date().toISOString() // Or store added date in local-library
        }));

        // 2. Fetch ALL Trakt History (Pagination Loop)
        let allHistory: any[] = [];
        let page = 1;
        let hasMore = true;

        // Safety limit to prevent infinite loops during dev
        while (hasMore && page < 20) {
            const history = await getWatchedHistory(token, clientId, page, 100);
            if (history.length === 0) {
                hasMore = false;
            } else {
                allHistory = [...allHistory, ...history];
                page++;
            }
        }

        // 3. Process Trakt Data
        const processedIds = new Set();
        const traktItems: any[] = [];

        for (const item of allHistory) {
            if (item.type === "movie") {
                if (processedIds.has(item.movie.ids.trakt)) continue;
                processedIds.add(item.movie.ids.trakt);

                traktItems.push({
                    type: "movie",
                    data: item.movie,
                    date: item.watched_at
                });
            } else if (item.type === "episode") {
                const showId = item.show.ids.trakt;
                if (processedIds.has(showId)) continue;
                processedIds.add(showId);

                traktItems.push({
                    type: "series",
                    data: item.show,
                    date: item.watched_at
                });
            }
        }



        // 3.5 Fetch Watchlist
        const watchlist = await getWatchlist(token, clientId);
        for (const item of watchlist) {
            if (item.type === "movie") {
                if (processedIds.has(item.movie.ids.trakt)) continue; // Already in history? Skip (Watched > Watchlist)
                processedIds.add(item.movie.ids.trakt);

                traktItems.push({
                    type: "movie",
                    data: item.movie,
                    date: item.listed_at, // Use listed_at for watchlist
                    list: "watchlist"
                });
            } else if (item.type === "show") { // Trakt uses 'show' in watchlist response sometimes? or 'type' field
                // Actually watchlist endpoint returns type: 'movie' | 'show' | 'season' | 'episode'
                // But let's handle 'show'
                const showId = item.show.ids.trakt;
                if (processedIds.has(showId)) continue;
                processedIds.add(showId);

                traktItems.push({
                    type: "series",
                    data: item.show,
                    date: item.listed_at,
                    list: "watchlist"
                });
            }
        }

        // 4. Enrich with OMDB (Batching to avoid rate limits if needed, but sequential for now)
        const enrichedItems: MovieItem[] = [];

        for (const item of traktItems) {
            const data = item.data;
            try {
                // Check if we already have it in DB to avoid re-fetching OMDB? 
                // For now, we'll re-fetch to ensure fresh data, or we could implement a cache check here.

                const omdbData = await getMovieMetadata(data.ids.imdb, omdbKey);
                enrichedItems.push({
                    id: data.ids.trakt,
                    imdbId: data.ids.imdb,
                    title: data.title,
                    year: (data.year ?? "Unknown").toString(),
                    posterUrl: omdbData.Poster !== "N/A" ? omdbData.Poster : null,
                    type: item.type,
                    source: "trakt",
                    date: item.date,
                    list: item.list || "watched", // Default to watched if not specified
                    // Extended Metadata
                    Director: omdbData.Director,
                    Actors: omdbData.Actors,
                    Plot: omdbData.Plot,
                    Genre: omdbData.Genre,
                    Runtime: omdbData.Runtime
                });
            } catch (e) {
                console.error(`Failed to fetch OMDB for ${data.title}`, e);
                enrichedItems.push({
                    id: data.ids.trakt,
                    imdbId: data.ids.imdb,
                    title: data.title,
                    year: (data.year ?? "Unknown").toString(),
                    posterUrl: null,
                    type: item.type,
                    source: "trakt",
                    date: item.date,
                    list: item.list || "watched"
                });
            }
        }

        // 5. Merge and Save
        const finalCollection = [...formattedLocalMovies, ...enrichedItems];

        // Deduplicate by IMDB ID
        const uniqueCollection = Array.from(new Map(finalCollection.map(m => [m.imdbId || m.id, m])).values());

        await saveDB(uniqueCollection);

        return NextResponse.json({ success: true, count: uniqueCollection.length });

    } catch (e: any) {
        console.error("Sync failed", e);
        return NextResponse.json({ error: e.message || "Sync failed" }, { status: 500 });
    }
}
