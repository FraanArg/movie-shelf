"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

interface StatCardEnhancedProps {
    label: string;
    value: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
    emoji?: string;
    color?: string;
    delay?: number;
}

export default function StatCardEnhanced({
    label,
    value,
    suffix = "",
    prefix = "",
    decimals = 0,
    emoji,
    color = "var(--accent)",
    delay = 0,
}: StatCardEnhancedProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            style={{
                background: "rgba(255,255,255,0.05)",
                padding: "20px",
                borderRadius: "16px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Gradient accent */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: `linear-gradient(90deg, ${color}, ${color}88)`,
                }}
            />

            {emoji && (
                <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>
                    {emoji}
                </div>
            )}

            <div
                style={{
                    fontSize: "2.5rem",
                    fontWeight: "800",
                    marginBottom: "5px",
                    color: color,
                }}
            >
                <AnimatedCounter
                    value={value}
                    suffix={suffix}
                    prefix={prefix}
                    decimals={decimals}
                    duration={1.2 + delay * 0.3}
                />
            </div>

            <div
                style={{
                    color: "#888",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                }}
            >
                {label}
            </div>
        </motion.div>
    );
}
