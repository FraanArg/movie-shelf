"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface PeakHoursChartProps {
    watchDates: string[]; // ISO date strings with time
}

const timeSlots = [
    { name: "Morning", range: "6AM-12PM", emoji: "🌅", color: "#fbbf24" },
    { name: "Afternoon", range: "12PM-6PM", emoji: "☀️", color: "#f97316" },
    { name: "Evening", range: "6PM-10PM", emoji: "🌆", color: "#8b5cf6" },
    { name: "Night", range: "10PM-6AM", emoji: "🌙", color: "#3b82f6" },
];

function getTimeSlot(hour: number): number {
    if (hour >= 6 && hour < 12) return 0; // Morning
    if (hour >= 12 && hour < 18) return 1; // Afternoon
    if (hour >= 18 && hour < 22) return 2; // Evening
    return 3; // Night
}

export default function PeakHoursChart({ watchDates }: PeakHoursChartProps) {
    const hourData = useMemo(() => {
        const counts = [0, 0, 0, 0];
        let hasTimeData = false;

        watchDates.forEach(dateStr => {
            const date = new Date(dateStr);
            const hour = date.getHours();

            // Check if we have actual time data (not midnight default)
            if (hour !== 0 || date.getMinutes() !== 0) {
                hasTimeData = true;
                counts[getTimeSlot(hour)]++;
            }
        });

        return { counts, hasTimeData };
    }, [watchDates]);

    const maxCount = Math.max(...hourData.counts, 1);
    const peakIndex = hourData.counts.indexOf(Math.max(...hourData.counts));

    if (!hourData.hasTimeData) {
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
                    ⏰ Peak Viewing Hours
                </h3>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>
                    Time data not available for your watch history
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
                    ⏰ Peak Viewing Hours
                </h3>
                <div style={{
                    fontSize: "0.85rem",
                    color: timeSlots[peakIndex].color,
                    fontWeight: "500",
                }}>
                    {timeSlots[peakIndex].name} viewer
                </div>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "10px",
            }}>
                {timeSlots.map((slot, index) => {
                    const percentage = (hourData.counts[index] / maxCount) * 100;
                    const isPeak = index === peakIndex;

                    return (
                        <motion.div
                            key={slot.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                textAlign: "center",
                                padding: "15px 10px",
                                background: isPeak
                                    ? `${slot.color}22`
                                    : "rgba(255,255,255,0.03)",
                                borderRadius: "12px",
                                border: isPeak ? `1px solid ${slot.color}44` : "none",
                            }}
                        >
                            <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
                                {slot.emoji}
                            </div>

                            {/* Vertical bar */}
                            <div style={{
                                height: "60px",
                                background: "rgba(255,255,255,0.1)",
                                borderRadius: "4px",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                marginBottom: "8px",
                            }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${percentage}%` }}
                                    transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                                    style={{
                                        background: slot.color,
                                        borderRadius: "4px 4px 0 0",
                                    }}
                                />
                            </div>

                            <div style={{
                                fontSize: "0.75rem",
                                fontWeight: "600",
                                color: isPeak ? slot.color : "#888",
                            }}>
                                {slot.name}
                            </div>
                            <div style={{
                                fontSize: "0.7rem",
                                color: "#666",
                            }}>
                                {slot.range}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
