import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

// Debug endpoint to check a specific director's films
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const director = searchParams.get("director") || "Christopher Nolan";

    try {
        const items = await getDB();

        // All items mentioning this director
        const directorFilms = items.filter(item =>
            item.Director && item.Director.includes(director)
        );

        // Watched only
        const watchedFilms = directorFilms.filter(item => item.list !== "watchlist");

        // Films with N/A or missing director
        const missingDirector = items.filter(item =>
            !item.Director || item.Director === "N/A"
        );

        // Search for films that SHOULD be this director but might have wrong data
        const possibleNolan = items.filter(item => {
            const title = item.title?.toLowerCase() || "";
            return (
                title.includes("dark knight") ||
                title.includes("inception") ||
                title.includes("interstellar") ||
                title.includes("dunkirk") ||
                title.includes("tenet") ||
                title.includes("oppenheimer") ||
                title.includes("memento") ||
                title.includes("prestige") ||
                title.includes("insomnia") ||
                title.includes("following")
            );
        });

        return NextResponse.json({
            searchedDirector: director,
            foundCount: directorFilms.length,
            watchedCount: watchedFilms.length,
            films: directorFilms.map(f => ({
                title: f.title,
                year: f.year,
                director: f.Director,
                list: f.list,
                source: f.source,
            })),
            watchedFilms: watchedFilms.map(f => f.title),
            possibleNolanFilms: possibleNolan.map(f => ({
                title: f.title,
                director: f.Director,
                list: f.list,
            })),
            totalItemsWithMissingDirector: missingDirector.length,
            sampleMissingDirector: missingDirector.slice(0, 10).map(f => f.title),
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
