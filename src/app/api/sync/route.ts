import { cookies } from "next/headers";
import { getWatchedHistory, getWatchlist } from "@/lib/trakt";
import { getMovieInfoForSync } from "@/lib/tmdb";
import { getMovieMetadata } from "@/lib/omdb";
import { getLocalMovies } from "@/lib/local-library";
import { saveDB, MovieItem } from "@/lib/db";

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get("trakt_access_token")?.value;
    const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;
    const tmdbKey = process.env.TMDB_API_KEY;
    const omdbKey = process.env.OMDB_API_KEY;

    if (!token || !clientId || !tmdbKey) {
        return new Response(
            JSON.stringify({ error: "Missing credentials (need Trakt token and TMDb key)" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const sendProgress = (stage: string, current: number, total: number, message?: string) => {
                const percent = total > 0 ? Math.round((current / total) * 100) : 0;
                const data = JSON.stringify({ stage, current, total, percent, message });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            };

            try {
                // Stage 1: Fetch Local Movies
                sendProgress("init", 0, 100, "Loading local movies...");
                const localMovies = await getLocalMovies();

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

                // Stage 2: Fetch Trakt History
                sendProgress("trakt", 5, 100, "Fetching Trakt history...");
                let allHistory: any[] = [];
                let page = 1;
                let hasMore = true;

                while (hasMore && page < 20) {
                    const history = await getWatchedHistory(token, clientId, page, 100);
                    if (history.length === 0) {
                        hasMore = false;
                    } else {
                        allHistory = [...allHistory, ...history];
                        page++;
                        sendProgress("trakt", 5 + page, 100, `Fetched ${allHistory.length} items from Trakt...`);
                    }
                }

                // Stage 3: Fetch Watchlist
                sendProgress("watchlist", 15, 100, "Fetching watchlist...");
                const watchlist = await getWatchlist(token, clientId);

                // Stage 4: Process and deduplicate
                sendProgress("process", 20, 100, "Processing items...");
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

                // Stage 5: Enrich with TMDb (main progress loop)
                const enrichedItems: MovieItem[] = [];
                const totalItems = traktItems.length;

                for (let i = 0; i < totalItems; i++) {
                    const item = traktItems[i];
                    const data = item.data;
                    const imdbId = data.ids.imdb;
                    const progressPercent = 25 + Math.round((i / totalItems) * 70); // 25-95%

                    sendProgress("enrich", i + 1, totalItems, `Fetching ${data.title}... (${i + 1}/${totalItems})`);

                    try {
                        const tmdbData = imdbId ? await getMovieInfoForSync(imdbId) : null;

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
                            } catch (e) {
                                // OMDB unavailable, continue
                            }
                        }

                        enrichedItems.push({
                            id: data.ids.trakt,
                            imdbId: imdbId,
                            title: data.title,
                            year: (data.year ?? "Unknown").toString(),
                            posterUrl: tmdbData?.posterUrl || null,
                            type: item.type,
                            source: "trakt",
                            date: item.date,
                            list: item.list || "watched",
                            Director: tmdbData?.director || "N/A",
                            Actors: tmdbData?.actors || "N/A",
                            Plot: tmdbData?.plot || "N/A",
                            Genre: tmdbData?.genres || "N/A",
                            Runtime: tmdbData?.runtime || "N/A",
                            tmdbRating: tmdbData?.tmdbRating,
                            imdbRating: imdbRating,
                            rtRating: rtRating,
                            Metascore: metascore,
                        });
                    } catch (e) {
                        enrichedItems.push({
                            id: data.ids.trakt,
                            imdbId: imdbId,
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

                // Stage 6: Save to DB
                sendProgress("save", 95, 100, "Saving to database...");
                const finalCollection = [...formattedLocalMovies, ...enrichedItems];
                const uniqueCollection = Array.from(new Map(finalCollection.map(m => [m.imdbId || m.id, m])).values());
                await saveDB(uniqueCollection);

                // Done
                sendProgress("complete", 100, 100, `Synced ${uniqueCollection.length} items!`);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, count: uniqueCollection.length })}\n\n`));
                controller.close();

            } catch (e: any) {
                console.error("Sync failed:", e);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: e.message || "Sync failed" })}\n\n`));
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
