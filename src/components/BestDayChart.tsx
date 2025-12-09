"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface BestDayChartProps {
    watchDates: string[]; // ISO date strings
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayColors = [
    "#ef4444", // Sun - red (weekend)
    "#3b82f6", // Mon - blue
    "#3b82f6", // Tue - blue
    "#3b82f6", // Wed - blue
    "#3b82f6", // Thu - blue
    "#3b82f6", // Fri - blue
    "#ef4444", // Sat - red (weekend)
];

export default function BestDayChart({ watchDates }: BestDayChartProps) {
    const dayData = useMemo(() => {
        const counts = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat

        watchDates.forEach(dateStr => {
            const date = new Date(dateStr);
            counts[date.getDay()]++;
        });

        return counts;
    }, [watchDates]);

    const maxCount = Math.max(...dayData, 1);
    const bestDay = dayData.indexOf(Math.max(...dayData));

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
                    📆 Best Day to Watch
                </h3>
                <div style={{
                    fontSize: "0.85rem",
                    color: "var(--foreground)",
                    opacity: 0.6,
                }}>
                    {dayNames[bestDay]} is your favorite
                </div>
            </div>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
            }}>
                {dayNames.map((day, index) => (
                    <div
                        key={day}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <span style={{
                            width: "35px",
                            fontSize: "0.85rem",
                            fontWeight: index === bestDay ? "600" : "400",
                            color: index === bestDay ? dayColors[index] : "#888",
                        }}>
                            {day}
                        </span>
                        <div style={{
                            flex: 1,
                            height: "24px",
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "6px",
                            overflow: "hidden",
                            position: "relative",
                        }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(dayData[index] / maxCount) * 100}%` }}
                                transition={{ duration: 0.8, delay: index * 0.05 }}
                                style={{
                                    height: "100%",
                                    background: index === bestDay
                                        ? `linear-gradient(90deg, ${dayColors[index]}, ${dayColors[index]}88)`
                                        : "rgba(255,255,255,0.15)",
                                    borderRadius: "6px",
                                }}
                            />
                        </div>
                        <span style={{
                            width: "30px",
                            textAlign: "right",
                            fontSize: "0.85rem",
                            fontWeight: index === bestDay ? "600" : "400",
                            color: index === bestDay ? dayColors[index] : "#666",
                        }}>
                            {dayData[index]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
