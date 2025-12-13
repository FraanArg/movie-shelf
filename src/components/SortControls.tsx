"use client";

import { useRouter, useSearchParams } from "next/navigation";
import SegmentedControl from "./SegmentedControl";

export default function SortControls() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentView = searchParams.get("view") || "grid";
    const currentSort = searchParams.get("sort") || "title";

    const handleViewChange = (view: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", view);
        router.push(`/?${params.toString()}`);
    };

    const handleSortChange = (sort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", sort);
        router.push(`/?${params.toString()}`);
    };

    const viewOptions = [
        { label: "Grid", value: "grid" },
        { label: "Shelf", value: "spine" },
    ];

    const sortOptions = [
        { label: "A-Z", value: "title" },
        { label: "Year", value: "year" },
        { label: "Added", value: "date" },
        { label: "Rating", value: "rating" },
        { label: "🎲", value: "random" },
    ];

    return (
        <div style={{
            display: "flex",
            gap: "var(--space-sm)",
            alignItems: "center",
            flexWrap: "wrap",
        }}>
            {/* View Toggle */}
            <SegmentedControl
                options={viewOptions}
                value={currentView}
                onChange={handleViewChange}
                size="small"
            />

            {/* Sort Options */}
            <SegmentedControl
                options={sortOptions}
                value={currentSort}
                onChange={handleSortChange}
                size="small"
            />
        </div>
    );
}
