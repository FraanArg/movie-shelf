"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Mood {
    id: string;
    label: string;
    emoji: string;
    genres: string[];
    gradient: string;
}

const MOODS: Mood[] = [
    {
        id: "feel-good",
        label: "Feel Good",
        emoji: "😊",
        genres: ["Comedy", "Family", "Animation", "Musical"],
        gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    },
    {
        id: "thrilling",
        label: "Dark & Thrilling",
        emoji: "😱",
        genres: ["Thriller", "Horror", "Mystery", "Crime"],
        gradient: "linear-gradient(135deg, #7c3aed, #4c1d95)",
    },
    {
        id: "mind-bender",
        label: "Mind-Bender",
        emoji: "🤯",
        genres: ["Sci-Fi", "Mystery", "Thriller"],
        gradient: "linear-gradient(135deg, #06b6d4, #0891b2)",
    },
    {
        id: "epic",
        label: "Epic Adventure",
        emoji: "⚔️",
        genres: ["Action", "Adventure", "Fantasy", "War"],
        gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    },
    {
        id: "romantic",
        label: "Romantic",
        emoji: "💕",
        genres: ["Romance", "Drama"],
        gradient: "linear-gradient(135deg, #ec4899, #db2777)",
    },
    {
        id: "tear-jerker",
        label: "Tear-Jerker",
        emoji: "😢",
        genres: ["Drama", "Biography", "War"],
        gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    },
];

export default function MoodFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentMood = searchParams.get("mood");

    const handleMoodClick = useCallback((moodId: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (currentMood === moodId) {
            // Toggle off
            params.delete("mood");
        } else {
            params.set("mood", moodId);
        }

        router.push(`/?${params.toString()}`);
    }, [router, searchParams, currentMood]);

    const clearMood = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("mood");
        router.push(`/?${params.toString()}`);
    }, [router, searchParams]);

    return (
        <div style={{ marginBottom: "20px" }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
            }}>
                <span style={{
                    fontSize: "0.85rem",
                    color: "#888",
                    fontWeight: "500",
                }}>
                    Browse by Mood
                </span>
                {currentMood && (
                    <button
                        onClick={clearMood}
                        style={{
                            background: "rgba(255,255,255,0.1)",
                            border: "none",
                            padding: "4px 10px",
                            borderRadius: "10px",
                            fontSize: "0.75rem",
                            color: "#888",
                            cursor: "pointer",
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>
            <div style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
            }}>
                {MOODS.map((mood) => (
                    <button
                        key={mood.id}
                        onClick={() => handleMoodClick(mood.id)}
                        style={{
                            background: currentMood === mood.id ? mood.gradient : "rgba(255,255,255,0.05)",
                            border: "none",
                            padding: "10px 16px",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            color: currentMood === mood.id ? "#fff" : "#aaa",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: currentMood === mood.id
                                ? "0 4px 15px rgba(0,0,0,0.3)"
                                : "none",
                        }}
                        onMouseEnter={(e) => {
                            if (currentMood !== mood.id) {
                                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                                e.currentTarget.style.color = "#fff";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (currentMood !== mood.id) {
                                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                                e.currentTarget.style.color = "#aaa";
                            }
                        }}
                    >
                        <span>{mood.emoji}</span>
                        <span>{mood.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// Export moods for use in filter logic
export { MOODS };
export type { Mood };
