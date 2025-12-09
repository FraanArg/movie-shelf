"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface ShareableStatsCardProps {
    username: string;
    totalMovies: number;
    totalShows: number;
    topGenre: string;
    avgRating: string;
    watchHours: number;
}

export default function ShareableStatsCard({
    username,
    totalMovies,
    totalShows,
    topGenre,
    avgRating,
    watchHours,
}: ShareableStatsCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);

        try {
            // Dynamic import to avoid SSR issues
            const html2canvas = (await import("html2canvas")).default;

            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: "#0a0a0a",
                scale: 2,
            });

            const link = document.createElement("a");
            link.download = `movie-shelf-stats-${username}.png`;
            link.href = canvas.toDataURL();
            link.click();

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to generate image:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{
            padding: "20px",
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "16px",
            border: "1px solid var(--glass-border)",
        }}>
            <h3 style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "var(--foreground)",
                marginBottom: "20px",
            }}>
                📤 Share Your Stats
            </h3>

            {/* Preview Card */}
            <div
                ref={cardRef}
                style={{
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    borderRadius: "16px",
                    padding: "30px",
                    marginBottom: "20px",
                }}
            >
                {/* Header */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "25px",
                }}>
                    <div style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#fff",
                    }}>
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{
                            fontSize: "1.3rem",
                            fontWeight: "700",
                            color: "#fff",
                        }}>
                            {username}
                        </div>
                        <div style={{
                            fontSize: "0.8rem",
                            color: "rgba(255,255,255,0.6)",
                        }}>
                            Movie Shelf Stats
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "15px",
                    marginBottom: "20px",
                }}>
                    <StatItem value={totalMovies} label="Movies" color="#f97316" />
                    <StatItem value={totalShows} label="TV Shows" color="#3b82f6" />
                    <StatItem value={`${watchHours}h`} label="Watch Time" color="#22c55e" />
                </div>

                {/* Bottom row */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "15px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "10px",
                }}>
                    <div>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>
                            Top Genre
                        </div>
                        <div style={{ fontWeight: "600", color: "#fff" }}>
                            {topGenre}
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>
                            Avg Rating
                        </div>
                        <div style={{ fontWeight: "600", color: "#fbbf24" }}>
                            ⭐ {avgRating}
                        </div>
                    </div>
                </div>

                {/* Branding */}
                <div style={{
                    textAlign: "center",
                    marginTop: "20px",
                    fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.4)",
                }}>
                    movie-shelf-app.vercel.app
                </div>
            </div>

            {/* Download Button */}
            <motion.button
                onClick={handleShare}
                disabled={isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                    width: "100%",
                    padding: "14px",
                    background: showSuccess
                        ? "linear-gradient(135deg, #22c55e, #16a34a)"
                        : "linear-gradient(135deg, var(--accent), #6366f1)",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: "0.95rem",
                    cursor: isGenerating ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                }}
            >
                {isGenerating ? (
                    <>
                        <span style={{ animation: "spin 1s linear infinite" }}>⏳</span>
                        Generating...
                    </>
                ) : showSuccess ? (
                    <>
                        ✅ Downloaded!
                    </>
                ) : (
                    <>
                        📥 Download as Image
                    </>
                )}
            </motion.button>
        </div>
    );
}

function StatItem({ value, label, color }: { value: string | number; label: string; color: string }) {
    return (
        <div style={{ textAlign: "center" }}>
            <div style={{
                fontSize: "1.8rem",
                fontWeight: "800",
                color: color,
            }}>
                {value}
            </div>
            <div style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.6)",
            }}>
                {label}
            </div>
        </div>
    );
}
