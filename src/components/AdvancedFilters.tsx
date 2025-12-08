"use client";

import { useState } from "react";

interface AdvancedFiltersProps {
    onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
    minRating: number;
    maxRating: number;
    minYear: number;
    maxYear: number;
    minRuntime: number;
    maxRuntime: number;
}

const currentYear = new Date().getFullYear();

export const defaultFilters: FilterState = {
    minRating: 0,
    maxRating: 10,
    minYear: 1900,
    maxYear: currentYear,
    minRuntime: 0,
    maxRuntime: 300,
};

export default function AdvancedFilters({ onFilterChange }: AdvancedFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>(defaultFilters);

    const handleChange = (key: keyof FilterState, value: number) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const resetFilters = () => {
        setFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    const hasActiveFilters =
        filters.minRating > 0 ||
        filters.maxRating < 10 ||
        filters.minYear > 1900 ||
        filters.maxYear < currentYear ||
        filters.minRuntime > 0 ||
        filters.maxRuntime < 300;

    return (
        <div style={{ marginBottom: "20px" }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    background: hasActiveFilters ? "var(--accent)" : "rgba(255,255,255,0.1)",
                    color: hasActiveFilters ? "white" : "var(--foreground)",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    transition: "all 0.2s ease",
                }}
            >
                <span>⚙️</span>
                <span>Advanced Filters</span>
                {hasActiveFilters && (
                    <span style={{
                        background: "white",
                        color: "var(--accent)",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                    }}>
                        Active
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    marginTop: "15px",
                    padding: "20px",
                    background: "var(--glass-bg)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: "16px",
                    border: "1px solid var(--glass-border)",
                }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "20px",
                    }}>
                        {/* Rating Filter */}
                        <div>
                            <label style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "8px", display: "block" }}>
                                IMDb Rating: {filters.minRating} - {filters.maxRating}
                            </label>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={filters.minRating}
                                    onChange={(e) => handleChange("minRating", parseFloat(e.target.value))}
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="0.5"
                                    value={filters.maxRating}
                                    onChange={(e) => handleChange("maxRating", parseFloat(e.target.value))}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        {/* Year Filter */}
                        <div>
                            <label style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "8px", display: "block" }}>
                                Year: {filters.minYear} - {filters.maxYear}
                            </label>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <input
                                    type="number"
                                    min="1900"
                                    max={currentYear}
                                    value={filters.minYear}
                                    onChange={(e) => handleChange("minYear", parseInt(e.target.value) || 1900)}
                                    style={{
                                        flex: 1,
                                        padding: "8px",
                                        background: "rgba(255,255,255,0.1)",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                        borderRadius: "8px",
                                        color: "var(--foreground)",
                                        fontSize: "0.9rem",
                                    }}
                                />
                                <span style={{ opacity: 0.5 }}>to</span>
                                <input
                                    type="number"
                                    min="1900"
                                    max={currentYear}
                                    value={filters.maxYear}
                                    onChange={(e) => handleChange("maxYear", parseInt(e.target.value) || currentYear)}
                                    style={{
                                        flex: 1,
                                        padding: "8px",
                                        background: "rgba(255,255,255,0.1)",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                        borderRadius: "8px",
                                        color: "var(--foreground)",
                                        fontSize: "0.9rem",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Runtime Filter */}
                        <div>
                            <label style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "8px", display: "block" }}>
                                Runtime: {filters.minRuntime} - {filters.maxRuntime} min
                            </label>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <input
                                    type="range"
                                    min="0"
                                    max="300"
                                    step="10"
                                    value={filters.minRuntime}
                                    onChange={(e) => handleChange("minRuntime", parseInt(e.target.value))}
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="300"
                                    step="10"
                                    value={filters.maxRuntime}
                                    onChange={(e) => handleChange("maxRuntime", parseInt(e.target.value))}
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reset Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            style={{
                                marginTop: "15px",
                                padding: "8px 16px",
                                background: "rgba(255,255,255,0.1)",
                                border: "none",
                                borderRadius: "8px",
                                color: "var(--foreground)",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                            }}
                        >
                            Reset Filters
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Helper function to apply filters to movies
export function applyFilters(movies: any[], filters: FilterState): any[] {
    return movies.filter(movie => {
        // Rating filter
        const rating = parseFloat(movie.imdbRating || "0");
        if (rating > 0 && (rating < filters.minRating || rating > filters.maxRating)) {
            return false;
        }

        // Year filter
        const year = parseInt(movie.year || "0");
        if (year > 0 && (year < filters.minYear || year > filters.maxYear)) {
            return false;
        }

        // Runtime filter
        const runtimeStr = movie.Runtime || movie.runtime || "0";
        const runtime = parseInt(runtimeStr.replace(/\D/g, "") || "0");
        if (runtime > 0 && (runtime < filters.minRuntime || runtime > filters.maxRuntime)) {
            return false;
        }

        return true;
    });
}
