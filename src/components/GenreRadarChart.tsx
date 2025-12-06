"use client";

import { useEffect, useRef } from "react";

interface GenreRadarChartProps {
    genres: { name: string; count: number }[];
    size?: number;
}

export default function GenreRadarChart({ genres, size = 300 }: GenreRadarChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || genres.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // High DPI support
        const dpr = window.devicePixelRatio || 1;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size * 0.35;
        const maxCount = Math.max(...genres.map(g => g.count), 1);
        const angleStep = (Math.PI * 2) / genres.length;

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Draw background web rings
        const rings = 4;
        for (let i = 1; i <= rings; i++) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.08})`;
            ctx.lineWidth = 1;
            for (let j = 0; j <= genres.length; j++) {
                const angle = j * angleStep - Math.PI / 2;
                const r = (radius / rings) * i;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                if (j === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.stroke();
        }

        // Draw axis lines
        genres.forEach((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            ctx.beginPath();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 1;
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle) * radius,
                centerY + Math.sin(angle) * radius
            );
            ctx.stroke();
        });

        // Draw data polygon with gradient fill
        ctx.beginPath();
        genres.forEach((genre, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const value = (genre.count / maxCount) * radius;
            const x = centerX + Math.cos(angle) * value;
            const y = centerY + Math.sin(angle) * value;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();

        // Gradient fill
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, "rgba(99, 102, 241, 0.8)");
        gradient.addColorStop(1, "rgba(168, 85, 247, 0.4)");
        ctx.fillStyle = gradient;
        ctx.fill();

        // Stroke outline
        ctx.strokeStyle = "rgba(168, 85, 247, 0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw data points
        genres.forEach((genre, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const value = (genre.count / maxCount) * radius;
            const x = centerX + Math.cos(angle) * value;
            const y = centerY + Math.sin(angle) * value;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#a855f7";
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Draw labels
        ctx.font = "600 11px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        genres.forEach((genre, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + 25;
            const x = centerX + Math.cos(angle) * labelRadius;
            const y = centerY + Math.sin(angle) * labelRadius;

            ctx.fillStyle = "#aaa";
            ctx.fillText(genre.name, x, y);

            // Count below label
            ctx.font = "500 10px system-ui, sans-serif";
            ctx.fillStyle = "#666";
            ctx.fillText(`${genre.count}`, x, y + 14);
            ctx.font = "600 11px system-ui, sans-serif";
        });
    }, [genres, size]);

    if (genres.length < 3) {
        return (
            <div style={{
                padding: "40px",
                textAlign: "center",
                color: "#666",
                fontSize: "0.9rem"
            }}>
                Need at least 3 genres to display radar chart
            </div>
        );
    }

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px"
        }}>
            <canvas
                ref={canvasRef}
                style={{
                    width: size,
                    height: size
                }}
            />
        </div>
    );
}
