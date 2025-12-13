"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Check } from "lucide-react";
import BottomSheet from "./BottomSheet";

const SORT_OPTIONS = [
    { label: "Alphabetical (A-Z)", value: "title", icon: "🔤" },
    { label: "Year (Newest)", value: "year", icon: "📅" },
    { label: "Recently Added", value: "date", icon: "🕐" },
    { label: "Rating (Highest)", value: "rating", icon: "⭐" },
    { label: "Random", value: "random", icon: "🎲" },
];

const VIEW_OPTIONS = [
    { label: "Grid", value: "grid", icon: "▦" },
    { label: "Shelf", value: "spine", icon: "📚" },
];

const GENRE_OPTIONS = [
    { label: "Action", value: "action", icon: "💥" },
    { label: "Comedy", value: "comedy", icon: "😂" },
    { label: "Drama", value: "drama", icon: "🎭" },
    { label: "Horror", value: "horror", icon: "👻" },
    { label: "Sci-Fi", value: "scifi", icon: "🚀" },
    { label: "Romance", value: "romance", icon: "💕" },
    { label: "Thriller", value: "thriller", icon: "🔪" },
];

export default function MobileFilters() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSort = searchParams.get("sort") || "title";
    const currentView = searchParams.get("view") || "grid";
    const currentGenre = searchParams.get("genre") || "";

    const applyFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "title" && value !== "grid") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push("/");
        setIsOpen(false);
    };

    const hasActiveFilters = currentSort !== "title" || currentView !== "grid" || currentGenre;

    return (
        <>
            {/* Filter Button - Floating Action */}
            <button
                onClick={() => setIsOpen(true)}
                className="filter-fab"
                style={{
                    position: "fixed",
                    bottom: "calc(80px + env(safe-area-inset-bottom) + var(--space-md))",
                    right: "var(--space-md)",
                    width: "56px",
                    height: "56px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--tint)",
                    color: "white",
                    border: "none",
                    boxShadow: "var(--shadow-lg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    zIndex: 50,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
            >
                <SlidersHorizontal size={24} />
                {hasActiveFilters && (
                    <div style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "var(--radius-full)",
                        background: "var(--tint-red)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: 700,
                    }}>
                        •
                    </div>
                )}
            </button>

            {/* Filter BottomSheet */}
            <BottomSheet
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Filters"
            >
                <div style={{ padding: "0 var(--space-md) var(--space-xl)" }}>
                    {/* Sort Section */}
                    <section style={{ marginBottom: "var(--space-xl)" }}>
                        <h3 style={{
                            fontSize: "var(--font-size-footnote)",
                            fontWeight: 600,
                            color: "var(--label-secondary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "var(--space-sm)",
                        }}>
                            Sort By
                        </h3>
                        <div style={{
                            background: "var(--bg-tertiary)",
                            borderRadius: "var(--radius-lg)",
                            overflow: "hidden",
                        }}>
                            {SORT_OPTIONS.map((option, index) => (
                                <button
                                    key={option.value}
                                    onClick={() => applyFilter("sort", option.value)}
                                    style={{
                                        width: "100%",
                                        padding: "var(--space-md)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        background: "transparent",
                                        border: "none",
                                        borderBottom: index < SORT_OPTIONS.length - 1 ? "1px solid var(--separator)" : "none",
                                        color: "var(--label-primary)",
                                        fontSize: "var(--font-size-body)",
                                        fontFamily: "var(--font-system)",
                                        cursor: "pointer",
                                        textAlign: "left",
                                    }}
                                >
                                    <span style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                                        <span>{option.icon}</span>
                                        <span>{option.label}</span>
                                    </span>
                                    {currentSort === option.value && (
                                        <Check size={18} style={{ color: "var(--tint)" }} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* View Section */}
                    <section style={{ marginBottom: "var(--space-xl)" }}>
                        <h3 style={{
                            fontSize: "var(--font-size-footnote)",
                            fontWeight: 600,
                            color: "var(--label-secondary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "var(--space-sm)",
                        }}>
                            View
                        </h3>
                        <div style={{
                            display: "flex",
                            gap: "var(--space-sm)",
                        }}>
                            {VIEW_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => applyFilter("view", option.value)}
                                    style={{
                                        flex: 1,
                                        padding: "var(--space-md)",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "var(--space-xs)",
                                        background: currentView === option.value ? "var(--tint)" : "var(--bg-tertiary)",
                                        border: "none",
                                        borderRadius: "var(--radius-lg)",
                                        color: currentView === option.value ? "white" : "var(--label-primary)",
                                        fontSize: "var(--font-size-subhead)",
                                        fontFamily: "var(--font-system)",
                                        cursor: "pointer",
                                        fontWeight: currentView === option.value ? 600 : 400,
                                    }}
                                >
                                    <span style={{ fontSize: "1.5rem" }}>{option.icon}</span>
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Genre Section */}
                    <section style={{ marginBottom: "var(--space-xl)" }}>
                        <h3 style={{
                            fontSize: "var(--font-size-footnote)",
                            fontWeight: 600,
                            color: "var(--label-secondary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "var(--space-sm)",
                        }}>
                            Genre
                        </h3>
                        <div style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "var(--space-sm)",
                        }}>
                            {GENRE_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => applyFilter("genre", currentGenre === option.value ? "" : option.value)}
                                    style={{
                                        padding: "var(--space-sm) var(--space-md)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "var(--space-xs)",
                                        background: currentGenre === option.value ? "var(--tint)" : "var(--bg-tertiary)",
                                        border: "none",
                                        borderRadius: "var(--radius-full)",
                                        color: currentGenre === option.value ? "white" : "var(--label-primary)",
                                        fontSize: "var(--font-size-subhead)",
                                        fontFamily: "var(--font-system)",
                                        cursor: "pointer",
                                    }}
                                >
                                    <span>{option.icon}</span>
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            style={{
                                width: "100%",
                                padding: "var(--space-md)",
                                background: "transparent",
                                border: "none",
                                color: "var(--tint-red)",
                                fontSize: "var(--font-size-body)",
                                fontFamily: "var(--font-system)",
                                cursor: "pointer",
                                fontWeight: 500,
                            }}
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>
            </BottomSheet>

            {/* Hide FAB on desktop */}
            <style>{`
                @media (min-width: 768px) {
                    .filter-fab {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
}
