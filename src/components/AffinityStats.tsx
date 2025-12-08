"use client";

import { useState } from "react";
import Link from "next/link";

interface AffinityItem {
    name: string;
    count: number;
    movies: string[];
}

interface AffinityStatsProps {
    directors: AffinityItem[];
    actors: AffinityItem[];
}

export default function AffinityStats({ directors, actors }: AffinityStatsProps) {
    const [expandedDirector, setExpandedDirector] = useState<string | null>(null);
    const [expandedActor, setExpandedActor] = useState<string | null>(null);

    const maxDirectorCount = Math.max(...directors.map(d => d.count), 1);
    const maxActorCount = Math.max(...actors.map(a => a.count), 1);

    const toggleDirector = (name: string) => {
        setExpandedDirector(expandedDirector === name ? null : name);
    };

    const toggleActor = (name: string) => {
        setExpandedActor(expandedActor === name ? null : name);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {/* Top Directors */}
            <div>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.5rem" }}>🎬</span>
                    Top Directors
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {directors.map((director, index) => (
                        <div key={director.name}>
                            <div
                                onClick={() => toggleDirector(director.name)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "15px",
                                    padding: "12px 16px",
                                    background: expandedDirector === director.name ? "rgba(168, 85, 247, 0.1)" : "rgba(255,255,255,0.03)",
                                    borderRadius: expandedDirector === director.name ? "12px 12px 0 0" : "12px",
                                    transition: "all 0.2s ease",
                                    cursor: "pointer",
                                    border: expandedDirector === director.name ? "1px solid rgba(168, 85, 247, 0.3)" : "1px solid transparent",
                                    borderBottom: expandedDirector === director.name ? "none" : "1px solid transparent",
                                }}
                                onMouseEnter={(e) => {
                                    if (expandedDirector !== director.name) {
                                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                        e.currentTarget.style.transform = "translateX(4px)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (expandedDirector !== director.name) {
                                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                                        e.currentTarget.style.transform = "translateX(0)";
                                    }
                                }}
                            >
                                <span style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: `hsl(${280 - index * 20}, 70%, 50%)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.8rem",
                                    fontWeight: "bold",
                                    color: "#fff",
                                }}>
                                    {index + 1}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: "600", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        {director.name}
                                        <span style={{ fontSize: "0.7rem", opacity: 0.5 }}>
                                            {expandedDirector === director.name ? "▲" : "▼"}
                                        </span>
                                    </div>
                                    <div style={{
                                        height: "4px",
                                        background: "rgba(255,255,255,0.1)",
                                        borderRadius: "2px",
                                        overflow: "hidden",
                                    }}>
                                        <div style={{
                                            width: `${(director.count / maxDirectorCount) * 100}%`,
                                            height: "100%",
                                            background: `linear-gradient(90deg, hsl(${280 - index * 20}, 70%, 50%), hsl(${260 - index * 20}, 70%, 60%))`,
                                            borderRadius: "2px",
                                            transition: "width 0.5s ease",
                                        }} />
                                    </div>
                                </div>
                                <span style={{
                                    background: "rgba(168, 85, 247, 0.2)",
                                    color: "#a855f7",
                                    padding: "4px 10px",
                                    borderRadius: "12px",
                                    fontSize: "0.8rem",
                                    fontWeight: "600",
                                }}>
                                    {director.count} {director.count === 1 ? "title" : "titles"}
                                </span>
                            </div>

                            {/* Expanded movie list */}
                            {expandedDirector === director.name && (
                                <div style={{
                                    padding: "15px",
                                    background: "rgba(168, 85, 247, 0.05)",
                                    borderRadius: "0 0 12px 12px",
                                    border: "1px solid rgba(168, 85, 247, 0.3)",
                                    borderTop: "none",
                                }}>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                        {director.movies.map((movie, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    padding: "6px 12px",
                                                    background: "rgba(255,255,255,0.1)",
                                                    borderRadius: "16px",
                                                    fontSize: "0.85rem",
                                                }}
                                            >
                                                {movie}
                                            </span>
                                        ))}
                                    </div>
                                    <Link
                                        href={`/?director=${encodeURIComponent(director.name)}`}
                                        style={{
                                            display: "inline-block",
                                            marginTop: "12px",
                                            fontSize: "0.8rem",
                                            color: "#a855f7",
                                            textDecoration: "none",
                                        }}
                                    >
                                        View in Library →
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Actors */}
            <div>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.5rem" }}>⭐</span>
                    Top Actors
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {actors.map((actor, index) => (
                        <div key={actor.name}>
                            <div
                                onClick={() => toggleActor(actor.name)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "15px",
                                    padding: "12px 16px",
                                    background: expandedActor === actor.name ? "rgba(59, 130, 246, 0.1)" : "rgba(255,255,255,0.03)",
                                    borderRadius: expandedActor === actor.name ? "12px 12px 0 0" : "12px",
                                    transition: "all 0.2s ease",
                                    cursor: "pointer",
                                    border: expandedActor === actor.name ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent",
                                    borderBottom: expandedActor === actor.name ? "none" : "1px solid transparent",
                                }}
                                onMouseEnter={(e) => {
                                    if (expandedActor !== actor.name) {
                                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                        e.currentTarget.style.transform = "translateX(4px)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (expandedActor !== actor.name) {
                                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                                        e.currentTarget.style.transform = "translateX(0)";
                                    }
                                }}
                            >
                                <span style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    background: `hsl(${200 + index * 15}, 70%, 50%)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.8rem",
                                    fontWeight: "bold",
                                    color: "#fff",
                                }}>
                                    {index + 1}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: "600", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        {actor.name}
                                        <span style={{ fontSize: "0.7rem", opacity: 0.5 }}>
                                            {expandedActor === actor.name ? "▲" : "▼"}
                                        </span>
                                    </div>
                                    <div style={{
                                        height: "4px",
                                        background: "rgba(255,255,255,0.1)",
                                        borderRadius: "2px",
                                        overflow: "hidden",
                                    }}>
                                        <div style={{
                                            width: `${(actor.count / maxActorCount) * 100}%`,
                                            height: "100%",
                                            background: `linear-gradient(90deg, hsl(${200 + index * 15}, 70%, 50%), hsl(${220 + index * 15}, 70%, 60%))`,
                                            borderRadius: "2px",
                                            transition: "width 0.5s ease",
                                        }} />
                                    </div>
                                </div>
                                <span style={{
                                    background: "rgba(59, 130, 246, 0.2)",
                                    color: "#3b82f6",
                                    padding: "4px 10px",
                                    borderRadius: "12px",
                                    fontSize: "0.8rem",
                                    fontWeight: "600",
                                }}>
                                    {actor.count} {actor.count === 1 ? "title" : "titles"}
                                </span>
                            </div>

                            {/* Expanded movie list */}
                            {expandedActor === actor.name && (
                                <div style={{
                                    padding: "15px",
                                    background: "rgba(59, 130, 246, 0.05)",
                                    borderRadius: "0 0 12px 12px",
                                    border: "1px solid rgba(59, 130, 246, 0.3)",
                                    borderTop: "none",
                                }}>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                        {actor.movies.map((movie, i) => (
                                            <span
                                                key={i}
                                                style={{
                                                    padding: "6px 12px",
                                                    background: "rgba(255,255,255,0.1)",
                                                    borderRadius: "16px",
                                                    fontSize: "0.85rem",
                                                }}
                                            >
                                                {movie}
                                            </span>
                                        ))}
                                    </div>
                                    <Link
                                        href={`/?actor=${encodeURIComponent(actor.name)}`}
                                        style={{
                                            display: "inline-block",
                                            marginTop: "12px",
                                            fontSize: "0.8rem",
                                            color: "#3b82f6",
                                            textDecoration: "none",
                                        }}
                                    >
                                        View in Library →
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
