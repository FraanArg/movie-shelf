"use client";

import { MovieItem } from "@/lib/db";
import Image from "next/image";

interface CaseProps {
    movie: MovieItem;
    priority?: boolean;
}

export default function Case({ movie, priority = false }: CaseProps) {
    const year = parseInt(movie.year);
    let type = "bluray";

    if (year < 1996) type = "vhs";
    else if (year < 2010) type = "dvd";

    const isWorn = (movie.plays || 0) >= 5;

    return (
        <div
            style={{
                width: "220px",
                height: "330px",
                position: "relative",
                borderRadius: type === "vhs" ? "2px" : "4px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                background: "#1a1a1a",
                overflow: "hidden",
                transformStyle: "preserve-3d",
                filter: isWorn ? "sepia(0.3) contrast(0.9)" : "none" // Worn filter
            }}
        >
            {/* Case Texture/Frame */}
            <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                border: type === "bluray" ? "12px solid rgba(0, 86, 179, 0.8)" : type === "dvd" ? "12px solid #111" : "none",
                borderRadius: type === "vhs" ? "0" : "4px",
                zIndex: 10,
                pointerEvents: "none",
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)"
            }}>
                {/* Blu-ray Header */}
                {type === "bluray" && (
                    <div style={{
                        position: "absolute",
                        top: "-12px", left: "-12px", right: "-12px",
                        height: "24px",
                        background: "linear-gradient(to bottom, #0056b3, #004494)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <div style={{
                            width: "30px",
                            height: "12px",
                            background: "rgba(255,255,255,0.6)",
                            borderRadius: "50% 50% 10% 10%"
                        }} />
                    </div>
                )}
            </div>

            {/* Poster Image */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                {movie.posterUrl && (
                    <Image
                        src={movie.posterUrl}
                        alt={movie.title}
                        fill
                        style={{ objectFit: "cover", opacity: isWorn ? 0.8 : 1 }} // Faded poster
                        priority={priority}
                    />
                )}
            </div>

            {/* Worn Scratches Overlay */}
            {isWorn && (
                <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "url(https://www.transparenttextures.com/patterns/scratched-metal.png)",
                    opacity: 0.4,
                    zIndex: 25,
                    pointerEvents: "none",
                    mixBlendMode: "screen"
                }} />
            )}

            {/* VHS Overlay */}
            {type === "vhs" && (
                <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "url(https://www.transparenttextures.com/patterns/cardboard-flat.png)",
                    opacity: 0.3,
                    zIndex: 20,
                    pointerEvents: "none",
                    mixBlendMode: "multiply"
                }} />
            )}

            {/* Gloss/Reflection */}
            <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                background: "linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0) 50%)",
                zIndex: 30,
                pointerEvents: "none"
            }} />
        </div>
    );
}
