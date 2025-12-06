import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getWatchedHistory, getWatchlist } from "@/lib/trakt";
import { getMovieInfoForSync } from "@/lib/tmdb";
import { getMovieMetadata } from "@/lib/omdb";
import { getLocalMovies } from "@/lib/local-library";
import { saveDB, MovieItem } from "@/lib/db";

// Increase timeout for Vercel (Pro tier allows up to 60s)
export const maxDuration = 60;

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get("trakt_access_token")?.value;
    const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;
    const tmdbKey = process.env.TMDB_API_KEY;
    const omdbKey = process.env.OMDB_API_KEY;

    console.log("Sync started:", { hasToken: !!token, hasClientId: !!clientId, hasTmdbKey: !!tmdbKey, hasOmdbKey: !!omdbKey });

    if (!token || !clientId || !tmdbKey) {
        console.log("Missing credentials");
        return NextResponse.json({ error: "Missing credentials (need Trakt token and TMDb key)" }, { status: 401 });
    }

    try {
        // 1. Fetch Local Manual Movies
        const localMovies = await getLocalMovies();
        console.log("Local movies:", localMovies.length);

        const formattedLocalMovies: MovieItem[] = localMovies.map(m => ({
            id: parseInt(m.id.replace("tt", ""), 10) || Math.random(),
            imdbId: m.id,
            title: m.title,
            year: m.year,
            posterUrl: m.posterUrl,
            type: m.type as "movie" | "series",
            source: "local",
            date: new Date().toISOString()
        }));

        // 2. Fetch Trakt History (limit pages to stay within timeout)
        let allHistory: any[] = [];
        let page = 1;
        let hasMore = true;

        console.log("Fetching Trakt history...");
        while (hasMore && page < 10) { // Limit to 10 pages to avoid timeout
            const history = await getWatchedHistory(token, clientId, page, 100);
            if (history.length === 0) {
                hasMore = false;
            } else {
                allHistory = [...allHistory, ...history];
                page++;
            }
        }
        console.log("Total history items:", allHistory.length);

        // 3. Fetch Watchlist
        const watchlist = await getWatchlist(token, clientId);

        // 4. Process and deduplicate
        const processedIds = new Set();
        const traktItems: any[] = [];

        for (const item of allHistory) {
            if (item.type === "movie") {
                if (processedIds.has(item.movie.ids.trakt)) continue;
                processedIds.add(item.movie.ids.trakt);
                traktItems.push({ type: "movie", data: item.movie, date: item.watched_at });
            } else if (item.type === "episode") {
                const showId = item.show.ids.trakt;
                if (processedIds.has(showId)) continue;
                processedIds.add(showId);
                traktItems.push({ type: "series", data: item.show, date: item.watched_at });
            }
        }

        for (const item of watchlist) {
            if (item.type === "movie") {
                if (processedIds.has(item.movie.ids.trakt)) continue;
                processedIds.add(item.movie.ids.trakt);
                traktItems.push({ type: "movie", data: item.movie, date: item.listed_at, list: "watchlist" });
            } else if (item.type === "show") {
                const showId = item.show.ids.trakt;
                if (processedIds.has(showId)) continue;
                processedIds.add(showId);
                traktItems.push({ type: "series", data: item.show, date: item.listed_at, list: "watchlist" });
            }
        }

        console.log("Total unique items to process:", traktItems.length);

        // 5. Enrich with TMDb (batch in parallel for speed)
        const enrichedItems: MovieItem[] = [];
        const batchSize = 5; // Process 5 at a time

        for (let i = 0; i < traktItems.length; i += batchSize) {
            const batch = traktItems.slice(i, i + batchSize);

            const batchResults = await Promise.all(batch.map(async (item) => {
                const data = item.data;
                const imdbId = data.ids.imdb;

                try {
                    const tmdbData = imdbId ? await getMovieInfoForSync(imdbId) : null;

                    // Optional: Get OMDB ratings (skip if rate limited)
                    let imdbRating: string | undefined;
                    let rtRating: string | undefined;
                    let metascore: string | undefined;

                    if (omdbKey && imdbId) {
                        try {
                            const omdbData = await getMovieMetadata(imdbId, omdbKey);
                            if (omdbData && omdbData.imdbRating !== "N/A") {
                                imdbRating = omdbData.imdbRating;
                                const rtEntry = omdbData.Ratings?.find((r: any) => r.Source === "Rotten Tomatoes");
                                if (rtEntry) rtRating = rtEntry.Value;
                                if (omdbData.Metascore !== "N/A") metascore = omdbData.Metascore;
                            }
                        } catch {
                            // OMDB unavailable, continue
                        }
                    }

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
                        imdbRating,
                        rtRating,
                        Metascore: metascore,
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

            enrichedItems.push(...batchResults);
            console.log(`Processed ${enrichedItems.length}/${traktItems.length} items`);
        }

        // 6. Merge and Save
        const finalCollection = [...formattedLocalMovies, ...enrichedItems];
        const uniqueCollection = Array.from(new Map(finalCollection.map(m => [m.imdbId || m.id, m])).values());

        await saveDB(uniqueCollection);
        console.log("Sync complete:", uniqueCollection.length, "items");

        return NextResponse.json({ success: true, count: uniqueCollection.length });

    } catch (e: any) {
        console.error("Sync failed:", e);
        return NextResponse.json({ error: e.message || "Sync failed" }, { status: 500 });
    }
}
