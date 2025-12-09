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

export interface TMDbMovieDetails {
    id: number;
    imdb_id: string | null;
    title: string;
    original_title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    overview: string;
    runtime: number | null;
    genres: { id: number; name: string }[];
    production_companies: { id: number; name: string }[];
    tagline: string | null;
    status: string;
    credits?: {
        cast: { id: number; name: string; character: string; profile_path: string | null; order: number }[];
        crew: { id: number; name: string; job: string; department: string }[];
    };
}

/**
 * Get full movie details from TMDb using an IMDb ID
 */
export async function getMovieDetails(imdbId: string): Promise<TMDbMovieDetails | null> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
        console.error("TMDB_API_KEY not configured");
        return null;
    }

    try {
        // First, find the TMDb ID from the IMDb ID
        const findResponse = await fetch(
            `${TMDB_API_URL}/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`,
            { next: { revalidate: 3600 } }
        );

        if (!findResponse.ok) {
            console.error("Failed to find movie on TMDb");
            return null;
        }

        const findData = await findResponse.json();
        const tmdbMovie = findData.movie_results?.[0] || findData.tv_results?.[0];

        if (!tmdbMovie) {
            console.error("Movie not found on TMDb for:", imdbId);
            return null;
        }

        // Get full movie details with credits
        const isTV = !!findData.tv_results?.[0];
        const endpoint = isTV ? "tv" : "movie";

        const detailsResponse = await fetch(
            `${TMDB_API_URL}/${endpoint}/${tmdbMovie.id}?api_key=${apiKey}&append_to_response=credits`,
            { next: { revalidate: 3600 } }
        );

        if (!detailsResponse.ok) {
            console.error("Failed to fetch movie details");
            return null;
        }

        const details = await detailsResponse.json();

        // Normalize TV show response to movie format
        if (isTV) {
            return {
                ...details,
                title: details.name || details.original_name,
                original_title: details.original_name,
                release_date: details.first_air_date,
                runtime: details.episode_run_time?.[0] || null,
            };
        }

        return details;
    } catch (error) {
        console.error("TMDb API error:", error);
        return null;
    }
}

// Known extended edition runtimes (in minutes)
// These are hardcoded because TMDb only has theatrical runtimes
const EXTENDED_EDITION_RUNTIMES: Record<string, number> = {
    // Lord of the Rings Extended Editions
    "the lord of the rings: the fellowship of the ring": 228,
    "the lord of the rings: the two towers": 235,
    "the lord of the rings: the return of the king": 263,
    // The Hobbit Extended Editions
    "the hobbit: an unexpected journey": 182,
    "the hobbit: the desolation of smaug": 186,
    "the hobbit: the battle of the five armies": 164,
    // Other notable extended editions
    "avatar": 178, // Extended Collector's Edition
    "aliens": 154, // Special Edition
    "the abyss": 171, // Special Edition
    "kingdom of heaven": 194, // Director's Cut
    "watchmen": 215, // Ultimate Cut
    "batman v superman: dawn of justice": 183, // Ultimate Edition
    "justice league": 242, // Zack Snyder's Justice League
    "apocalypse now": 202, // Redux
    "blade runner": 117, // Final Cut
    "the godfather part iii": 170, // Coda: The Death of Michael Corleone
    "amadeus": 180, // Director's Cut
    "das boot": 293, // Director's Cut
    "dune": 190, // Extended TV Version (1984)
};

/**
 * Get the known extended edition runtime for a title, or null if not in our lookup
 */
