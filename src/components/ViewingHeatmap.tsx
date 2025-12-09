"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ViewingHeatmapProps {
    watchDates: string[]; // Array of ISO date strings when movies were watched
    moviesByDate?: Record<string, string[]>; // Optional: movie titles by date
}

interface DayData {
    date: string;
    count: number;
    movies: string[];
}

export default function ViewingHeatmap({ watchDates, moviesByDate = {} }: ViewingHeatmapProps) {
    const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

    // Calculate the last 365 days of data
    const heatmapData = useMemo(() => {
        const today = new Date();
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);

        // Count movies per day
        const countByDate: Record<string, number> = {};
        watchDates.forEach(date => {
            const dayKey = date.split("T")[0];
            countByDate[dayKey] = (countByDate[dayKey] || 0) + 1;
        });

        // Generate array of weeks (columns) and days (rows)
        const weeks: DayData[][] = [];
        let currentWeek: DayData[] = [];
        let currentDate = new Date(yearAgo);

        // Start from the first Sunday
        while (currentDate.getDay() !== 0) {
            currentDate.setDate(currentDate.getDate() - 1);
        }

        while (currentDate <= today) {
            const dateStr = currentDate.toISOString().split("T")[0];
            currentWeek.push({
                date: dateStr,
                count: countByDate[dateStr] || 0,
                movies: moviesByDate[dateStr] || [],
            });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    }, [watchDates, moviesByDate]);

    const maxCount = useMemo(() => {
        return Math.max(...watchDates.map(d => {
            const day = d.split("T")[0];
            return watchDates.filter(wd => wd.split("T")[0] === day).length;
        }), 1);
    }, [watchDates]);

    const getColor = (count: number) => {
        if (count === 0) return "rgba(255,255,255,0.03)";
        const intensity = Math.min(count / Math.max(maxCount, 4), 1);
        if (intensity < 0.25) return "rgba(34, 197, 94, 0.3)";
        if (intensity < 0.5) return "rgba(34, 197, 94, 0.5)";
        if (intensity < 0.75) return "rgba(34, 197, 94, 0.7)";
        return "rgba(34, 197, 94, 1)";
    };

    const monthLabels = useMemo(() => {
        const months: { name: string; week: number }[] = [];
        let lastMonth = -1;
        heatmapData.forEach((week, weekIndex) => {
            const firstDayOfWeek = new Date(week[0]?.date);
            const month = firstDayOfWeek.getMonth();
            if (month !== lastMonth) {
                months.push({
                    name: firstDayOfWeek.toLocaleString("default", { month: "short" }),
                    week: weekIndex,
                });
                lastMonth = month;
            }
        });
        return months;
    }, [heatmapData]);

    const totalWatched = watchDates.length;
    const daysWithActivity = new Set(watchDates.map(d => d.split("T")[0])).size;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    return (
        <div style={{
            padding: "20px",
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "16px",
            border: "1px solid var(--glass-border)",
            marginBottom: "30px",
            position: "relative",
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
                    📅 Viewing Activity
                </h3>
                <div style={{
                    fontSize: "0.85rem",
                    color: "var(--foreground)",
                    opacity: 0.6,
                }}>
                    {totalWatched} movies watched across {daysWithActivity} days
                </div>
            </div>

            {/* Month labels */}
            <div style={{
                display: "flex",
                marginBottom: "5px",
                marginLeft: "32px",
                gap: "0",
            }}>
                {monthLabels.map((month, i) => (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: `${32 + month.week * 13}px`,
                            fontSize: "0.7rem",
                            color: "rgba(255,255,255,0.4)",
                        }}
                    >
                        {month.name}
                    </div>
                ))}
            </div>

            {/* Heatmap grid */}
            <div style={{
                display: "flex",
                gap: "3px",
                overflowX: "auto",
                paddingBottom: "10px",
                marginTop: "25px",
            }}
                className="hide-scrollbar"
            >
                {/* Day labels */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                    marginRight: "5px",
                    fontSize: "0.65rem",
                    color: "rgba(255,255,255,0.4)",
                }}>
                    <span style={{ height: "10px" }}></span>
                    <span style={{ height: "10px" }}>Mon</span>
                    <span style={{ height: "10px" }}></span>
                    <span style={{ height: "10px" }}>Wed</span>
                    <span style={{ height: "10px" }}></span>
                    <span style={{ height: "10px" }}>Fri</span>
                    <span style={{ height: "10px" }}></span>
                </div>

                {heatmapData.map((week, weekIndex) => (
                    <div
                        key={weekIndex}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "3px",
                        }}
                    >
                        {week.map((day, dayIndex) => (
                            <div
                                key={dayIndex}
                                title={`${day.date}: ${day.count} ${day.count === 1 ? "movie" : "movies"} watched`}
                                onClick={() => day.count > 0 && setSelectedDay(day)}
                                style={{
                                    width: "10px",
                                    height: "10px",
                                    borderRadius: "2px",
                                    background: getColor(day.count),
                                    cursor: day.count > 0 ? "pointer" : "default",
                                    transition: "transform 0.1s ease",
                                }}
                                onMouseEnter={(e) => {
                                    if (day.count > 0) {
                                        (e.target as HTMLElement).style.transform = "scale(1.3)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    (e.target as HTMLElement).style.transform = "scale(1)";
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "5px",
                marginTop: "10px",
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.5)",
            }}>
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "2px",
                            background: getColor(level === 0 ? 0 : level * maxCount / 4),
                        }}
                    />
                ))}
                <span>More</span>
            </div>

            {/* Selected Day Modal */}
            <AnimatePresence>
                {selectedDay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedDay(null)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 100,
                            padding: "20px",
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: "var(--glass-bg)",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                borderRadius: "16px",
                                border: "1px solid var(--glass-border)",
                                padding: "25px",
                                maxWidth: "400px",
                                width: "100%",
                            }}
                        >
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "20px",
                            }}>
                                <div>
                                    <div style={{
                                        fontSize: "1.1rem",
                                        fontWeight: "600",
                                        marginBottom: "4px",
                                    }}>
                                        {formatDate(selectedDay.date)}
                                    </div>
                                    <div style={{
                                        fontSize: "0.85rem",
                                        color: "#22c55e",
                                        fontWeight: "500",
                                    }}>
                                        {selectedDay.count} {selectedDay.count === 1 ? "movie" : "movies"} watched
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedDay(null)}
                                    style={{
                                        background: "rgba(255,255,255,0.1)",
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "8px 12px",
                                        color: "var(--foreground)",
                                        cursor: "pointer",
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            {selectedDay.movies.length > 0 ? (
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                    maxHeight: "300px",
                                    overflowY: "auto",
                                }}>
                                    {selectedDay.movies.map((movie, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: "12px",
                                                background: "rgba(255,255,255,0.05)",
                                                borderRadius: "8px",
                                                fontSize: "0.9rem",
                                            }}
                                        >
                                            🎬 {movie}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: "center",
                                    padding: "20px",
                                    color: "#666",
                                }}>
                                    Movie titles not available for this date
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
