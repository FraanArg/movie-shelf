import { NextRequest, NextResponse } from "next/server";
import { getSimilarMovies, getRecommendedMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const imdbId = searchParams.get("imdbId");

    if (!imdbId) {
        return NextResponse.json({ error: "imdbId required" }, { status: 400 });
    }

    try {
        // Try recommendations first, fall back to similar
        let movies = await getRecommendedMovies(imdbId);
        if (movies.length === 0) {
            movies = await getSimilarMovies(imdbId);
        }

        return NextResponse.json({ movies });
    } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
    }
}
