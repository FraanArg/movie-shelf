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
    const saturation = type === "vhs" ? (isWorn ? "10%" : "25%") : (isWorn ? "25%" : "55%");
    const lightness = type === "vhs" ? (isWorn ? "20%" : "18%") : (isWorn ? "30%" : "22%");

    const baseColor = `hsl(${hue}, ${saturation}, ${lightness})`;
    const highlightColor = `hsl(${hue}, ${saturation}, ${parseInt(lightness) + 10}%)`;
    const shadowColor = `hsl(${hue}, ${saturation}, ${parseInt(lightness) - 8}%)`;

    // Dimensions - vary slightly for realism
    const widthVariation = (hash % 6) - 3; // -3 to +3px variation
    const width = type === "vhs" ? `${58 + widthVariation}px` : type === "dvd" ? `${48 + widthVariation}px` : `${40 + widthVariation}px`;
    const height = type === "bluray" ? "280px" : "310px";

    return (
        <Link href={`/movie/${movie.imdbId}`} style={{ textDecoration: "none" }}>
            <div
                className={`spine spine-${type}`}
                style={{
                    width,
                    height,
                    position: "relative",
                    cursor: "pointer",
                    transition: "transform 0.2s ease-out",
                    transformStyle: "preserve-3d",
                    marginRight: "-1px", // Slight overlap for bookshelf feel
                }}
            >
                {/* Main spine face */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: type === "vhs"
                        ? `linear-gradient(90deg, ${shadowColor} 0%, ${baseColor} 12%, ${highlightColor} 50%, ${baseColor} 88%, ${shadowColor} 100%)`
                        : type === "dvd"
                            ? `linear-gradient(90deg, #1a1a1a 0%, ${shadowColor} 8%, ${baseColor} 20%, ${highlightColor} 50%, ${baseColor} 80%, ${shadowColor} 92%, #1a1a1a 100%)`
                            : `linear-gradient(90deg, #000814 0%, #001d3d 15%, #003566 35%, #0077b6 50%, #003566 65%, #001d3d 85%, #000814 100%)`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: type === "vhs" ? "10px 3px" : "8px 2px",
                    borderRadius: type === "vhs" ? "1px" : "2px",
                    boxShadow: `
                        inset 2px 0 4px rgba(255,255,255,0.08),
                        inset -2px 0 4px rgba(0,0,0,0.3),
                        inset 0 2px 4px rgba(255,255,255,0.05),
                        inset 0 -2px 4px rgba(0,0,0,0.2)
                    `,
                    overflow: "hidden",
                    filter: isWorn ? "sepia(0.15) contrast(0.92) brightness(0.95)" : "none",
                }}>
                    {/* Spine edge highlight - left side */}
                    <div style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "3px",
                        background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)",
                    }} />

                    {/* Spine edge shadow - right side */}
                    <div style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: "4px",
                        background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.4))",
                    }} />

                    {/* Worn Texture Overlay */}
                    {isWorn && (
                        <div style={{
                            position: "absolute",
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: "repeating-linear-gradient(0deg, transparent 0px, transparent 40px, rgba(255,255,255,0.03) 40px, transparent 42px)",
                            pointerEvents: "none",
                        }} />
                    )}

                    {/* VHS Paper Sleeve texture */}
                    {type === "vhs" && (
                        <div style={{
                            position: "absolute",
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: `
                                repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(0,0,0,0.05) 3px, transparent 4px)
                            `,
                            opacity: 0.5,
                            pointerEvents: "none",
                        }} />
                    )}

                    {/* Header - Format indicator */}
                    <div style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                        opacity: isWorn ? 0.7 : 0.9,
                        marginBottom: "8px",
                    }}>
                        {type === "vhs" ? (
                            <div style={{
                                background: isWorn ? "#c8c0b0" : "#e8e0d0",
                                color: "#1a1a1a",
                                padding: "2px 6px",
                                fontSize: "0.5rem",
                                fontWeight: 800,
                                fontFamily: "var(--font-system)",
                                borderRadius: "1px",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
                                letterSpacing: "1px",
                            }}>VHS</div>
                        ) : type === "dvd" ? (
                            <div style={{
                                fontSize: "0.45rem",
                                fontWeight: 800,
                                color: "rgba(255,255,255,0.6)",
                                letterSpacing: "1.5px",
                                fontFamily: "var(--font-system)",
                            }}>DVD</div>
                        ) : (
                            <div style={{
                                width: "16px",
                                height: "7px",
                                background: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(200,200,255,0.6) 100%)",
                                borderRadius: "3px 3px 1px 1px",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
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
                        color: isWorn ? "rgba(255,255,255,0.8)" : "#fff",
                        fontWeight: 600,
                        fontFamily: "var(--font-oswald)",
                        fontSize: movie.title.length > 25 ? "0.85rem" : "1rem",
                        letterSpacing: "0.3px",
                        textShadow: "0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)",
                        maxHeight: "220px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: 1.15,
                        zIndex: 2,
                        textTransform: "uppercase",
                    }}>
                        {movie.title}
                    </div>

                    {/* Year */}
                    <div style={{
                        marginTop: "8px",
                        fontSize: "0.7rem",
                        color: "rgba(255,255,255,0.65)",
                        writingMode: "horizontal-tb",
                        fontWeight: 500,
                        fontFamily: "var(--font-system)",
                        zIndex: 2,
                        textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                        background: "rgba(0,0,0,0.2)",
                        padding: "2px 6px",
                        borderRadius: "2px",
                    }}>
                        {movie.year}
                    </div>
                </div>

                {/* Right edge (3D depth) - the actual box front */}
                <div style={{
                    position: "absolute",
                    right: "-4px",
                    top: "2px",
                    bottom: "2px",
                    width: "4px",
                    background: `linear-gradient(180deg, ${highlightColor}, ${baseColor}, ${shadowColor})`,
                    transform: "rotateY(-80deg)",
                    transformOrigin: "left",
                    boxShadow: "inset 0 0 2px rgba(0,0,0,0.3)",
                    borderRadius: "0 1px 1px 0",
                }} />

                {/* Bottom shadow on shelf */}
                <div style={{
                    position: "absolute",
                    bottom: "-6px",
                    left: "2px",
                    right: "2px",
                    height: "6px",
                    background: "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)",
                    filter: "blur(2px)",
                }} />
            </div>
        </Link>
    );
}
