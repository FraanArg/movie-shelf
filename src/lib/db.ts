import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export interface MovieItem {
    id: number | string;
    imdbId: string;
    title: string;
    year: string;
    posterUrl: string | null;
    type: "movie" | "series";
    source: "trakt" | "local";
    date: string; // ISO date string
    list?: "watched" | "watchlist";
    // Extended Metadata
    Actors?: string;
    Director?: string;
    Plot?: string;
    Genre?: string;
    Runtime?: string;
    imdbRating?: string;
    plays?: number;
}

// In-Memory Cache
let dbCache: MovieItem[] | null = null;

export const getDB = async (): Promise<MovieItem[]> => {
    if (dbCache) return dbCache;

    try {
        const data = await fs.readFile(DB_PATH, "utf-8");
        dbCache = JSON.parse(data);
        return dbCache || [];
    } catch (error) {
        // If file doesn't exist, return empty array
        return [];
    }
};

export const saveDB = async (items: MovieItem[]) => {
    const dir = path.dirname(DB_PATH);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }

    // Update Cache
    dbCache = items;

    await fs.writeFile(DB_PATH, JSON.stringify(items, null, 2));
};

export const addToDB = async (newItems: MovieItem[]) => {
    const current = await getDB();
    const existingIds = new Set(current.map((i) => i.imdbId || i.id));

    const uniqueNew = newItems.filter((i) => !existingIds.has(i.imdbId || i.id));

    if (uniqueNew.length > 0) {
        const updated = [...current, ...uniqueNew];
        await saveDB(updated);
        return updated;
    }
    return current;
};

export const updateDB = async (items: MovieItem[]) => {
    // Full replace/update logic if needed, usually saveDB is enough
    await saveDB(items);
};
