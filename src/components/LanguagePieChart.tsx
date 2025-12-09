"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface LanguagePieChartProps {
    items: { Language?: string }[];
}

const languageColors = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
];

export default function LanguagePieChart({ items }: LanguagePieChartProps) {
    const languageData = useMemo(() => {
        const counts: Record<string, number> = {};

        items.forEach(item => {
            if (item.Language && item.Language !== "N/A") {
                // Take primary language only
                const primary = item.Language.split(",")[0].trim();
                counts[primary] = (counts[primary] || 0) + 1;
            }
        });

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, count], index) => ({
                name,
                count,
                color: languageColors[index % languageColors.length],
            }));
    }, [items]);

    const total = languageData.reduce((sum, d) => sum + d.count, 0);

    if (languageData.length === 0) {
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
                    🌍 Languages
                </h3>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>
                    Language data not available
                </p>
            </div>
        );
    }

    // Calculate pie chart segments
    let currentAngle = 0;
    const segments = languageData.map(lang => {
        const angle = (lang.count / total) * 360;
        const segment = {
            ...lang,
            startAngle: currentAngle,
            endAngle: currentAngle + angle,
            percentage: ((lang.count / total) * 100).toFixed(1),
        };
        currentAngle += angle;
        return segment;
    });

    const size = 160;
    const center = size / 2;
    const radius = 60;
    const innerRadius = 35;

    function polarToCartesian(angle: number, r: number) {
        const radians = ((angle - 90) * Math.PI) / 180;
        return {
            x: center + r * Math.cos(radians),
            y: center + r * Math.sin(radians),
        };
    }

    function describeArc(startAngle: number, endAngle: number) {
        const start = polarToCartesian(endAngle, radius);
        const end = polarToCartesian(startAngle, radius);
        const innerStart = polarToCartesian(endAngle, innerRadius);
        const innerEnd = polarToCartesian(startAngle, innerRadius);
        const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

        return [
            `M ${start.x} ${start.y}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
            `L ${innerEnd.x} ${innerEnd.y}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
            "Z",
        ].join(" ");
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
                🌍 Languages
            </h3>

            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
            }}>
                <svg width={size} height={size} style={{ flexShrink: 0 }}>
                    {segments.map((seg, index) => (
                        <motion.path
                            key={seg.name}
                            d={describeArc(seg.startAngle, seg.endAngle)}
                            fill={seg.color}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            style={{ transformOrigin: "center" }}
                        />
                    ))}
                </svg>

                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    flex: 1,
                    minWidth: "150px",
                }}>
                    {segments.map((seg, index) => (
                        <motion.div
                            key={seg.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                            }}
                        >
                            <div style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "2px",
                                background: seg.color,
                            }} />
                            <span style={{ flex: 1, fontSize: "0.85rem" }}>
                                {seg.name}
                            </span>
                            <span style={{
                                fontSize: "0.8rem",
                                color: "#888",
                            }}>
                                {seg.percentage}%
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
