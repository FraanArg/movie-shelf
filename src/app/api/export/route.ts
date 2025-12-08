import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";

    try {
        const items = await getDB();

        if (format === "csv") {
            // Generate CSV
            const headers = [
                "Title", "Year", "Type", "IMDB ID", "IMDB Rating",
                "Genre", "Director", "Runtime", "Watch Date", "List", "User Rating", "User Note"
            ];

            const csvRows = [headers.join(",")];

            items.forEach(item => {
                const row = [
                    `"${(item.title || "").replace(/"/g, '""')}"`,
                    item.year || "",
                    item.type || "",
                    item.imdbId || "",
                    item.imdbRating || "",
                    `"${(item.Genre || "").replace(/"/g, '""')}"`,
                    `"${(item.Director || "").replace(/"/g, '""')}"`,
                    item.Runtime || "",
                    item.date || "",
                    item.list || "watched",
                    item.userRating || "",
                    `"${(item.userNote || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
                ];
                csvRows.push(row.join(","));
            });

            const csv = csvRows.join("\n");

            return new NextResponse(csv, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="movie-shelf-export-${new Date().toISOString().split('T')[0]}.csv"`,
                },
            });
        } else {
            // Default to JSON
            const exportData = {
                exportDate: new Date().toISOString(),
                totalItems: items.length,
                movies: items.filter(i => i.type === "movie").length,
                shows: items.filter(i => i.type === "series").length,
                items: items.map(item => ({
                    title: item.title,
                    year: item.year,
                    type: item.type,
                    imdbId: item.imdbId,
                    imdbRating: item.imdbRating,
                    genre: item.Genre,
                    director: item.Director,
                    runtime: item.Runtime,
                    watchDate: item.date,
                    list: item.list || "watched",
                    userRating: item.userRating,
                    userNote: item.userNote,
                    posterUrl: item.posterUrl,
                })),
            };

            return NextResponse.json(exportData, {
                headers: {
                    "Content-Disposition": `attachment; filename="movie-shelf-export-${new Date().toISOString().split('T')[0]}.json"`,
                },
            });
        }
    } catch (error) {
        console.error("Export failed:", error);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}
