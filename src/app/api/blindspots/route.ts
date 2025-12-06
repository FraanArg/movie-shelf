import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getTopRatedMovies } from "@/lib/tmdb";

// IMDb IDs of the user's collection
async function getUserImdbIds(): Promise<Set<string>> {
    const items = await getDB();
    const ids = new Set<string>();
    items.forEach(item => {
        if (item.imdbId) {
            ids.add(item.imdbId);
        }
    });
    return ids;
}

export async function GET() {
    try {
        const userMovieIds = await getUserImdbIds();

        // Get top rated movies from multiple pages to have more options
        const [page1, page2, page3] = await Promise.all([
            getTopRatedMovies(1),
            getTopRatedMovies(2),
            getTopRatedMovies(3),
        ]);

        const allTopRated = [...page1, ...page2, ...page3];

        // Filter out movies the user already has
        // Note: We'll need to match by title/year since TMDb uses different IDs
        // For now, we'll return all top rated and filter client-side or show all
        const blindspots = allTopRated.map(movie => ({
            id: movie.id,
            title: movie.title,
            posterPath: movie.poster_path,
            year: movie.release_date?.split("-")[0] || "N/A",
            rating: movie.vote_average,
            overview: movie.overview,
        }));

        return NextResponse.json({
            success: true,
            blindspots,
            userCollectionSize: userMovieIds.size,
        });
    } catch (error) {
        console.error("Failed to fetch blind spots:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch blind spots" }, { status: 500 });
    }
}
