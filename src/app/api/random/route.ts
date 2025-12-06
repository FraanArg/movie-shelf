import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
    const items = await getDB();
    if (items.length === 0) {
        return NextResponse.json({ error: "No items" }, { status: 404 });
    }
    const randomItem = items[Math.floor(Math.random() * items.length)];
    return NextResponse.json(randomItem);
}
