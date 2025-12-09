"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Badge {
    id: string;
    name: string;
    emoji: string;
    description: string;
    requirement: string;
    color: string;
    earned?: boolean;
}

interface BadgeProgressProps {
    allBadges: Badge[];
    earnedBadgeIds: string[];
    currentStats: {
        totalMovies: number;
        genreCounts: Record<string, number>;
    };
}

// Progress calculation for known badge types
function calculateProgress(badge: Badge, stats: BadgeProgressProps["currentStats"]): number {
    const { totalMovies, genreCounts } = stats;

    // Collection size badges
    if (badge.id === "first-steps") return totalMovies >= 1 ? 100 : 0;
    if (badge.id === "film-buff") return Math.min((totalMovies / 50) * 100, 100);
    if (badge.id === "cinephile") return Math.min((totalMovies / 100) * 100, 100);
    if (badge.id === "collector") return Math.min((totalMovies / 200) * 100, 100);
    if (badge.id === "movie-vault") return Math.min((totalMovies / 500) * 100, 100);
    if (badge.id === "legendary") return Math.min((totalMovies / 1000) * 100, 100);

    // Genre badges
    const genreMap: Record<string, { genre: string; target: number }> = {
        "horror-aficionado": { genre: "Horror", target: 10 },
        "scream-queen": { genre: "Horror", target: 50 },
        "action-hero": { genre: "Action", target: 15 },
        "romantic": { genre: "Romance", target: 10 },
        "comedy-fan": { genre: "Comedy", target: 15 },
        "sci-fi-explorer": { genre: "Sci-Fi", target: 10 },
        "drama-queen": { genre: "Drama", target: 25 },
        "thriller-seeker": { genre: "Thriller", target: 15 },
    };

    if (genreMap[badge.id]) {
        const { genre, target } = genreMap[badge.id];
        const count = genreCounts[genre] || 0;
        return Math.min((count / target) * 100, 100);
    }

    // Default: can't calculate
    return 0;
}

export default function BadgeProgress({ allBadges, earnedBadgeIds, currentStats }: BadgeProgressProps) {
    // Filter to unearned badges and calculate progress
    const unearnedWithProgress = allBadges
        .filter(badge => !earnedBadgeIds.includes(badge.id))
        .map(badge => ({
            ...badge,
            progress: calculateProgress(badge, currentStats),
        }))
        .filter(badge => badge.progress > 0 && badge.progress < 100)
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 5);

    if (unearnedWithProgress.length === 0) {
        return null;
    }

    return (
        <div style={{
            padding: "20px",
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "16px",
            border: "1px solid var(--glass-border)",
        }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
            }}>
                <h3 style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "var(--foreground)",
                }}>
                    🎯 Almost There
                </h3>
                <Link href="/profile#badges" style={{
                    fontSize: "0.8rem",
                    color: "var(--accent)",
                    textDecoration: "none",
                }}>
                    View all badges →
                </Link>
            </div>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
            }}>
                {unearnedWithProgress.map((badge, index) => (
                    <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                        }}
                    >
                        <span style={{
                            fontSize: "1.5rem",
                            opacity: 0.6,
                            filter: "grayscale(50%)",
                        }}>
                            {badge.emoji}
                        </span>

                        <div style={{ flex: 1 }}>
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "6px",
                            }}>
                                <span style={{
                                    fontSize: "0.9rem",
                                    fontWeight: "500",
                                }}>
                                    {badge.name}
                                </span>
                                <span style={{
                                    fontSize: "0.8rem",
                                    color: badge.color,
                                    fontWeight: "600",
                                }}>
                                    {Math.round(badge.progress)}%
                                </span>
                            </div>

                            <div style={{
                                height: "6px",
                                background: "rgba(255,255,255,0.1)",
                                borderRadius: "3px",
                                overflow: "hidden",
                            }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${badge.progress}%` }}
                                    transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                                    style={{
                                        height: "100%",
                                        background: `linear-gradient(90deg, ${badge.color}, ${badge.color}aa)`,
                                        borderRadius: "3px",
                                    }}
                                />
                            </div>

                            <div style={{
                                fontSize: "0.75rem",
                                color: "#666",
                                marginTop: "4px",
                            }}>
                                {badge.requirement}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
