"use client";

import { Badge } from "@/lib/badges";

interface BadgeGridProps {
    earnedBadges: Badge[];
    allBadges: Badge[];
}

export default function BadgeGrid({ earnedBadges, allBadges }: BadgeGridProps) {
    const earnedIds = new Set(earnedBadges.map(b => b.id));

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "16px",
        }}>
            {allBadges.map((badge) => {
                const isEarned = earnedIds.has(badge.id);

                return (
                    <div
                        key={badge.id}
                        style={{
                            position: "relative",
                            background: isEarned
                                ? `linear-gradient(135deg, ${badge.color}20, ${badge.color}10)`
                                : "rgba(255,255,255,0.02)",
                            border: isEarned
                                ? `2px solid ${badge.color}50`
                                : "2px solid rgba(255,255,255,0.05)",
                            borderRadius: "16px",
                            padding: "20px 16px",
                            textAlign: "center",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            filter: isEarned ? "none" : "grayscale(1)",
                            opacity: isEarned ? 1 : 0.4,
                        }}
                        title={`${badge.requirement}${isEarned ? " ✓" : ""}`}
                        onMouseEnter={(e) => {
                            if (isEarned) {
                                e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                                e.currentTarget.style.boxShadow = `0 10px 30px ${badge.color}30`;
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0) scale(1)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    >
                        {/* Earned indicator */}
                        {isEarned && (
                            <div style={{
                                position: "absolute",
                                top: "-6px",
                                right: "-6px",
                                width: "20px",
                                height: "20px",
                                background: badge.color,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "10px",
                                color: "#fff",
                                fontWeight: "bold",
                                boxShadow: `0 2px 8px ${badge.color}60`,
                            }}>
                                ✓
                            </div>
                        )}

                        {/* Emoji */}
                        <div style={{
                            fontSize: "2.5rem",
                            marginBottom: "12px",
                            filter: isEarned ? "none" : "grayscale(1)",
                        }}>
                            {badge.emoji}
                        </div>

                        {/* Name */}
                        <div style={{
                            fontWeight: "600",
                            fontSize: "0.9rem",
                            marginBottom: "4px",
                            color: isEarned ? badge.color : "#666",
                        }}>
                            {badge.name}
                        </div>

                        {/* Description */}
                        <div style={{
                            fontSize: "0.75rem",
                            color: "#888",
                            lineHeight: "1.3",
                        }}>
                            {badge.description}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
