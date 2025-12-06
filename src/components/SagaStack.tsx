"use client";

import { useState } from "react";
import MovieCard from "./MovieCard";

interface SagaStackProps {
    label: string;
    movies: any[];
}

export default function SagaStack({ label, movies }: SagaStackProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (movies.length === 0) return null;

    // If expanded, show a grid
    if (isExpanded) {
        return (
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "16px", marginBottom: "40px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "600" }}>{label} Collection</h2>
                    <button onClick={() => setIsExpanded(false)} style={{ background: "transparent", border: "none", color: "var(--accent)", cursor: "pointer" }}>Close</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "20px" }}>
                    {movies.map(movie => (
                        <div key={movie.id} style={{ aspectRatio: "2/3" }}>
                            <MovieCard {...movie} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Stacked View
    return (
        <div
            onClick={() => setIsExpanded(true)}
            style={{
                position: "relative",
                width: "180px",
                height: "270px",
                cursor: "pointer",
                transition: "transform 0.3s ease",
                margin: "0 auto"
            }}
            className="saga-stack"
        >
            {/* Back Cards */}
            {movies.slice(1, 3).map((movie, i) => (
                <div
                    key={movie.id}
                    style={{
                        position: "absolute",
                        top: -((i + 1) * 10),
                        left: (i + 1) * 10,
                        width: "100%",
                        height: "100%",
                        zIndex: 2 - i,
                        transform: `scale(${1 - (i + 1) * 0.05})`,
                        opacity: 0.6,
                        filter: "brightness(0.5)",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                    }}
                >
                    <img src={movie.posterUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
            ))}

            {/* Front Card */}
            <div style={{ position: "relative", width: "100%", height: "100%", zIndex: 10, borderRadius: "12px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                <MovieCard {...movies[0]} />
            </div>

            <div style={{ position: "absolute", bottom: "-40px", width: "100%", textAlign: "center", fontWeight: "bold", fontSize: "1.1rem" }}>
                {label}
            </div>
        </div>
    );
}
