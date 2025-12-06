"use client";

import { useRouter, useSearchParams } from "next/navigation";

const genres = [
    { id: "action", label: "🎬 Action", keywords: ["action", "fight", "battle", "war", "hero"] },
    { id: "comedy", label: "😂 Comedy", keywords: ["comedy", "funny", "laugh", "humor"] },
    { id: "drama", label: "🎭 Drama", keywords: ["drama", "family", "life", "story"] },
    { id: "horror", label: "👻 Horror", keywords: ["horror", "scary", "terror", "nightmare", "evil"] },
    { id: "scifi", label: "🚀 Sci-Fi", keywords: ["space", "future", "alien", "robot", "star"] },
    { id: "romance", label: "💕 Romance", keywords: ["love", "romance", "heart", "relationship"] },
    { id: "thriller", label: "🔪 Thriller", keywords: ["thriller", "suspense", "mystery", "crime"] },
];

export default function QuickFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeGenre = searchParams.get("genre");

    const handleGenreClick = (genreId: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (activeGenre === genreId) {
            params.delete("genre");
        } else {
            params.set("genre", genreId);
        }

        router.push(`/?${params.toString()}`);
    };

    return (
        <div style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            padding: "10px 0",
            marginBottom: "10px"
        }} className="hide-scrollbar">
            {genres.map(genre => (
                <button
                    key={genre.id}
                    onClick={() => handleGenreClick(genre.id)}
                    className={`filter-chip ${activeGenre === genre.id ? "active" : ""}`}
                >
                    {genre.label}
                </button>
            ))}
        </div>
    );
}

// Export genres for use in filtering logic
export { genres };
