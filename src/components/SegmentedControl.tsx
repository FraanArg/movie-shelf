"use client";

import { useState, useRef, useEffect } from "react";

interface SegmentedControlProps {
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
    size?: "small" | "medium";
}

/**
 * iOS-style Segmented Control component
 * Provides Apple-like toggle between multiple options
 */
export default function SegmentedControl({
    options,
    value,
    onChange,
    size = "medium",
}: SegmentedControlProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    // Update indicator position when value changes
    useEffect(() => {
        if (!containerRef.current) return;

        const activeIndex = options.findIndex(opt => opt.value === value);
        const buttons = containerRef.current.querySelectorAll("button");

        if (buttons[activeIndex]) {
            const button = buttons[activeIndex] as HTMLButtonElement;
            setIndicatorStyle({
                left: button.offsetLeft,
                width: button.offsetWidth,
            });
        }
    }, [value, options]);

    const padding = size === "small" ? "var(--space-xxs)" : "var(--space-xs)";
    const fontSize = size === "small" ? "var(--font-size-caption1)" : "var(--font-size-subhead)";
    const height = size === "small" ? "28px" : "32px";

    return (
        <div
            ref={containerRef}
            style={{
                display: "inline-flex",
                position: "relative",
                background: "var(--fill-tertiary)",
                borderRadius: "var(--radius-sm)",
                padding: padding,
                gap: "var(--space-xxs)",
            }}
        >
            {/* Animated indicator background */}
            <div
                style={{
                    position: "absolute",
                    top: padding,
                    left: indicatorStyle.left,
                    width: indicatorStyle.width,
                    height: `calc(${height} - 4px)`,
                    background: "var(--bg-elevated)",
                    borderRadius: "calc(var(--radius-sm) - 2px)",
                    boxShadow: "var(--shadow-sm)",
                    transition: "left 0.2s ease, width 0.2s ease",
                    pointerEvents: "none",
                }}
            />

            {options.map((option) => {
                const isActive = option.value === value;

                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        style={{
                            position: "relative",
                            zIndex: 1,
                            padding: `0 var(--space-md)`,
                            height: `calc(${height} - 4px)`,
                            fontSize: fontSize,
                            fontWeight: isActive ? 600 : 400,
                            fontFamily: "var(--font-system)",
                            color: isActive ? "var(--label-primary)" : "var(--label-secondary)",
                            background: "transparent",
                            border: "none",
                            borderRadius: "calc(var(--radius-sm) - 2px)",
                            cursor: "pointer",
                            transition: "color 0.2s ease, font-weight 0.2s ease",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
