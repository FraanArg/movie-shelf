import { kv } from "@vercel/kv";
import fs from "fs/promises";
import path from "path";

const DB_KEY = "movies";
const LOCAL_DB_PATH = path.join(process.cwd(), "data", "db.json");

// Check if we're running on Vercel (serverless - read-only filesystem)
// VERCEL env var is always set on Vercel deployments
const isVercel = !!process.env.VERCEL;
const hasKV = !!process.env.KV_REST_API_URL;

export interface MovieItem {
    id: number | string;
    imdbId: string;
    title: string;
    year: string;
    posterUrl: string | null;
    type: "movie" | "series";
    source: "trakt" | "local";
    date: string; // ISO date string
    list?: "watched" | "watchlist" | "watching";
    // Extended Metadata
    Actors?: string;
    Director?: string;
    Plot?: string;
    Genre?: string;
    Runtime?: string;
    // NEW: Additional metadata for stats
    Country?: string;
    Language?: string;
    Production?: string;  // Production company/studio
    Writer?: string;      // Writers (can include composers for some entries)
    // Ratings
    tmdbRating?: number;
    imdbRating?: string;
    rtRating?: string;
    Metascore?: string;
    plays?: number;
    // User Personal Data
    userRating?: number; // 1-5 star rating
    userNote?: string; // Personal review/notes
    traktRating?: number; // 1-10 scale from Trakt
    // TV Show Progress
    totalEpisodes?: number;
    watchedEpisodes?: number;
    totalSeasons?: number;
    currentSeason?: number;
    // Enrichment tracking
    enrichAttempted?: boolean;
}

// In-Memory Cache for local development
let localCache: MovieItem[] | null = null;

// ============ VERCEL KV FUNCTIONS ============
async function getFromKV(): Promise<MovieItem[]> {
    if (!hasKV) {
        console.warn("KV not configured - returning empty array");
        return [];
    }
    try {
        const data = await kv.get<MovieItem[]>(DB_KEY);
        return data || [];
    } catch (error) {
        console.error("KV get error:", error);
        return [];
    }
}

async function saveToKV(items: MovieItem[]): Promise<void> {
    if (!hasKV) {
        console.warn("KV not configured - cannot save");
        return;
    }
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
    // Don't try to write files on Vercel
    if (isVercel) {
        console.warn("Cannot write files on Vercel - use KV instead");
        return;
    }

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
    // On Vercel, always use KV
    if (isVercel) {
        return getFromKV();
    }
    // Locally, try file first, fall back to KV if configured
    return getFromFile();
};

export const saveDB = async (items: MovieItem[]): Promise<void> => {
    // On Vercel, always use KV
    if (isVercel) {
        return saveToKV(items);
    }
    // Locally, save to file
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

// ============ DEMO DATA ============
// Used when no user is authenticated to show sample data
export const getDemoData = async (): Promise<MovieItem[]> => {
    try {
        const demoData = await import("@/data/demo-library.json");
        return demoData.default as MovieItem[];
    } catch (error) {
        console.error("Failed to load demo data:", error);
        return [];
    }
};
