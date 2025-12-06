const TMDB_API_URL = "https://api.themoviedb.org/3";

export interface TMDbMovie {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
    overview: string;
}

export interface TMDbSimilarResponse {
    results: TMDbMovie[];
}

/**
 * Get similar movies from TMDb using an IMDb ID
 */
export async function getSimilarMovies(imdbId: string): Promise<TMDbMovie[]> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
        console.error("TMDB_API_KEY not configured");
        return [];
    }

    try {
        // First, find the TMDb ID from the IMDb ID
        const findResponse = await fetch(
            `${TMDB_API_URL}/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!findResponse.ok) {
            console.error("Failed to find movie on TMDb");
            return [];
        }

        const findData = await findResponse.json();
        const tmdbMovie = findData.movie_results?.[0];

        if (!tmdbMovie) {
            console.error("Movie not found on TMDb");
            return [];
        }

        // Get similar movies
        const similarResponse = await fetch(
            `${TMDB_API_URL}/movie/${tmdbMovie.id}/similar?api_key=${apiKey}&language=en-US&page=1`,
            { next: { revalidate: 3600 } }
        );

        if (!similarResponse.ok) {
            console.error("Failed to fetch similar movies");
            return [];
        }

        const similarData: TMDbSimilarResponse = await similarResponse.json();
        return similarData.results.slice(0, 10); // Return top 10 similar movies
    } catch (error) {
        console.error("TMDb API error:", error);
        return [];
    }
}

/**
 * Get top rated movies (for Blind Spot Finder)
 */
export async function getTopRatedMovies(page = 1): Promise<TMDbMovie[]> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
        console.error("TMDB_API_KEY not configured");
        return [];
    }

    try {
        const response = await fetch(
            `${TMDB_API_URL}/movie/top_rated?api_key=${apiKey}&language=en-US&page=${page}`,
            { next: { revalidate: 86400 } } // Cache for 24 hours
        );

        if (!response.ok) {
            console.error("Failed to fetch top rated movies");
            return [];
        }

        const data: TMDbSimilarResponse = await response.json();
        return data.results;
    } catch (error) {
        console.error("TMDb API error:", error);
        return [];
    }
}

/**
 * Get TMDb poster URL from a poster path
 */
export function getTMDbPosterUrl(posterPath: string | null, size: "w185" | "w342" | "w500" = "w342"): string | null {
    if (!posterPath) return null;
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}

/**
 * Get movie recommendations (alternative to similar)
 */
export async function getRecommendedMovies(imdbId: string): Promise<TMDbMovie[]> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return [];

    try {
        // First, find the TMDb ID
        const findResponse = await fetch(
            `${TMDB_API_URL}/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`,
            { next: { revalidate: 3600 } }
        );

        if (!findResponse.ok) return [];

        const findData = await findResponse.json();
        const tmdbMovie = findData.movie_results?.[0];

        if (!tmdbMovie) return [];

        // Get recommendations
        const recResponse = await fetch(
            `${TMDB_API_URL}/movie/${tmdbMovie.id}/recommendations?api_key=${apiKey}&language=en-US&page=1`,
            { next: { revalidate: 3600 } }
        );

        if (!recResponse.ok) return [];

        const recData: TMDbSimilarResponse = await recResponse.json();
        return recData.results.slice(0, 8);
    } catch (error) {
        console.error("TMDb API error:", error);
        return [];
    }
}
