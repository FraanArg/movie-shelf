"use client";

import { motion } from "framer-motion";

interface StreakStatsProps {
    watchDates: string[]; // ISO date strings
}

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastWatchDate: string | null;
}

function calculateStreaks(watchDates: string[]): StreakData {
    if (watchDates.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastWatchDate: null };
    }

    // Get unique dates and sort them
    const uniqueDates = [...new Set(watchDates.map(d => d.split("T")[0]))].sort();

    if (uniqueDates.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastWatchDate: null };
    }

    const lastWatchDate = uniqueDates[uniqueDates.length - 1];

    // Calculate longest streak
    let longestStreak = 1;
    let currentRun = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            currentRun++;
            longestStreak = Math.max(longestStreak, currentRun);
        } else {
            currentRun = 1;
        }
    }

    // Calculate current streak (must include today or yesterday)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split("T")[0];
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Check if last watch was today or yesterday
    if (lastWatchDate !== todayStr && lastWatchDate !== yesterdayStr) {
        return { currentStreak: 0, longestStreak, lastWatchDate };
    }

    // Count backwards from the most recent date
    let currentStreak = 1;
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const currDate = new Date(uniqueDates[i + 1]);
        const prevDate = new Date(uniqueDates[i]);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            currentStreak++;
        } else {
            break;
        }
    }

    return { currentStreak, longestStreak, lastWatchDate };
}

export default function StreakStats({ watchDates }: StreakStatsProps) {
    const { currentStreak, longestStreak } = calculateStreaks(watchDates);

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    padding: "20px",
                    background: currentStreak > 0
                        ? "linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(251, 146, 60, 0.1))"
                        : "rgba(255,255,255,0.05)",
                    borderRadius: "16px",
                    textAlign: "center",
                    border: currentStreak > 0 ? "1px solid rgba(251, 146, 60, 0.3)" : "none",
                }}
            >
                <div style={{ fontSize: "2rem", marginBottom: "5px" }}>
                    {currentStreak > 0 ? "🔥" : "❄️"}
                </div>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    style={{
                        fontSize: "2.5rem",
                        fontWeight: "800",
                        color: currentStreak > 0 ? "#fb923c" : "#888",
                    }}
                >
                    {currentStreak}
                </motion.div>
                <div style={{ color: "#888", fontSize: "0.85rem" }}>
                    Current Streak
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                    padding: "20px",
                    background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.1))",
                    borderRadius: "16px",
                    textAlign: "center",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                }}
            >
                <div style={{ fontSize: "2rem", marginBottom: "5px" }}>🏆</div>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.3 }}
                    style={{
                        fontSize: "2.5rem",
                        fontWeight: "800",
                        color: "#a855f7",
                    }}
                >
                    {longestStreak}
                </motion.div>
                <div style={{ color: "#888", fontSize: "0.85rem" }}>
                    Longest Streak
                </div>
            </motion.div>
        </div>
    );
}
