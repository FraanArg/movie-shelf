"use client";

import { useMemo, useRef, useEffect } from "react";

interface GenreTrendChartProps {
    items: {
        Genre?: string;
        date?: string;
    }[];
}

const genreColors: Record<string, string> = {
    "Action": "#ef4444",
    "Comedy": "#fbbf24",
    "Drama": "#8b5cf6",
    "Horror": "#dc2626",
    "Sci-Fi": "#06b6d4",
    "Romance": "#ec4899",
    "Thriller": "#f97316",
    "Animation": "#22c55e",
    "Documentary": "#3b82f6",
    "Fantasy": "#a855f7",
};

export default function GenreTrendChart({ items }: GenreTrendChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const quarterlyData = useMemo(() => {
        // Group items by quarter
        const quarters: Record<string, Record<string, number>> = {};
        const genreSet = new Set<string>();

        items.forEach(item => {
            if (!item.date || !item.Genre || item.Genre === "N/A") return;

            const date = new Date(item.date);
            const year = date.getFullYear();
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            const key = `${year} Q${quarter}`;

            if (!quarters[key]) quarters[key] = {};

            // Take primary genre
            const primaryGenre = item.Genre.split(",")[0].trim();
            genreSet.add(primaryGenre);
            quarters[key][primaryGenre] = (quarters[key][primaryGenre] || 0) + 1;
        });

        // Get sorted quarter keys (last 8 quarters)
        const sortedKeys = Object.keys(quarters).sort().slice(-8);

        // Get top 5 genres overall
        const totalByGenre: Record<string, number> = {};
        sortedKeys.forEach(key => {
            Object.entries(quarters[key]).forEach(([genre, count]) => {
                totalByGenre[genre] = (totalByGenre[genre] || 0) + count;
            });
        });

        const topGenres = Object.entries(totalByGenre)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([genre]) => genre);

        return { quarters, sortedKeys, topGenres };
    }, [items]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || quarterlyData.sortedKeys.length < 2) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const width = 600;
        const height = 200;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        const padding = { top: 30, right: 20, bottom: 50, left: 40 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const { quarters, sortedKeys, topGenres } = quarterlyData;

        // Calculate max value for stacked area
        let maxTotal = 0;
        sortedKeys.forEach(key => {
            const total = topGenres.reduce((sum, genre) => sum + (quarters[key][genre] || 0), 0);
            maxTotal = Math.max(maxTotal, total);
        });
        maxTotal = Math.max(maxTotal, 1);

        ctx.clearRect(0, 0, width, height);

        // Draw stacked areas (from bottom to top)
        topGenres.reverse().forEach((genre, genreIndex) => {
            ctx.beginPath();

            // Start from bottom left
            const startX = padding.left;
            ctx.moveTo(startX, height - padding.bottom);

            // Draw top of this genre's area
            sortedKeys.forEach((key, i) => {
                const x = padding.left + (i / (sortedKeys.length - 1)) * chartWidth;

                // Calculate cumulative height up to and including this genre
                let cumulative = 0;
                for (let j = topGenres.length - 1; j >= genreIndex; j--) {
                    cumulative += quarters[key][topGenres[j]] || 0;
                }

                const y = height - padding.bottom - (cumulative / maxTotal) * chartHeight;

                if (i === 0) {
                    ctx.lineTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            // Draw bottom of area (top of previous genre or baseline)
            for (let i = sortedKeys.length - 1; i >= 0; i--) {
                const key = sortedKeys[i];
                const x = padding.left + (i / (sortedKeys.length - 1)) * chartWidth;

                // Calculate cumulative height below this genre
                let cumulative = 0;
                for (let j = topGenres.length - 1; j > genreIndex; j--) {
                    cumulative += quarters[key][topGenres[j]] || 0;
                }

                const y = height - padding.bottom - (cumulative / maxTotal) * chartHeight;
                ctx.lineTo(x, y);
            }

            ctx.closePath();

            const color = genreColors[genre] || `hsl(${genreIndex * 60}, 70%, 50%)`;
            ctx.fillStyle = color + "aa";
            ctx.fill();
        });

        // Draw x-axis labels
        ctx.font = "500 9px system-ui, sans-serif";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";

        sortedKeys.forEach((key, i) => {
            if (i % 2 === 0 || sortedKeys.length <= 4) {
                const x = padding.left + (i / (sortedKeys.length - 1)) * chartWidth;
                ctx.fillText(key, x, height - 15);
            }
        });
    }, [quarterlyData]);

    if (quarterlyData.sortedKeys.length < 2) {
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
                    📊 Genre Trends
                </h3>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>
                    Need more watch history to show trends
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
                marginBottom: "15px",
            }}>
                📊 Genre Trends Over Time
            </h3>

            <div style={{ overflowX: "auto" }}>
                <canvas
                    ref={canvasRef}
                    style={{
                        display: "block",
                        maxWidth: "100%",
                    }}
                />
            </div>

            {/* Legend */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "15px",
                marginTop: "15px",
            }}>
                {quarterlyData.topGenres.map(genre => (
                    <div
                        key={genre}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.8rem",
                        }}
                    >
                        <div style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "2px",
                            background: genreColors[genre] || "#888",
                        }} />
                        {genre}
                    </div>
                ))}
            </div>
        </div>
    );
}
