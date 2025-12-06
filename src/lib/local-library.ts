import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "src", "data", "library.json");

export interface LocalMovie {
    id: string; // imdbID
    title: string;
    year: string;
    posterUrl: string;
    type: "movie" | "series";
    addedAt: number;
}

async function ensureDb() {
    try {
        await fs.access(DB_PATH);
    } catch {
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
        await fs.writeFile(DB_PATH, JSON.stringify([]));
    }
}

export async function getLocalMovies(): Promise<LocalMovie[]> {
    await ensureDb();
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
}

export async function addLocalMovie(movie: Omit<LocalMovie, "addedAt">) {
    await ensureDb();
    const movies = await getLocalMovies();

    if (movies.some((m) => m.id === movie.id)) {
        return; // Already exists
    }

    const newMovie = { ...movie, addedAt: Date.now() };
    movies.unshift(newMovie);

    await fs.writeFile(DB_PATH, JSON.stringify(movies, null, 2));
    return newMovie;
}

export async function removeLocalMovie(id: string) {
    await ensureDb();
    const movies = await getLocalMovies();
    const filtered = movies.filter((m) => m.id !== id);
    await fs.writeFile(DB_PATH, JSON.stringify(filtered, null, 2));
}
