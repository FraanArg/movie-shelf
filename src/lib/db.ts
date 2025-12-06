import { kv } from "@vercel/kv";
import fs from "fs/promises";
import path from "path";

const DB_KEY = "movies";
const LOCAL_DB_PATH = path.join(process.cwd(), "data", "db.json");

// Check if we're running on Vercel with KV configured
const isVercelKV = !!process.env.KV_REST_API_URL;

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
    // Ratings
    tmdbRating?: number;
    imdbRating?: string;
    rtRating?: string;
    Metascore?: string;
    plays?: number;
}

// In-Memory Cache for local development
let localCache: MovieItem[] | null = null;

// ============ VERCEL KV FUNCTIONS ============
async function getFromKV(): Promise<MovieItem[]> {
    try {
        const data = await kv.get<MovieItem[]>(DB_KEY);
        return data || [];
    } catch (error) {
        console.error("KV get error:", error);
        return [];
    }
}

async function saveToKV(items: MovieItem[]): Promise<void> {
    try {
        await kv.set(DB_KEY, items);
    } catch (error) {
        console.error("KV set error:", error);
        throw error;
    }
}

// ============ LOCAL FILE FUNCTIONS ============
async function getFromFile(): Promise<MovieItem[]> {
    if (localCache) return localCache;

    try {
        const data = await fs.readFile(LOCAL_DB_PATH, "utf-8");
        localCache = JSON.parse(data);
        return localCache || [];
    } catch (error) {
        return [];
    }
}

async function saveToFile(items: MovieItem[]): Promise<void> {
    const dir = path.dirname(LOCAL_DB_PATH);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
    localCache = items;
    await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(items, null, 2));
}

// ============ UNIFIED API ============
export const getDB = async (): Promise<MovieItem[]> => {
    if (isVercelKV) {
        return getFromKV();
    }
    return getFromFile();
};

export const saveDB = async (items: MovieItem[]): Promise<void> => {
    if (isVercelKV) {
        return saveToKV(items);
    }
    return saveToFile(items);
};

export const addToDB = async (newItems: MovieItem[]): Promise<MovieItem[]> => {
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

export const updateDB = async (items: MovieItem[]): Promise<void> => {
    await saveDB(items);
};
