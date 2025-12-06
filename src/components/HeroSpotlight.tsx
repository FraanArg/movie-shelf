"use client";

import Image from "next/image";
import Link from "next/link";
import { MovieItem } from "@/lib/db";
import { useBackdrop } from "./BackdropProvider";
import { useEffect, useState } from "react";

export default function HeroSpotlight({ movie }: { movie: MovieItem }) {
    const { setBackdrop } = useBackdrop();

    // Set initial backdrop on mount
    useEffect(() => {
        if (movie.posterUrl) {
            setBackdrop(movie.posterUrl);
        }
    }, [movie, setBackdrop]);

    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setOffset(window.scrollY * 0.5);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div style={{
            position: "relative",
            width: "100%",
            height: "70vh",
            display: "flex",
            alignItems: "flex-end",
            padding: "60px",
            marginBottom: "40px",
            overflow: "hidden",
            transform: `translateY(${offset}px)`, // Parallax the whole container or just bg?
            // Actually, usually we want the BG to move slower. 
            // But since the BG is global in BackdropProvider, we can't easily parallax it from here *unless* we move the content.
            // Let's try moving the content UP slightly as we scroll down to create depth against the fixed BG.
        }}>
            {/* Content Container */}
            <div style={{
                position: "relative",
                zIndex: 10,
                maxWidth: "800px",
                animation: "fadeInUp 1s ease-out"
            }}>
                {/* Type Badge */}
                <div style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    background: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    marginBottom: "20px",
                    textTransform: "uppercase",
                    letterSpacing: "1px"
                }}>
                    {movie.type === "series" ? "TV Series" : "Movie"}
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: "5rem",
                    fontWeight: "800",
                    lineHeight: "1",
                    marginBottom: "20px",
                    textShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    fontFamily: "var(--font-oswald)"
                }}>
                    {movie.title}
                </h1>

                {/* Metadata Row */}
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px", fontSize: "1.1rem", color: "rgba(255,255,255,0.8)" }}>
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span>{movie.Genre?.split(",")[0] || "Drama"}</span>
                    <span>•</span>
                    <span>{movie.Runtime || "120 min"}</span>
                </div>

                {/* Plot */}
                <p style={{
                    fontSize: "1.2rem",
                    lineHeight: "1.6",
                    maxWidth: "600px",
                    marginBottom: "40px",
                    color: "rgba(255,255,255,0.9)",
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                }}>
                    {movie.Plot || "No description available."}
                </p>

                {/* Actions */}
                <div style={{ display: "flex", gap: "20px" }}>
                    <Link href={`/movie/${movie.imdbId}`} style={{
                        padding: "15px 40px",
                        background: "#fff",
                        color: "#000",
                        borderRadius: "12px",
                        fontSize: "1.1rem",
                        fontWeight: "700",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "transform 0.2s ease"
                    }}>
                        <span>▶ Play</span>
                    </Link>

                    <Link href={`/movie/${movie.imdbId}`} style={{
                        padding: "15px 40px",
                        background: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(20px)",
                        color: "#fff",
                        borderRadius: "12px",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        textDecoration: "none",
                        transition: "background 0.2s ease"
                    }}>
                        More Info
                    </Link>
                </div>
            </div>

            {/* Gradient Fade at Bottom */}
            <div style={{
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                height: "300px",
                background: "linear-gradient(to top, #000 0%, transparent 100%)",
                zIndex: 1
            }} />
        </div>
    );
}
