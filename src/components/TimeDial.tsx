"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TimeDial() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentDecade = searchParams.get("decade");

    const decades = [1970, 1980, 1990, 2000, 2010, 2020];

    const handleDecadeClick = (decade: number | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (decade) {
            params.set("decade", decade.toString());
            params.delete("sort"); // Clear other sorts to focus on time
        } else {
            params.delete("decade");
        }
        router.push(`/?${params.toString()}`);
    };

    return (
        <div style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--glass-material)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            padding: "6px 10px",
            borderRadius: "16px",
            display: "flex",
            gap: "4px",
            zIndex: 1000,
            border: "1px solid var(--glass-border)",
            boxShadow: "var(--glass-shadow)"
        }}>
            <button
                onClick={() => handleDecadeClick(null)}
                style={{
                    background: !currentDecade ? "var(--glass-highlight)" : "transparent",
                    color: !currentDecade ? "var(--glass-text)" : "var(--glass-text-inactive)",
                    border: "none",
                    borderRadius: "10px",
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "0.8rem",
                    transition: "all 0.2s ease"
                }}
            >
                All
            </button>

            {decades.map(decade => (
                <button
                    key={decade}
                    onClick={() => handleDecadeClick(decade)}
                    style={{
                        background: currentDecade === decade.toString() ? "var(--glass-highlight)" : "transparent",
                        color: currentDecade === decade.toString() ? "var(--glass-text)" : "var(--glass-text-inactive)",
                        border: "none",
                        borderRadius: "10px",
                        padding: "6px 8px",
                        cursor: "pointer",
                        fontWeight: "500",
                        fontSize: "0.75rem",
                        transition: "all 0.2s ease",
                        letterSpacing: "0.5px"
                    }}
                >
                    {decade}s
                </button>
            ))}
        </div>
    );
}
