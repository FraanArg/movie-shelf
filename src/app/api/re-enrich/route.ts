import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDB, saveDB, MovieItem } from "@/lib/db";
import { getMovieInfoForSync } from "@/lib/tmdb";

// Smaller batch to avoid Vercel timeout (10 seconds limit)
const BATCH_SIZE = 5;

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get("trakt_access_token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const items = await getDB();

        // Find items missing Director data (what Stats page uses)
        const needsEnrichment = items.filter(item =>
            item.imdbId && // Has IMDB ID so we can look it up
            (!item.Director || item.Director === "N/A")
        );

        if (needsEnrichment.length === 0) {
            return NextResponse.json({
                success: true,
                message: "All items already have Director/Actor data!",
                enriched: 0,
                remaining: 0,
            });
        }

        // Process a small batch sequentially to avoid timeout
        const batch = needsEnrichment.slice(0, BATCH_SIZE);
        const remaining = needsEnrichment.length - batch.length;

        // Create map of updates
        const updates: Map<string, any> = new Map();
        let enrichedCount = 0;
        const debugInfo: any[] = [];

        // Process SEQUENTIALLY (one at a time) to avoid rate limits/timeouts
        for (const item of batch) {
            if (!item.imdbId) continue;

            try {
                console.log(`Enriching: ${item.title} (${item.imdbId})`);
                const tmdbData = await getMovieInfoForSync(item.imdbId);

                debugInfo.push({
                    title: item.title,
                    imdbId: item.imdbId,
                    gotData: !!tmdbData,
                    director: tmdbData?.director,
                    actors: tmdbData?.actors?.slice(0, 50),
                });

                if (tmdbData && tmdbData.director && tmdbData.director !== "N/A") {
                    enrichedCount++;
                    updates.set(item.imdbId, {
                        Director: tmdbData.director,
                        Actors: tmdbData.actors || "N/A",
                        Genre: tmdbData.genres || item.Genre,
                        Plot: tmdbData.plot || item.Plot,
                        Runtime: tmdbData.runtime || item.Runtime,
                        posterUrl: tmdbData.posterUrl || item.posterUrl,
                        tmdbRating: tmdbData.tmdbRating || item.tmdbRating,
                    });
                }
            } catch (e: any) {
                console.error(`Failed to enrich ${item.title}:`, e);
                debugInfo.push({
                    title: item.title,
                    imdbId: item.imdbId,
                    error: e.message,
                });
            }
        }

        // Apply updates to items
        if (updates.size > 0) {
            const updatedItems = items.map(item => {
                const update = item.imdbId ? updates.get(item.imdbId) : null;
                if (update) {
                    return { ...item, ...update };
                }
                return item;
            });
            await saveDB(updatedItems as MovieItem[]);
        }

        return NextResponse.json({
            success: true,
            enriched: enrichedCount,
            remaining: remaining,
            totalNeedingEnrichment: needsEnrichment.length,
            debug: debugInfo,
            message: remaining > 0
                ? `Enriched ${enrichedCount} items. ${remaining} more to go.`
                : `All done! Enriched ${enrichedCount} items.`,
        });

    } catch (e: any) {
        console.error("Re-enrich failed:", e);
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}

// GET to check how many items need enrichment
export async function GET() {
    try {
        const items = await getDB();

        const needsEnrichment = items.filter(item =>
            item.imdbId &&
            (!item.Director || item.Director === "N/A")
        );

        const moviesMissing = needsEnrichment.filter(i => i.type === "movie");
        const showsMissing = needsEnrichment.filter(i => i.type === "series");

        // Get sample with IMDB IDs to debug
        const sampleWithIds = needsEnrichment.slice(0, 10).map(i => ({
            title: i.title,
            type: i.type,
            imdbId: i.imdbId,
            director: i.Director,
        }));

        return NextResponse.json({
            totalNeedingEnrichment: needsEnrichment.length,
            moviesMissing: moviesMissing.length,
            showsMissing: showsMissing.length,
            sampleWithIds,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
