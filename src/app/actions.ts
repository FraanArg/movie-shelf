"use server";

import { getDB } from "@/lib/db";

export async function fetchMoviesAction(page: number, sort: string = "title") {
    // 1. Read from Local DB (Instant!)
    let rawItems = await getDB();

    // Deduplicate by IMDB ID or ID to be safe
    const uniqueItems = Array.from(new Map(rawItems.map(m => [m.imdbId || m.id, m])).values());
    let items = uniqueItems;

    // 2. Sort
    // 2. Sort
    items.sort((a, b) => {
        if (sort === "year") {
            return parseInt(b.year) - parseInt(a.year);
        } else if (sort === "date") {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else {
            // Title sort (default)
            return a.title.localeCompare(b.title);
        }
    });

    // 3. Pagination (Client-side slicing since we have all data)
    const limit = 50; // Larger page size for "Apple TV" feel
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return items.slice(startIndex, endIndex);
}
