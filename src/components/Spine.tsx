"use client";

import Link from "next/link";
import { MovieItem } from "@/lib/db";

export default function Spine({ movie }: { movie: MovieItem }) {
    const year = parseInt(movie.year);
    let type = "bluray";

    if (year < 1996) type = "vhs";
    else if (year < 2010) type = "dvd";

    const hash = movie.title.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
    const hue = hash % 360;

    // Wear & Tear Logic
    const isWorn = (movie.plays || 0) >= 5;

    // Darker backgrounds for better white text contrast
    // If worn, desaturate significantly
    const saturation = type === "vhs" ? (isWorn ? "10%" : "30%") : (isWorn ? "30%" : "60%");
    const lightness = type === "vhs" ? (isWorn ? "25%" : "20%") : (isWorn ? "35%" : "25%"); // Worn is slightly lighter/faded

    const baseColor = `hsl(${hue}, ${saturation}, ${lightness})`;

    // Significantly wider for readability
    const width = type === "vhs" ? "60px" : type === "dvd" ? "50px" : "42px";
    const height = type === "bluray" ? "290px" : "320px";

    return (
        <Link href={`/movie/${movie.imdbId}`} style={{ textDecoration: "none", perspective: "1000px" }}>
            <div
                className={`spine spine-${type}`}
                style={{
                    width,
                    height,
                    background: type === "vhs"
                        ? `linear-gradient(90deg, #1a1a1a 0%, ${baseColor} 15%, ${baseColor} 85%, #1a1a1a 100%)`
                        : type === "dvd"
                            ? `linear-gradient(90deg, #000 0%, #222 5%, ${baseColor} 15%, ${baseColor} 85%, #222 95%, #000 100%)`
                            : `linear-gradient(90deg, #000 0%, #003366 10%, #0056b3 20%, #003366 80%, #000 100%)`, // Deep Blu-ray blue
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: type === "vhs" ? "12px 4px" : "8px 2px",
                    borderRight: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "2px 0 8px rgba(0,0,0,0.7)",
                    position: "relative",
                    transition: "transform 0.2s ease-out, box-shadow 0.2s ease",
                    cursor: "pointer",
                    overflow: "hidden",
                    borderRadius: type === "vhs" ? "1px" : "3px",
                    transformOrigin: "center left",
                    marginRight: "2px",
                    filter: isWorn ? "sepia(0.2) contrast(0.9)" : "none" // Global worn filter
                }}
            >
                {/* Worn Texture Overlay */}
                {isWorn && (
                    <div style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "url(https://www.transparenttextures.com/patterns/cracked-concrete.png)", // Cracks/creases
                        opacity: 0.3,
                        pointerEvents: "none",
                        mixBlendMode: "overlay"
                    }} />
                )}

                {/* Spine Creases (CSS Gradients) */}
                {isWorn && (
                    <div style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "repeating-linear-gradient(0deg, transparent, transparent 49%, rgba(255,255,255,0.1) 50%, transparent 51%)",
                        backgroundSize: "100% 60px", // Horizontal creases every 60px
                        opacity: 0.2,
                        pointerEvents: "none"
                    }} />
                )}

                {/* VHS Texture - Subtle */}
                {type === "vhs" && (
                    <div style={{
                        position: "absolute",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "url(https://www.transparenttextures.com/patterns/cardboard-flat.png)",
                        opacity: 0.2, // Reduced opacity for better text contrast
                        pointerEvents: "none"
                    }} />
                )}

                {/* Header */}
                <div style={{
                    width: "100%",
                    height: type === "vhs" ? "auto" : "24px",
                    marginBottom: "10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                    opacity: isWorn ? 0.7 : 0.9 // Faded header
                }}>
                    {type === "vhs" ? (
                        <div style={{
                            background: isWorn ? "#bbb" : "#ddd", // Yellowed/dirty sticker
                            color: "#000",
                            padding: "1px 4px",
                            fontSize: "0.55rem",
                            fontWeight: "800",
                            fontFamily: "var(--font-oswald)",
                            borderRadius: "1px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.5)"
                        }}>VHS</div>
                    ) : type === "dvd" ? (
                        <div style={{ fontSize: "0.5rem", fontWeight: "900", color: "#aaa", letterSpacing: "1px", fontFamily: "var(--font-oswald)" }}>DVD</div>
                    ) : (
                        <div style={{
                            width: "18px",
                            height: "8px",
                            background: "rgba(255,255,255,0.7)",
                            borderRadius: "50% 50% 10% 10%"
                        }} />
                    )}
                </div>

                {/* Title */}
                <div style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isWorn ? "rgba(255,255,255,0.85)" : "#fff", // Faded text
                    fontWeight: "500",
                    fontFamily: "var(--font-oswald)",
                    fontSize: movie.title.length > 30 ? "0.9rem" : "1.1rem",
                    letterSpacing: "0.5px",
                    textShadow: "0 2px 4px #000",
                    maxHeight: "240px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: "1.2",
                    zIndex: 2,
                    padding: "0", // Removed padding to let flex center perfectly
                    width: "100%",
                    textTransform: "uppercase"
                }}>
                    {movie.title}
                </div>

                {/* Year */}
                <div style={{
                    marginTop: "10px",
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.7)",
                    writingMode: "horizontal-tb",
                    fontWeight: "400",
                    fontFamily: "var(--font-oswald)",
                    zIndex: 2,
                    textShadow: "0 1px 2px #000"
                }}>
                    {movie.year}
                </div>
            </div>
        </Link >
    );
}
