"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface GenreRadarChartProps {
    genres: { name: string; count: number }[];
    size?: number;
}

export default function GenreRadarChart({ genres, size = 300 }: GenreRadarChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true });
    const [animationProgress, setAnimationProgress] = useState(0);

    useEffect(() => {
        if (!isInView) return;

        // Animate from 0 to 1
        const startTime = Date.now();
        const duration = 1000; // 1 second animation

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Easing function (ease out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimationProgress(eased);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView]);

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

        // Draw data polygon with gradient fill (animated)
        ctx.beginPath();
        genres.forEach((genre, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const value = (genre.count / maxCount) * radius * animationProgress;
            const x = centerX + Math.cos(angle) * value;
            const y = centerY + Math.sin(angle) * value;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();

        // Gradient fill with pulse effect
        const pulseScale = 1 + Math.sin(Date.now() / 500) * 0.02;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * pulseScale);
        gradient.addColorStop(0, "rgba(99, 102, 241, 0.8)");
        gradient.addColorStop(1, "rgba(168, 85, 247, 0.4)");
        ctx.fillStyle = gradient;
        ctx.fill();

        // Stroke outline
        ctx.strokeStyle = "rgba(168, 85, 247, 0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw data points (animated)
        genres.forEach((genre, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const value = (genre.count / maxCount) * radius * animationProgress;
            const x = centerX + Math.cos(angle) * value;
            const y = centerY + Math.sin(angle) * value;

            // Pulsing point size
            const pointSize = 4 + Math.sin(Date.now() / 300 + i) * 0.5;

            ctx.beginPath();
            ctx.arc(x, y, pointSize, 0, Math.PI * 2);
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
    }, [genres, size, animationProgress]);

    // Continuous pulse animation
    useEffect(() => {
        if (animationProgress < 1) return;

        const interval = setInterval(() => {
            // Force re-render for pulse effect
            setAnimationProgress(p => p + 0.0001);
        }, 50);

        return () => clearInterval(interval);
    }, [animationProgress]);

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
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "20px"
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    width: size,
                    height: size
                }}
            />
        </motion.div>
    );
}
