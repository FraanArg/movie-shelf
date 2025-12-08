import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "src", "data", "library.json");

// Check if we're running on Vercel (serverless - read-only filesystem)
const isVercel = !!process.env.VERCEL;

export interface LocalMovie {
    id: string; // imdbID
    title: string;
    year: string;
    posterUrl: string;
    type: "movie" | "series";
    addedAt: number;
}

// In-memory cache for Vercel
let memoryCache: LocalMovie[] | null = null;

async function ensureDb() {
    // On Vercel, we can't write files - use memory cache
    if (isVercel) {
        if (memoryCache === null) {
            memoryCache = [];
        }
        return;
    }

    try {
        await fs.access(DB_PATH);
    } catch {
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
        await fs.writeFile(DB_PATH, JSON.stringify([]));
    }
}

export async function getLocalMovies(): Promise<LocalMovie[]> {
    // On Vercel, return from memory cache
    if (isVercel) {
        if (memoryCache === null) {
            memoryCache = [];
        }
        return memoryCache;
    }

    await ensureDb();
    try {
        const data = await fs.readFile(DB_PATH, "utf-8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export async function addLocalMovie(movie: Omit<LocalMovie, "addedAt">) {
    const movies = await getLocalMovies();

    if (movies.some((m) => m.id === movie.id)) {
        return; // Already exists
    }

    const newMovie = { ...movie, addedAt: Date.now() };
    movies.unshift(newMovie);

    // On Vercel, just update memory cache
    if (isVercel) {
        memoryCache = movies;
        return newMovie;
    }

    await fs.writeFile(DB_PATH, JSON.stringify(movies, null, 2));
    return newMovie;
}

export async function removeLocalMovie(id: string) {
    const movies = await getLocalMovies();
    const filtered = movies.filter((m) => m.id !== id);

    // On Vercel, just update memory cache
    if (isVercel) {
        memoryCache = filtered;
        return;
    }

    await fs.writeFile(DB_PATH, JSON.stringify(filtered, null, 2));
}
