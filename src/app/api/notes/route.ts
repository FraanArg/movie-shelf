import { NextRequest, NextResponse } from "next/server";
import { getDB, saveDB, MovieItem } from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const { imdbId, rating, note } = await request.json();

        if (!imdbId) {
            return NextResponse.json({ error: "imdbId required" }, { status: 400 });
        }

        // Get current database
        const items = await getDB();

        // Find and update the movie
        const movieIndex = items.findIndex((m: MovieItem) => m.imdbId === imdbId);

        if (movieIndex === -1) {
            return NextResponse.json({ error: "Movie not found" }, { status: 404 });
        }

        // Update the movie with user's note and rating
        items[movieIndex] = {
            ...items[movieIndex],
            userRating: rating || undefined,
            userNote: note || undefined,
        };

        // Save back to database
        await saveDB(items);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to save note:", error);
        return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const imdbId = searchParams.get("imdbId");

        if (!imdbId) {
            return NextResponse.json({ error: "imdbId required" }, { status: 400 });
        }

        // Get current database
        const items = await getDB();

        // Find the movie
        const movie = items.find((m: MovieItem) => m.imdbId === imdbId);

        if (!movie) {
            return NextResponse.json({ rating: 0, note: "" });
        }

        return NextResponse.json({
            rating: movie.userRating || 0,
            note: movie.userNote || "",
        });
    } catch (error) {
        console.error("Failed to get note:", error);
        return NextResponse.json({ error: "Failed to get note" }, { status: 500 });
    }
}
