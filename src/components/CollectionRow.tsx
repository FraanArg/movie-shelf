"use client";

import { useRef } from "react";
import MovieCard from "./MovieCard";
import styles from "./Bookshelf.module.css";

interface CollectionRowProps {
    label: string;
    movies: any[];
}

export default function CollectionRow({ label, movies }: CollectionRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);

    if (movies.length === 0) return null;

    return (
        <div style={{ marginBottom: "40px" }}>
            <h2 style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                marginBottom: "15px",
                paddingLeft: "20px",
                color: "rgba(255,255,255,0.9)"
            }}>
                {label}
            </h2>

            <div
                ref={rowRef}
                style={{
                    display: "flex",
                    gap: "20px",
                    overflowX: "auto",
                    padding: "0 20px 20px 20px",
                    scrollBehavior: "smooth",
                    WebkitOverflowScrolling: "touch",
                }}
                className="hide-scrollbar"
            >
                {movies.map((movie) => (
                    <div key={`${movie.id}-${movie.imdbId}`} style={{ minWidth: "160px", width: "160px", aspectRatio: "2/3", flexShrink: 0 }}>
                        <MovieCard {...movie} />
                    </div>
                ))}
            </div>
        </div>
    );
}
