"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect, memo } from "react";
import { useBackdrop } from "./BackdropProvider";
import { useXRay } from "./XRayProvider";

interface MovieCardProps {
    id: number;
    imdbId?: string;
    title: string;
    year: string;
    posterUrl: string | null;
    type: "movie" | "series";
    Runtime?: string;
    imdbRating?: string;
}

function MovieCardComponent({ id, imdbId, title, year, posterUrl, type, Runtime, imdbRating }: MovieCardProps) {
    const href = imdbId ? `/movie/${imdbId}` : "#";
    const cardRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const rafRef = useRef<number | null>(null);
    const { setBackdrop } = useBackdrop();
    const { isXRayEnabled } = useXRay();

    // Simplified hover handler - less frequent updates
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || !innerRef.current) return;

        // Only update every few frames for performance
        if (rafRef.current) return;

        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            if (!cardRef.current || !innerRef.current) return;

            const rect = cardRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Reduced rotation for subtler effect
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            innerRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
    };

    const handleMouseEnter = () => {
        setIsHovering(true);
        setBackdrop(posterUrl);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        if (innerRef.current) {
            innerRef.current.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
        }
        setBackdrop(null);
    };

    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            style={{
                perspective: "800px",
                cursor: "pointer",
                contain: "layout style"
            }}
        >
            <Link href={href}>
                <div
                    ref={innerRef}
                    style={{
                        transform: "rotateX(0deg) rotateY(0deg) scale(1)",
                        transition: "transform 0.15s ease-out, box-shadow 0.2s ease",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: isHovering
                            ? "0 15px 35px rgba(0,0,0,0.35)"
                            : "0 5px 15px rgba(0,0,0,0.2)",
                        position: "relative",
                        aspectRatio: "2/3",
                        background: "#1a1a1a",
                        willChange: isHovering ? "transform" : "auto",
                        backfaceVisibility: "hidden"
                    }}
                >
                    {/* Poster Image with blur-up effect */}
                    <Image
                        src={posterUrl || "/placeholder.jpg"}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
                        className="blur-up"
                        style={{ objectFit: "cover" }}
                        loading="lazy"
                        onLoad={(e) => {
                            const img = e.currentTarget;
                            img.classList.add("loaded");
                        }}
                    />

                    {/* X-Ray HUD Overlay */}
                    {isXRayEnabled && (
                        <div style={{
                            position: "absolute",
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: "rgba(0, 20, 40, 0.9)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#00f0ff",
                            fontFamily: "monospace",
                            padding: "20px",
                            zIndex: 20
                        }}>
                            <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>RUNTIME</div>
                            <div style={{ fontSize: "1.3rem", fontWeight: "bold", marginBottom: "8px" }}>{Runtime || "N/A"}</div>

                            <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>RATING</div>
                            <div style={{ fontSize: "1.3rem", fontWeight: "bold", marginBottom: "8px" }}>{imdbRating || "N/A"}</div>

                            <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>YEAR</div>
                            <div style={{ fontSize: "1.3rem", fontWeight: "bold" }}>{year}</div>
                        </div>
                    )}

                    {/* Subtle hover gradient */}
                    {isHovering && (
                        <div style={{
                            position: "absolute",
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
                            pointerEvents: "none"
                        }} />
                    )}
                </div>
            </Link>

            {/* Title below card */}
            <div style={{
                marginTop: "8px",
                textAlign: "center",
                fontWeight: "500",
                fontSize: "0.85rem",
                color: "var(--foreground)",
                opacity: 0.85,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
            }}>
                {title}
            </div>

            {/* Year subtitle */}
            <div style={{
                textAlign: "center",
                fontSize: "0.75rem",
                color: "var(--foreground)",
                opacity: 0.45,
                marginTop: "2px"
            }}>
                {year}
            </div>
        </div>
    );
}

// Memoize to prevent re-renders when parent changes
const MovieCard = memo(MovieCardComponent);
export default MovieCard;
