"use client";

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
    const maxDirectorCount = Math.max(...directors.map(d => d.count), 1);
    const maxActorCount = Math.max(...actors.map(a => a.count), 1);

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
                        <Link
                            key={director.name}
                            href={`/?director=${encodeURIComponent(director.name)}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "15px",
                                    padding: "12px 16px",
                                    background: "rgba(255,255,255,0.03)",
                                    borderRadius: "12px",
                                    transition: "all 0.2s ease",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                    e.currentTarget.style.transform = "translateX(4px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                                    e.currentTarget.style.transform = "translateX(0)";
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
                                    <div style={{ fontWeight: "600", marginBottom: "4px" }}>{director.name}</div>
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
                                    {director.count} {director.count === 1 ? "film" : "films"}
                                </span>
                            </div>
                        </Link>
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
                        <Link
                            key={actor.name}
                            href={`/?actor=${encodeURIComponent(actor.name)}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "15px",
                                    padding: "12px 16px",
                                    background: "rgba(255,255,255,0.03)",
                                    borderRadius: "12px",
                                    transition: "all 0.2s ease",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                                    e.currentTarget.style.transform = "translateX(4px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                                    e.currentTarget.style.transform = "translateX(0)";
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
                                    <div style={{ fontWeight: "600", marginBottom: "4px" }}>{actor.name}</div>
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
                                    {actor.count} {actor.count === 1 ? "film" : "films"}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
