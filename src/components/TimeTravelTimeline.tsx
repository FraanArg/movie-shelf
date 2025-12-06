"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface TimeTravelTimelineProps {
    onDateChange?: (date: Date | null) => void;
    startDate?: Date;
    endDate?: Date;
}

export default function TimeTravelTimeline({ onDateChange, startDate = new Date("2020-01-01"), endDate = new Date() }: TimeTravelTimelineProps) {
    const [activeDate, setActiveDate] = useState<Date | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Generate months between start and end
    const months: Date[] = [];
    let current = new Date(startDate);
    while (current <= endDate) {
        months.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
    }

    const handleScroll = () => {
        if (!containerRef.current) return;

        // Simple logic: find the centered month
        const center = containerRef.current.scrollLeft + containerRef.current.offsetWidth / 2;
        const itemWidth = 100; // Approx width of a month item
        const index = Math.floor(center / itemWidth);

        if (index >= 0 && index < months.length) {
            // setActiveDate(months[index]);
            // Debounce this call in a real app to avoid too many re-renders
        }
    };

    const selectDate = (date: Date) => {
        if (activeDate === date) {
            setActiveDate(null);
            onDateChange?.(null);
        } else {
            setActiveDate(date);
            onDateChange?.(date);
        }
    };

    return (
        <div className="liquid-glass" style={{
            position: "fixed",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            maxWidth: "800px",
            height: "90px",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            zIndex: 1000,
        }}>
            <div
                ref={containerRef}
                onScroll={handleScroll}
                style={{
                    display: "flex",
                    gap: "10px",
                    overflowX: "auto",
                    width: "100%",
                    scrollSnapType: "x mandatory",
                    scrollbarWidth: "none"
                }}
            >
                {months.map((date, i) => {
                    const isYearStart = date.getMonth() === 0;
                    const isActive = activeDate?.getTime() === date.getTime();

                    return (
                        <div
                            key={i}
                            onClick={() => selectDate(date)}
                            style={{
                                flexShrink: 0,
                                width: isYearStart ? "80px" : "40px",
                                height: "50px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                scrollSnapAlign: "center",
                                cursor: "pointer",
                                opacity: isActive ? 1 : 0.5,
                                transition: "all 0.2s ease"
                            }}
                        >
                            {isYearStart && (
                                <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--glass-text)", marginBottom: "4px" }}>
                                    {date.getFullYear()}
                                </span>
                            )}
                            <div style={{
                                width: "2px",
                                height: isYearStart ? "20px" : "10px",
                                background: isActive ? "var(--accent)" : "var(--glass-text)",
                                borderRadius: "2px"
                            }} />
                            <span style={{ fontSize: "0.6rem", marginTop: "4px", opacity: isActive ? 1 : 0 }}>
                                {date.toLocaleString('default', { month: 'short' })}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
