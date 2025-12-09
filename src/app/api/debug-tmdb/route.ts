import { NextResponse } from "next/server";
import { getMovieInfoForSync } from "@/lib/tmdb";

// Test endpoint to debug TMDb lookup - no auth required
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const imdbId = searchParams.get("imdb") || "tt2149175"; // The Americans

    try {
        console.log(`Testing TMDb lookup for: ${imdbId}`);
        const result = await getMovieInfoForSync(imdbId);

        return NextResponse.json({
            imdbId,
            success: !!result,
            data: result,
        });
    } catch (e: any) {
        return NextResponse.json({
            imdbId,
            error: e.message,
            stack: e.stack,
        }, { status: 500 });
    }
}
