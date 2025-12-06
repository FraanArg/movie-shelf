import { NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/db";

export async function POST(request: Request) {
    const { id, action } = await request.json();
    const items = await getDB();

    const itemIndex = items.findIndex(i => i.id.toString() === id.toString() || i.imdbId === id);

    if (itemIndex > -1) {
        if (action === "add") {
            items[itemIndex].list = "watchlist";
        } else if (action === "remove") {
            items[itemIndex].list = "watched"; // Or undefined
        }
        await saveDB(items);
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Item not found" }, { status: 404 });
}
