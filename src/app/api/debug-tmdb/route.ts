import { NextResponse } from "next/server";

const TMDB_API_URL = "https://api.themoviedb.org/3";

// Debug endpoint to test TMDb lookup directly with full logging
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const imdbId = searchParams.get("imdb") || "tt2149175"; // The Americans

    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
        return NextResponse.json({
            error: "TMDB_API_KEY not configured",
            envCheck: {
                hasKey: !!apiKey,
                keyLength: apiKey?.length || 0,
            }
        }, { status: 500 });
    }

    try {
        // Step 1: Find TMDb ID
        const findUrl = `${TMDB_API_URL}/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`;
        console.log(`Fetching: ${findUrl.replace(apiKey, 'KEY_HIDDEN')}`);

        const findResponse = await fetch(findUrl, { cache: 'no-store' });

        if (!findResponse.ok) {
            return NextResponse.json({
                step: "find",
                error: `Find failed with status ${findResponse.status}`,
                statusText: findResponse.statusText,
            });
        }

        const findData = await findResponse.json();
        const tvResult = findData.tv_results?.[0];
        const movieResult = findData.movie_results?.[0];

        if (!tvResult && !movieResult) {
            return NextResponse.json({
                step: "find",
                error: "No results found",
                findData,
            });
        }

        const isTV = !!tvResult;
        const tmdbId = isTV ? tvResult.id : movieResult.id;
        const endpoint = isTV ? "tv" : "movie";

        // Step 2: Get details with credits
        const detailsUrl = `${TMDB_API_URL}/${endpoint}/${tmdbId}?api_key=${apiKey}&append_to_response=credits`;
        const detailsResponse = await fetch(detailsUrl, { cache: 'no-store' });

        if (!detailsResponse.ok) {
            return NextResponse.json({
                step: "details",
                error: `Details failed with status ${detailsResponse.status}`,
                statusText: detailsResponse.statusText,
            });
        }

        const details = await detailsResponse.json();

        // Extract relevant data
        const created_by = details.created_by?.map((c: any) => c.name) || [];
        const directors = details.credits?.crew
            ?.filter((c: any) => c.job === "Director")
            ?.map((c: any) => c.name) || [];
        const cast = details.credits?.cast?.slice(0, 5)?.map((c: any) => c.name) || [];

        return NextResponse.json({
            imdbId,
            tmdbId,
            isTV,
            title: isTV ? details.name : details.title,
            created_by,
            directors,
            cast,
            hasCredits: !!details.credits,
            crewCount: details.credits?.crew?.length || 0,
            castCount: details.credits?.cast?.length || 0,
        });
    } catch (e: any) {
        return NextResponse.json({
            error: e.message,
            stack: e.stack,
        }, { status: 500 });
    }
}