function getKnownExtendedRuntime(title: string): number | null {
    const normalizedTitle = title
        .toLowerCase()
        .replace(/\s*\(extended\)|\s*\(extended edition\)|\s*\(director's cut\)|\s*\(special edition\)|\s*\(ultimate edition\)|\s*\(final cut\)|\s*\(redux\)/gi, "")
        .trim();

    return EXTENDED_EDITION_RUNTIMES[normalizedTitle] || null;
}

/**
 * Search for a movie by title and year, returns IMDB ID and basic info
 * Useful for movies that don't have an IMDB ID in Trakt (like extended editions)
 */
export async function searchMovieByTitle(title: string, year?: string): Promise<{
    imdbId: string | null;
    tmdbId: number | null;
    runtime: number | null;
    posterUrl: string | null;
} | null> {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) return null;

    try {
        // Check if we have a known extended edition runtime
        const knownRuntime = getKnownExtendedRuntime(title);

        // Clean up title - remove "(Extended)", "(Director's Cut)", etc. for better search
        const cleanTitle = title
            .replace(/\s*\(Extended\)|\s*\(Extended Edition\)|\s*\(Director's Cut\)|\s*\(Special Edition\)|\s*\(Ultimate Edition\)|\s*\(Final Cut\)|\s*\(Redux\)/gi, "")
            .trim();

        const yearParam = year ? `&year=${year}` : "";
        const searchResponse = await fetch(
            `${TMDB_API_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}${yearParam}`,
            { next: { revalidate: 3600 } }
        );

        if (!searchResponse.ok) return null;

        const searchData = await searchResponse.json();
        const match = searchData.results?.[0];

        if (!match) return null;

        // Get full details including IMDB ID
        const detailsResponse = await fetch(
            `${TMDB_API_URL}/movie/${match.id}?api_key=${apiKey}`,
            { next: { revalidate: 3600 } }
        );

        if (!detailsResponse.ok) return null;

        const details = await detailsResponse.json();

        // Use known extended runtime if available, otherwise estimate
        let runtime = details.runtime;
        if (knownRuntime) {
            runtime = knownRuntime;
        } else if (title.toLowerCase().includes("extended") && runtime) {
            // Fallback: assume extended is ~20% longer than theatrical
            runtime = Math.round(runtime * 1.2);
        }

        return {
            imdbId: details.imdb_id || null,
            tmdbId: match.id,
            runtime: runtime,
            posterUrl: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
        };
    } catch (error) {
        console.error("TMDb search error:", error);
        return null;
    }
}

/**
 * Get basic movie info for sync (lighter than full details)
 */
export async function getMovieInfoForSync(imdbId: string): Promise<{
    posterUrl: string | null;
    genres: string;
    runtime: string;
    director: string;
    actors: string;
    plot: string;
    tmdbRating: number;
    country: string;
    language: string;
    production: string;
    writer: string;
} | null> {
    const details = await getMovieDetails(imdbId);
    if (!details) return null;

    // For movies: get Director from crew
    // For TV shows: use created_by field
    let directors = details.credits?.crew
        ?.filter(c => c.job === "Director")
        ?.map(c => c.name)
        ?.slice(0, 3)
        ?.join(", ") || "";

    // If no directors found (TV shows), try created_by
    if (!directors && (details as any).created_by?.length > 0) {
        directors = (details as any).created_by
            .map((c: any) => c.name)
            .slice(0, 3)
            .join(", ");
    }

    // If still no directors, try executive producers for TV
    if (!directors && details.credits?.crew && details.credits.crew.length > 0) {
        const fallbackDirectors = details.credits.crew
            .filter(c => c.job === "Executive Producer" || c.department === "Directing")
            .slice(0, 2)
            .map(c => c.name)
            .join(", ");
        if (fallbackDirectors) directors = fallbackDirectors;
    }

    if (!directors) directors = "N/A";

    const actors = details.credits?.cast
        ?.slice(0, 5)
        ?.map(c => c.name)
        ?.join(", ") || "N/A";

    // Get writers (Screenplay, Writer, Story)
    const writers = details.credits?.crew
        ?.filter(c => c.job === "Screenplay" || c.job === "Writer" || c.job === "Story" || c.department === "Writing")
        ?.slice(0, 3)
        ?.map(c => c.name)
        ?.join(", ") || "N/A";

    // Get production companies
    const production = details.production_companies
        ?.slice(0, 2)
        ?.map(c => c.name)
        ?.join(", ") || "N/A";

    // Get country and language from extended details
    const country = (details as any).production_countries
        ?.slice(0, 2)
        ?.map((c: any) => c.name || c.iso_3166_1)
        ?.join(", ") || "N/A";

    const language = (details as any).spoken_languages
        ?.slice(0, 2)
        ?.map((l: any) => l.english_name || l.name || l.iso_639_1)
        ?.join(", ") || "N/A";

    return {
        posterUrl: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
        genres: details.genres?.map(g => g.name)?.join(", ") || "N/A",
        runtime: details.runtime ? `${details.runtime} min` : "N/A",
        director: directors,
        actors: actors,
        plot: details.overview || "N/A",
        tmdbRating: details.vote_average || 0,
        country: country,
        language: language,
        production: production,
        writer: writers,
    };
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

