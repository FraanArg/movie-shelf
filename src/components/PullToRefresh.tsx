"use client";

import { useState, useEffect, useCallback } from "react";

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
}

export default function PullToRefresh({ onRefresh }: PullToRefreshProps) {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [startY, setStartY] = useState(0);

    const threshold = 80;

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (window.scrollY === 0) {
            setStartY(e.touches[0].clientY);
        }
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (startY === 0 || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const distance = currentY - startY;

        if (distance > 0 && window.scrollY === 0) {
            setPullDistance(Math.min(distance * 0.5, 120));
        }
    }, [startY, isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }
        setPullDistance(0);
        setStartY(0);
    }, [pullDistance, isRefreshing, onRefresh]);

    useEffect(() => {
        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchmove", handleTouchMove, { passive: true });
        window.addEventListener("touchend", handleTouchEnd);

        return () => {
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    const isVisible = pullDistance > 20 || isRefreshing;

    return (
        <div
            className={`pull-indicator ${isVisible ? "visible" : ""} ${isRefreshing ? "refreshing" : ""}`}
            style={{
                top: isVisible ? `${Math.min(pullDistance, 80)}px` : "-50px",
                opacity: Math.min(pullDistance / threshold, 1)
            }}
        >
            {isRefreshing ? "⟳" : "↓"}
        </div>
    );
}
