"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortControls() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentView = searchParams.get("view") || "grid";

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", e.target.value);
        router.push(`/?${params.toString()}`);
    };

    const toggleView = (view: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", view);
        router.push(`/?${params.toString()}`);
    };

    const currentSort = searchParams.get("sort") || "title";

    const sortOptions = [
        { value: "title", label: "A-Z", icon: "↓" },
        { value: "year", label: "Year", icon: "📅" },
        { value: "date", label: "Added", icon: "✨" },
        { value: "rating", label: "Rating", icon: "⭐" },
    ];

    return (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {/* View Toggle */}
            <div style={{
                background: "var(--glass-material)",
                borderRadius: "12px",
                padding: "3px",
                display: "flex",
                border: "1px solid var(--glass-border)"
            }}>
                <button
                    onClick={() => toggleView("grid")}
                    className="btn-micro"
                    style={{
                        background: currentView === "grid" ? "var(--glass-highlight)" : "transparent",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "10px",
                        color: currentView === "grid" ? "var(--glass-text)" : "var(--glass-text-inactive)",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                    }}
                >
                    <span style={{ fontSize: "1rem" }}>▦</span> Grid
                </button>
                <button
                    onClick={() => toggleView("spine")}
                    className="btn-micro"
                    style={{
                        background: currentView === "spine" ? "var(--glass-highlight)" : "transparent",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "10px",
                        color: currentView === "spine" ? "var(--glass-text)" : "var(--glass-text-inactive)",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                    }}
                >
                    <span style={{ fontSize: "1rem" }}>☰</span> Shelf
                </button>
            </div>

            {/* Sort Pills */}
            <div style={{
                background: "var(--glass-material)",
                borderRadius: "12px",
                padding: "3px",
                display: "flex",
                border: "1px solid var(--glass-border)"
            }}>
                {sortOptions.map(option => (
                    <button
                        key={option.value}
                        className="btn-micro"
                        onClick={() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("sort", option.value);
                            router.push(`/?${params.toString()}`);
                        }}
                        style={{
                            background: currentSort === option.value ? "var(--glass-highlight)" : "transparent",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: "10px",
                            color: currentSort === option.value ? "var(--glass-text)" : "var(--glass-text-inactive)",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: "500",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                        }}
                    >
                        <span style={{ fontSize: "0.9rem" }}>{option.icon}</span>
                        <span>{option.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
