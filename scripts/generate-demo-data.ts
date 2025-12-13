/**
 * Script to generate demo data for unauthenticated users.
 * Fetches top 50 movies and top 50 TV shows from TMDb.
 * 
 * Run with: npx tsx scripts/generate-demo-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
    console.error("❌ TMDB_API_KEY environment variable is required");
    process.exit(1);
}

interface MovieItem {
    id: number | string;
    imdbId: string;
    title: string;
    year: string;
    posterUrl: string | null;
    type: "movie" | "series";
    source: "trakt" | "local";
    date: string;
    list: "watched";
    Actors?: string;
    Director?: string;
    Plot?: string;
    Genre?: string;
    Runtime?: string;
    tmdbRating?: number;
    imdbRating?: string;
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return response.json();
            }
            if (response.status === 429) {
                // Rate limited, wait and retry
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
                continue;
            }
            throw new Error(`HTTP ${response.status}`);
        } catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, 500));
        }
    }
}

async function getTopRatedMovies(pages: number = 3): Promise<any[]> {
    const movies: any[] = [];
    for (let page = 1; page <= pages; page++) {
        const data = await fetchWithRetry(
            `${TMDB_API_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
        );
        movies.push(...data.results);
        await new Promise(r => setTimeout(r, 250)); // Rate limit
    }
    return movies.slice(0, 50);
}

async function getTopRatedTVShows(pages: number = 3): Promise<any[]> {
    const shows: any[] = [];
    for (let page = 1; page <= pages; page++) {
        const data = await fetchWithRetry(
            `${TMDB_API_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
        );
        shows.push(...data.results);
        await new Promise(r => setTimeout(r, 250)); // Rate limit
    }
    return shows.slice(0, 50);
}

async function getMovieDetails(tmdbId: number): Promise<any> {
    return fetchWithRetry(
        `${TMDB_API_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,external_ids`
    );
}

async function getTVShowDetails(tmdbId: number): Promise<any> {
    return fetchWithRetry(
        `${TMDB_API_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,external_ids`
    );
}

function formatMovieItem(details: any, type: "movie" | "series"): MovieItem {
    const isTV = type === "series";

    // Get director(s) or creator(s)
    let director = "N/A";
    if (isTV) {
        director = details.created_by?.map((c: any) => c.name).slice(0, 2).join(", ") || "N/A";
    } else {
        director = details.credits?.crew
            ?.filter((c: any) => c.job === "Director")
            ?.map((c: any) => c.name)
            ?.slice(0, 2)
            ?.join(", ") || "N/A";
    }

    // Get top 5 actors
    const actors = details.credits?.cast
        ?.slice(0, 5)
        ?.map((a: any) => a.name)
        ?.join(", ") || "N/A";

    // Get genres
    const genres = details.genres?.map((g: any) => g.name)?.join(", ") || "N/A";

    // Get runtime
    let runtime = "N/A";
    if (isTV) {
        runtime = details.episode_run_time?.[0]
            ? `${details.episode_run_time[0]} min`
            : "N/A";
    } else {
        runtime = details.runtime ? `${details.runtime} min` : "N/A";
    }

    // Generate a random "watched" date within the last 2 years
    const randomDaysAgo = Math.floor(Math.random() * 730);
    const watchedDate = new Date();
    watchedDate.setDate(watchedDate.getDate() - randomDaysAgo);

    return {
        id: details.id,
        imdbId: details.external_ids?.imdb_id || details.imdb_id || `tmdb-${details.id}`,
        title: isTV ? details.name : details.title,
        year: (isTV ? details.first_air_date : details.release_date)?.split("-")[0] || "N/A",
        posterUrl: details.poster_path
            ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
            : null,
        type,
        source: "local",
        date: watchedDate.toISOString(),
        list: "watched",
        Actors: actors,
        Director: director,
        Plot: details.overview || "N/A",
        Genre: genres,
        Runtime: runtime,
        tmdbRating: details.vote_average || 0,
        imdbRating: details.vote_average ? (details.vote_average).toFixed(1) : undefined,
    };
}

async function main() {
    console.log("🎬 Fetching top rated movies...");
    const movies = await getTopRatedMovies(3);
    console.log(`   Found ${movies.length} movies`);

    console.log("📺 Fetching top rated TV shows...");
    const shows = await getTopRatedTVShows(3);
    console.log(`   Found ${shows.length} shows`);

    const demoItems: MovieItem[] = [];

    console.log("\n🔍 Enriching movies with details...");
    for (let i = 0; i < movies.length; i++) {
        const movie = movies[i];
        try {
            const details = await getMovieDetails(movie.id);
            demoItems.push(formatMovieItem(details, "movie"));
            process.stdout.write(`\r   Progress: ${i + 1}/${movies.length}`);
            await new Promise(r => setTimeout(r, 100)); // Rate limit
        } catch (err) {
            console.error(`\n   ⚠️ Failed to fetch details for ${movie.title}`);
        }
    }
    console.log("\n   ✅ Movies enriched");

    console.log("\n🔍 Enriching TV shows with details...");
    for (let i = 0; i < shows.length; i++) {
        const show = shows[i];
        try {
            const details = await getTVShowDetails(show.id);
            demoItems.push(formatMovieItem(details, "series"));
            process.stdout.write(`\r   Progress: ${i + 1}/${shows.length}`);
            await new Promise(r => setTimeout(r, 100)); // Rate limit
        } catch (err) {
            console.error(`\n   ⚠️ Failed to fetch details for ${show.name}`);
        }
    }
    console.log("\n   ✅ TV shows enriched");

    // Sort by TMDb rating (highest first)
    demoItems.sort((a, b) => (b.tmdbRating || 0) - (a.tmdbRating || 0));

    // Save to file
    const outputPath = path.join(process.cwd(), "src", "data", "demo-library.json");
    fs.writeFileSync(outputPath, JSON.stringify(demoItems, null, 2));

    console.log(`\n✨ Demo data saved to ${outputPath}`);
    console.log(`   Total items: ${demoItems.length}`);
    console.log(`   Movies: ${demoItems.filter(i => i.type === "movie").length}`);
    console.log(`   TV Shows: ${demoItems.filter(i => i.type === "series").length}`);
}

main().catch(console.error);
