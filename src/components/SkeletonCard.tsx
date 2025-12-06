"use client";

export default function SkeletonCard() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Poster Skeleton */}
            <div
                className="shimmer-premium"
                style={{
                    borderRadius: "14px",
                    overflow: "hidden",
                    position: "relative",
                    aspectRatio: "2/3",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.06)"
                }}
            />
            {/* Title Skeleton */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div
                    className="shimmer-premium"
                    style={{
                        width: "70%",
                        height: "12px",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.06)"
                    }}
                />
                <div
                    className="shimmer-premium"
                    style={{
                        width: "40%",
                        height: "10px",
                        borderRadius: "5px",
                        background: "rgba(255, 255, 255, 0.04)"
                    }}
                />
            </div>
        </div>
    );
}

