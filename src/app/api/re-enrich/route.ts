import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDB, saveDB, MovieItem } from "@/lib/db";
import { getMovieInfoForSync } from "@/lib/tmdb";

// Re-enrich items that have missing Director/Actor data
const BATCH_SIZE = 50;

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get("trakt_access_token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const items = await getDB();

        // Find items missing Director or Actors data
        const needsEnrichment = items.filter(item =>
            item.imdbId && // Has IMDB ID so we can look it up
            (!item.Director || item.Director === "N/A" || !item.Actors || item.Actors === "N/A")
        );

        console.log(`Found ${needsEnrichment.length} items needing enrichment`);

        if (needsEnrichment.length === 0) {
            return NextResponse.json({
                success: true,
                message: "All items already have Director/Actor data!",
                enriched: 0,
                remaining: 0,
            });
        }

        // Process a batch
        const batch = needsEnrichment.slice(0, BATCH_SIZE);
        const remaining = needsEnrichment.length - batch.length;

        let enrichedCount = 0;
        const updatedItems = await Promise.all(items.map(async (item) => {
            // Only enrich items in our batch
            const needsUpdate = batch.some(b => b.imdbId === item.imdbId);
            if (!needsUpdate || !item.imdbId) return item;

            try {
                const tmdbData = await getMovieInfoForSync(item.imdbId);
                if (tmdbData) {
                    enrichedCount++;
                    return {
                        ...item,
                        Director: tmdbData.director || item.Director,
                        Actors: tmdbData.actors || item.Actors,
                        Genre: tmdbData.genres || item.Genre,
                        Plot: tmdbData.plot || item.Plot,
                        Runtime: tmdbData.runtime || item.Runtime,
                        posterUrl: tmdbData.posterUrl || item.posterUrl,
                        tmdbRating: tmdbData.tmdbRating || item.tmdbRating,
                    };
                }
            } catch (e) {
                console.error(`Failed to enrich ${item.title}:`, e);
            }
            return item;
        }));

        await saveDB(updatedItems as MovieItem[]);

        return NextResponse.json({
            success: true,
            enriched: enrichedCount,
            remaining: remaining,
            message: remaining > 0
                ? `Enriched ${enrichedCount} items. Click again (${remaining} more need enrichment)`
                : `All done! Enriched ${enrichedCount} items.`,
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

        const needsEnrichment = items.filter(item =>
            item.imdbId &&
            (!item.Director || item.Director === "N/A" || !item.Actors || item.Actors === "N/A")
        );

        const moviesMissing = needsEnrichment.filter(i => i.type === "movie");
        const showsMissing = needsEnrichment.filter(i => i.type === "series");

        return NextResponse.json({
            totalNeedingEnrichment: needsEnrichment.length,
            moviesMissing: moviesMissing.length,
            showsMissing: showsMissing.length,
            sampleTitles: needsEnrichment.slice(0, 15).map(i => ({
                title: i.title,
                type: i.type,
                director: i.Director,
            })),
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
