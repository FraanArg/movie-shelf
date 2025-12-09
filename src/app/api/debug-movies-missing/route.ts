import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

// Debug to show movies with missing director data
export async function GET() {
    try {
        const items = await getDB();

        // Find MOVIES (not shows) missing Director data
        const moviesMissing = items.filter(item =>
            item.imdbId &&
            item.type === "movie" &&
            (!item.Director || item.Director === "N/A")
        );

        return NextResponse.json({
            totalMoviesMissing: moviesMissing.length,
            sample: moviesMissing.slice(0, 10).map(i => ({
                title: i.title,
                year: i.year,
                imdbId: i.imdbId,
                director: i.Director,
                source: i.source,
            })),
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
