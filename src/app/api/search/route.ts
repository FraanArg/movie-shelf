import { NextRequest, NextResponse } from "next/server";

const OMDB_API_URL = "http://www.omdbapi.com";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q");
    const apiKey = process.env.OMDB_API_KEY;

    if (!q || !apiKey) {
        return NextResponse.json({ Search: [] });
    }

    try {
        const response = await fetch(`${OMDB_API_URL}/?s=${encodeURIComponent(q)}&apikey=${apiKey}`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}
