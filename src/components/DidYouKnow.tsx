"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface DidYouKnowProps {
    items: {
        title: string;
        year: string;
        Director?: string;
        Runtime?: string;
        Genre?: string;
        imdbRating?: string;
        date?: string;
    }[];
}

interface Fact {
    emoji: string;
    text: string;
}

function generateFacts(items: DidYouKnowProps["items"]): Fact[] {
    const facts: Fact[] = [];

    if (items.length === 0) return facts;

    // Oldest movie
    const byYear = [...items].filter(i => i.year).sort((a, b) =>
        parseInt(a.year) - parseInt(b.year)
    );
    if (byYear.length > 0) {
        facts.push({
            emoji: "🎞️",
            text: `Your oldest film is "${byYear[0].title}" from ${byYear[0].year}`,
        });
    }

    // Newest movie  
    if (byYear.length > 1) {
        const newest = byYear[byYear.length - 1];
        facts.push({
            emoji: "✨",
            text: `Your newest film is "${newest.title}" from ${newest.year}`,
        });
    }

    // Longest movie
    const withRuntime = items.filter(i => i.Runtime && i.Runtime !== "N/A");
    if (withRuntime.length > 0) {
        const sorted = withRuntime.sort((a, b) => {
            const aMin = parseInt(a.Runtime || "0");
            const bMin = parseInt(b.Runtime || "0");
            return bMin - aMin;
        });
        const longest = sorted[0];
        const minutes = parseInt(longest.Runtime || "0");
        facts.push({
            emoji: "⏱️",
            text: `Your longest film is "${longest.title}" at ${minutes} minutes`,
        });
    }

    // Most watched director
    const directorCounts: Record<string, number> = {};
    items.forEach(item => {
        if (item.Director && item.Director !== "N/A") {
            const directors = item.Director.split(", ");
            directors.forEach(d => {
                directorCounts[d.trim()] = (directorCounts[d.trim()] || 0) + 1;
            });
        }
    });
    const topDirector = Object.entries(directorCounts).sort((a, b) => b[1] - a[1])[0];
    if (topDirector && topDirector[1] > 2) {
        facts.push({
            emoji: "🎬",
            text: `You've watched ${topDirector[1]} films by ${topDirector[0]}`,
        });
    }

    // Highest rated movie in collection
    const withRating = items.filter(i => i.imdbRating && parseFloat(i.imdbRating) > 0);
    if (withRating.length > 0) {
        const sorted = withRating.sort((a, b) =>
            parseFloat(b.imdbRating || "0") - parseFloat(a.imdbRating || "0")
        );
        facts.push({
            emoji: "⭐",
            text: `Your highest rated film is "${sorted[0].title}" at ${sorted[0].imdbRating}/10`,
        });
    }

    // Genre variety
    const genres = new Set<string>();
    items.forEach(item => {
        if (item.Genre && item.Genre !== "N/A") {
            item.Genre.split(", ").forEach(g => genres.add(g.trim()));
        }
    });
    if (genres.size > 5) {
        facts.push({
            emoji: "🎭",
            text: `You've explored ${genres.size} different genres`,
        });
    }

    // First movie ever added
    const byDate = items.filter(i => i.date).sort((a, b) =>
        new Date(a.date!).getTime() - new Date(b.date!).getTime()
    );
    if (byDate.length > 0) {
        const firstDate = new Date(byDate[0].date!);
        const formattedDate = firstDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
        facts.push({
            emoji: "🎉",
            text: `Your movie journey started on ${formattedDate}`,
        });
    }

    return facts;
}

export default function DidYouKnow({ items }: DidYouKnowProps) {
    const facts = useMemo(() => generateFacts(items), [items]);

    // Pick a random fact
    const randomFact = useMemo(() => {
        if (facts.length === 0) return null;
        return facts[Math.floor(Math.random() * facts.length)];
    }, [facts]);

    if (!randomFact) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                padding: "20px",
                background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(59, 130, 246, 0.15))",
                borderRadius: "16px",
                border: "1px solid rgba(168, 85, 247, 0.2)",
                display: "flex",
                alignItems: "center",
                gap: "15px",
            }}
        >
            <span style={{ fontSize: "2rem" }}>{randomFact.emoji}</span>
            <div>
                <div style={{
                    fontSize: "0.75rem",
                    color: "#a855f7",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "5px",
                }}>
                    Did you know?
                </div>
                <div style={{
                    fontSize: "0.95rem",
                    color: "var(--foreground)",
                }}>
                    {randomFact.text}
                </div>
            </div>
        </motion.div>
    );
}
