"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface StudioStatsProps {
    items: { Production?: string; title?: string }[];
}

// Map common studio names to readable versions
const studioAliases: Record<string, string> = {
    "Warner Bros. Pictures": "Warner Bros.",
    "Warner Bros.": "Warner Bros.",
    "Universal Pictures": "Universal",
    "20th Century Fox": "20th Century Fox",
    "Twentieth Century Fox": "20th Century Fox",
    "Paramount Pictures": "Paramount",
    "Columbia Pictures": "Columbia",
    "Walt Disney Pictures": "Disney",
    "Marvel Studios": "Marvel",
    "Legendary Pictures": "Legendary",
    "New Line Cinema": "New Line",
    "Metro-Goldwyn-Mayer": "MGM",
    "DreamWorks Pictures": "DreamWorks",
    "Lionsgate Films": "Lionsgate",
    "A24": "A24",
    "Netflix": "Netflix",
    "Amazon Studios": "Amazon",
    "Apple TV+": "Apple",
    "HBO Films": "HBO",
};

const studioColors: Record<string, string> = {
    "Warner Bros.": "#005a94",
    "Universal": "#000000",
    "Paramount": "#0066cc",
    "Disney": "#1e3a77",
    "Marvel": "#ed1d24",
    "A24": "#000000",
    "Netflix": "#e50914",
    "Amazon": "#ff9900",
    "Sony": "#003087",
    "Lionsgate": "#ff6600",
    "MGM": "#ffd700",
};

function normalizeStudioName(name: string): string {
    const trimmed = name.trim();
    return studioAliases[trimmed] || trimmed;
}

export default function StudioStats({ items }: StudioStatsProps) {
    const studioData = useMemo(() => {
        const studioMap: Record<string, { count: number; titles: string[] }> = {};

        items.forEach(item => {
            if (item.Production && item.Production !== "N/A") {
                const studios = item.Production.split(",");
                studios.forEach(s => {
                    const name = normalizeStudioName(s);
                    if (name) {
                        if (!studioMap[name]) {
                            studioMap[name] = { count: 0, titles: [] };
                        }
                        studioMap[name].count++;
                        if (item.title) studioMap[name].titles.push(item.title);
                    }
                });
            }
        });

        return Object.entries(studioMap)
            .map(([name, data]) => ({
                name,
                count: data.count,
                titles: data.titles.slice(0, 5),
                color: studioColors[name] || "#666",
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);
    }, [items]);

    const maxCount = Math.max(...studioData.map(s => s.count), 1);

    if (studioData.length === 0) {
        return (
            <div style={{
                padding: "20px",
                background: "var(--glass-bg)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "16px",
                border: "1px solid var(--glass-border)",
                textAlign: "center",
            }}>
                <h3 style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "var(--foreground)",
                    marginBottom: "15px",
                }}>
                    🎬 Studios
                </h3>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>
                    Studio data not available. Run re-enrich to populate.
                </p>
            </div>
        );
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
            <h3 style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "var(--foreground)",
                marginBottom: "20px",
            }}>
                🎬 Top Studios
            </h3>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
            }}>
                {studioData.map((studio, index) => (
                    <motion.div
                        key={studio.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <span style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "6px",
                            background: studio.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            color: "#fff",
                        }}>
                            {index + 1}
                        </span>

                        <div style={{ flex: 1 }}>
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: "4px",
                            }}>
                                <span style={{
                                    fontSize: "0.9rem",
                                    fontWeight: index < 3 ? "600" : "400",
                                }}>
                                    {studio.name}
                                </span>
                                <span style={{
                                    fontSize: "0.8rem",
                                    color: "#888",
                                }}>
                                    {studio.count} {studio.count === 1 ? "film" : "films"}
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
                                    animate={{ width: `${(studio.count / maxCount) * 100}%` }}
                                    transition={{ duration: 0.8, delay: 0.3 + index * 0.05 }}
                                    style={{
                                        height: "100%",
                                        background: `linear-gradient(90deg, ${studio.color}, ${studio.color}88)`,
                                        borderRadius: "3px",
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
