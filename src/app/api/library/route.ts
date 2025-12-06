import { NextRequest, NextResponse } from "next/server";
import { addLocalMovie, getLocalMovies, removeLocalMovie } from "@/lib/local-library";

export async function GET() {
    const movies = await getLocalMovies();
    return NextResponse.json(movies);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const movie = await addLocalMovie(body);
        return NextResponse.json(movie);
    } catch (error) {
        return NextResponse.json({ error: "Failed to add movie" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await removeLocalMovie(id);
    return NextResponse.json({ success: true });
}
