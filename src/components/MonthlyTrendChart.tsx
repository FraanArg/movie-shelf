"use client";

import { useMemo, useRef, useEffect } from "react";

interface MonthlyTrendChartProps {
    watchDates: string[]; // ISO date strings
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function MonthlyTrendChart({ watchDates }: MonthlyTrendChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const monthlyData = useMemo(() => {
        const counts: Record<string, number> = {};
        const now = new Date();

        // Initialize last 12 months with 0
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            counts[key] = 0;
        }

        // Count movies per month
        watchDates.forEach(dateStr => {
            const date = new Date(dateStr);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            if (key in counts) {
                counts[key]++;
            }
        });

        return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
    }, [watchDates]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

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

        const padding = { top: 20, right: 20, bottom: 40, left: 40 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const values = monthlyData.map(([, count]) => count);
        const maxValue = Math.max(...values, 1);

        ctx.clearRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
        }

        // Draw the line chart
        const points: { x: number; y: number }[] = [];

        monthlyData.forEach(([, count], i) => {
            const x = padding.left + (i / (monthlyData.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - (count / maxValue) * chartHeight;
            points.push({ x, y });
        });

        // Gradient fill under line
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, "rgba(99, 102, 241, 0.4)");
        gradient.addColorStop(1, "rgba(99, 102, 241, 0)");

        ctx.beginPath();
        ctx.moveTo(points[0].x, height - padding.bottom);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach((p, i) => {
            if (i > 0) ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        // Draw points
        points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#6366f1";
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Draw month labels
        ctx.font = "500 10px system-ui, sans-serif";
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";

        monthlyData.forEach(([key], i) => {
            const x = padding.left + (i / (monthlyData.length - 1)) * chartWidth;
            const month = parseInt(key.split("-")[1]) - 1;
            ctx.fillText(monthNames[month], x, height - 15);
        });

        // Draw Y axis labels
        ctx.textAlign = "right";
        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight / 4) * (4 - i);
            const value = Math.round((maxValue / 4) * i);
            ctx.fillText(String(value), padding.left - 8, y + 4);
        }
    }, [monthlyData]);

    const totalMovies = monthlyData.reduce((sum, [, count]) => sum + count, 0);
    const avgPerMonth = (totalMovies / 12).toFixed(1);

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
                marginBottom: "15px",
            }}>
                <h3 style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: "var(--foreground)",
                }}>
                    📈 Monthly Trend
                </h3>
                <div style={{
                    fontSize: "0.85rem",
                    color: "var(--foreground)",
                    opacity: 0.6,
                }}>
                    ~{avgPerMonth} movies/month
                </div>
            </div>

            <div style={{ overflowX: "auto" }}>
                <canvas
                    ref={canvasRef}
                    style={{
                        display: "block",
                        maxWidth: "100%",
                    }}
                />
            </div>
        </div>
    );
}
