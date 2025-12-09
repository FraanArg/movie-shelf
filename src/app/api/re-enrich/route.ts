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

        // Find items that need enrichment AND haven't been attempted yet
        const needsEnrichment = items.filter(item =>
            item.imdbId &&
            (!item.Director || item.Director === "N/A") &&
            !item.enrichAttempted // Skip items we've already tried
        );

        if (needsEnrichment.length === 0) {
            // Check if there are items with N/A that were attempted
            const attemptedButFailed = items.filter(item =>
                item.imdbId &&
                (!item.Director || item.Director === "N/A") &&
                item.enrichAttempted
            );

            return NextResponse.json({
                success: true,
                message: attemptedButFailed.length > 0
                    ? `Done! ${attemptedButFailed.length} items couldn't be found on TMDb.`
                    : "All items have Director data!",
                enriched: 0,
                remaining: 0,
                unfixable: attemptedButFailed.length,
            });
        }

        // Process a small batch sequentially
        const batch = needsEnrichment.slice(0, BATCH_SIZE);
        const remaining = needsEnrichment.length - batch.length;

        const updates: Map<string, any> = new Map();
        let enrichedCount = 0;
        let attemptedCount = 0;

        for (const item of batch) {
            if (!item.imdbId) continue;
            attemptedCount++;

            try {
                const tmdbData = await getMovieInfoForSync(item.imdbId);

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
                        enrichAttempted: true, // Mark as successfully enriched
                    });
                } else {
                    // TMDb couldn't find director - mark as attempted so we skip next time
                    updates.set(item.imdbId, {
                        enrichAttempted: true,
                    });
                }
            } catch (e: any) {
                console.error(`Failed to enrich ${item.title}:`, e);
                // Mark as attempted even on error
                updates.set(item.imdbId, {
                    enrichAttempted: true,
                });
            }
        }

        // Apply updates
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
            attempted: attemptedCount,
            remaining: remaining,
            totalNeedingEnrichment: needsEnrichment.length,
            message: `Enriched ${enrichedCount}/${attemptedCount} items. ${remaining} left to check.`,
        });

    } catch (e: any) {
        console.error("Re-enrich failed:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// GET to check how many items need enrichment
export async function GET() {
    try {
        const items = await getDB();

        // Not attempted yet
        const needsEnrichment = items.filter(item =>
            item.imdbId &&
            (!item.Director || item.Director === "N/A") &&
            !item.enrichAttempted
        );

        // Attempted but TMDb had no data
        const attemptedButFailed = items.filter(item =>
            item.imdbId &&
            (!item.Director || item.Director === "N/A") &&
            item.enrichAttempted
        );

        const moviesMissing = needsEnrichment.filter(i => i.type === "movie");
        const showsMissing = needsEnrichment.filter(i => i.type === "series");

        return NextResponse.json({
            totalNeedingEnrichment: needsEnrichment.length,
            moviesMissing: moviesMissing.length,
            showsMissing: showsMissing.length,
            alreadyAttempted: attemptedButFailed.length,
            sampleWithIds: needsEnrichment.slice(0, 5).map(i => ({
                title: i.title,
                type: i.type,
                imdbId: i.imdbId,
            })),
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
