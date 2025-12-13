"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";

interface DemoBannerProps {
    traktAuthUrl?: string;
}

export default function DemoBanner({ traktAuthUrl }: DemoBannerProps) {
    const [dismissed, setDismissed] = useState(false);

    // Don't show if banner was dismissed
    if (dismissed) {
        return null;
    }

    return (
        <div
            style={{
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
                backdropFilter: "blur(10px)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap",
                position: "relative",
            }}
        >
            <span style={{
                fontSize: "0.9rem",
                color: "var(--foreground)",
                opacity: 0.9,
            }}>
                👋 Exploring Movie Shelf? This is sample data from TMDb's top-rated movies and shows.
            </span>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <SignInButton mode="modal">
                    <button
                        style={{
                            background: "var(--accent)",
                            color: "white",
                            border: "none",
                            padding: "6px 16px",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "transform 0.2s ease, opacity 0.2s ease",
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                        onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                    >
                        Sign In
                    </button>
                </SignInButton>

                {traktAuthUrl && (
                    <Link
                        href={traktAuthUrl}
                        style={{
                            background: "rgba(237, 28, 36, 0.8)",
                            color: "white",
                            textDecoration: "none",
                            padding: "6px 16px",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                            transition: "transform 0.2s ease, opacity 0.2s ease",
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                        onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                    >
                        Connect Trakt
                    </Link>
                )}
            </div>

            <button
                onClick={() => setDismissed(true)}
                style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "var(--foreground)",
                    opacity: 0.5,
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    padding: "4px 8px",
                    lineHeight: 1,
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
                onMouseOut={(e) => e.currentTarget.style.opacity = "0.5"}
                aria-label="Dismiss banner"
            >
                ×
            </button>
        </div>
    );
}
