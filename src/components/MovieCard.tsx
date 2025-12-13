"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useState } from "react";
import { useBackdrop } from "./BackdropProvider";

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
    const [isHovering, setIsHovering] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { setBackdrop } = useBackdrop();

    const handleMouseEnter = () => {
        setIsHovering(true);
        setBackdrop(posterUrl);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        setBackdrop(null);
    };

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                cursor: "pointer",
                contain: "layout style",
            }}
        >
            <Link href={href}>
                <div
                    style={{
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        boxShadow: isHovering ? "var(--shadow-lg)" : "var(--shadow-sm)",
                        position: "relative",
                        aspectRatio: "2/3",
                        background: "var(--bg-tertiary)",
                        transition: "box-shadow 0.2s ease, transform 0.2s ease",
                        transform: isHovering ? "scale(1.02)" : "scale(1)",
                    }}
                >
                    {/* Skeleton placeholder */}
                    {!imageLoaded && (
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: "var(--fill-tertiary)",
                                animation: "pulse 1.5s ease-in-out infinite",
                            }}
                        />
                    )}

                    {/* Poster Image */}
                    <Image
                        src={posterUrl || "/placeholder.jpg"}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 45vw, (max-width: 1200px) 20vw, 15vw"
                        style={{
                            objectFit: "cover",
                            opacity: imageLoaded ? 1 : 0,
                            transition: "opacity 0.3s ease",
                        }}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                    />

                    {/* Hover gradient overlay */}
                    {isHovering && (
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
                                pointerEvents: "none",
                            }}
                        />
                    )}

                    {/* Type badge */}
                    {type === "series" && (
                        <div
                            style={{
                                position: "absolute",
                                top: "var(--space-sm)",
                                right: "var(--space-sm)",
                                background: "var(--tint)",
                                color: "white",
                                fontSize: "var(--font-size-caption2)",
                                fontWeight: 600,
                                padding: "2px 6px",
                                borderRadius: "var(--radius-xs)",
                            }}
                        >
                            TV
                        </div>
                    )}
                </div>
            </Link>

            {/* Title below card */}
            <div
                style={{
                    marginTop: "var(--space-sm)",
                    textAlign: "center",
                    fontWeight: 500,
                    fontSize: "var(--font-size-footnote)",
                    color: "var(--label-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: "var(--font-system)",
                }}
            >
                {title}
            </div>

            {/* Year subtitle */}
            <div
                style={{
                    textAlign: "center",
                    fontSize: "var(--font-size-caption2)",
                    color: "var(--label-tertiary)",
                    marginTop: "var(--space-xxs)",
                }}
            >
                {year}
            </div>
        </div>
    );
}

// Memoize to prevent re-renders when parent changes
const MovieCard = memo(MovieCardComponent);
export default MovieCard;
