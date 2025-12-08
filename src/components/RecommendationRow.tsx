"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Movie {
    id: number;
    title: string;
    poster_path: string | null;
    release_date?: string;
    vote_average: number;
}

interface RecommendationRowProps {
    basedOnTitle: string;
    basedOnImdbId: string;
}

export default function RecommendationRow({ basedOnTitle, basedOnImdbId }: RecommendationRowProps) {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchRecommendations() {
            try {
                const response = await fetch(`/api/recommendations?imdbId=${basedOnImdbId}`);
                if (!response.ok) throw new Error("Failed to fetch");
                const data = await response.json();
                setMovies(data.movies || []);
            } catch (e) {
                console.error("Failed to fetch recommendations:", e);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        if (basedOnImdbId) {
            fetchRecommendations();
        }
    }, [basedOnImdbId]);

    if (loading) {
        return (
            <div style={{ padding: "20px 40px" }}>
                <div style={{ display: "flex", gap: "16px", overflowX: "auto" }}>
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: "140px",
                                height: "210px",
                                background: "rgba(255,255,255,0.05)",
                                borderRadius: "10px",
                                flexShrink: 0,
                                animation: "pulse 2s ease-in-out infinite",
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (error || movies.length === 0) {
        return null;
    }

    return (
        <div style={{ padding: "20px 40px", marginTop: "10px" }}>
            <h3 style={{
                color: "var(--foreground)",
                marginBottom: "15px",
                fontSize: "1rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "10px",
            }}>
                <span style={{ opacity: 0.5, fontSize: "0.85rem" }}>Because you watched</span>
                <span style={{
                    background: "linear-gradient(135deg, var(--accent), #30d158)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                }}>
                    {basedOnTitle}
                </span>
            </h3>

            <div
                style={{
                    display: "flex",
                    gap: "16px",
                    overflowX: "auto",
                    paddingBottom: "10px",
                }}
                className="hide-scrollbar"
            >
                {movies.map((movie) => (
                    <RecommendationCard key={movie.id} movie={movie} />
                ))}
            </div>
        </div>
    );
}

function RecommendationCard({ movie }: { movie: Movie }) {
    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
        : null;
    const year = movie.release_date?.split("-")[0] || "N/A";

    return (
        <Link
            href={`/search?q=${encodeURIComponent(movie.title)}`}
            style={{
                flexShrink: 0,
                width: "140px",
                textDecoration: "none",
                color: "inherit",
            }}
        >
            <div style={{
                position: "relative",
                aspectRatio: "2/3",
                borderRadius: "10px",
                overflow: "hidden",
                background: "rgba(255,255,255,0.05)",
                marginBottom: "10px",
                transition: "transform 0.3s ease",
            }}
                className="hover-scale"
            >
                {posterUrl ? (
                    <Image
                        src={posterUrl}
                        alt={movie.title}
                        fill
                        sizes="140px"
                        style={{ objectFit: "cover" }}
                        loading="lazy"
                    />
                ) : (
                    <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#333",
                        fontSize: "2rem",
                    }}>
                        🎬
                    </div>
                )}

                {movie.vote_average > 0 && (
                    <div style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "rgba(0,0,0,0.8)",
                        color: movie.vote_average >= 7 ? "#fbbf24" : "#fff",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}>
                        ⭐ {movie.vote_average.toFixed(1)}
                    </div>
                )}
            </div>

            <div style={{
                fontWeight: "600",
                fontSize: "0.85rem",
                lineHeight: "1.2",
                marginBottom: "4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
            }}>
                {movie.title}
            </div>
            <div style={{
                color: "#666",
                fontSize: "0.75rem",
            }}>
                {year}
            </div>
        </Link>
    );
}
