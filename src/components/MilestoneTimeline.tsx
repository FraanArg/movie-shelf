"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface MilestoneTimelineProps {
    watchDates: { date: string; title: string }[];
}

const milestones = [1, 10, 25, 50, 100, 200, 300, 400, 500, 750, 1000];

export default function MilestoneTimeline({ watchDates }: MilestoneTimelineProps) {
    const milestoneData = useMemo(() => {
        // Sort by date
        const sorted = [...watchDates].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const achieved: { number: number; date: string; title: string }[] = [];

        milestones.forEach(num => {
            if (sorted.length >= num) {
                const item = sorted[num - 1];
                achieved.push({
                    number: num,
                    date: item.date,
                    title: item.title,
                });
            }
        });

        return achieved;
    }, [watchDates]);

    if (milestoneData.length === 0) {
        return null;
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const getEmoji = (num: number) => {
        if (num === 1) return "🎬";
        if (num === 100) return "💯";
        if (num === 500) return "🏆";
        if (num === 1000) return "👑";
        return "🎯";
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
                🏅 Milestones
            </h3>

            <div style={{
                position: "relative",
                paddingLeft: "30px",
            }}>
                {/* Timeline line */}
                <div style={{
                    position: "absolute",
                    left: "10px",
                    top: "5px",
                    bottom: "5px",
                    width: "2px",
                    background: "linear-gradient(to bottom, var(--accent), rgba(168, 85, 247, 0.3))",
                    borderRadius: "1px",
                }} />

                {milestoneData.slice(-6).reverse().map((milestone, index) => (
                    <motion.div
                        key={milestone.number}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                            position: "relative",
                            marginBottom: "20px",
                        }}
                    >
                        {/* Timeline dot */}
                        <div style={{
                            position: "absolute",
                            left: "-25px",
                            top: "5px",
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: "var(--accent)",
                            border: "2px solid var(--background)",
                        }} />

                        <div style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px",
                        }}>
                            <span style={{ fontSize: "1.3rem" }}>
                                {getEmoji(milestone.number)}
                            </span>
                            <div>
                                <div style={{
                                    fontWeight: "600",
                                    fontSize: "1rem",
                                    marginBottom: "2px",
                                }}>
                                    {milestone.number === 1 ? "First Movie" : `Movie #${milestone.number}`}
                                </div>
                                <div style={{
                                    fontSize: "0.85rem",
                                    color: "#888",
                                    marginBottom: "2px",
                                }}>
                                    {milestone.title}
                                </div>
                                <div style={{
                                    fontSize: "0.75rem",
                                    color: "#666",
                                }}>
                                    {formatDate(milestone.date)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
