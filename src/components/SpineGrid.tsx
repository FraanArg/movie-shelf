"use client";

import { useState, useEffect, useRef } from "react";
import Spine from "./Spine";
import { fetchMoviesAction } from "@/app/actions";

interface SpineGridProps {
    initialMovies: any[];
    sort: string;
}

export default function SpineGrid({ initialMovies, sort }: SpineGridProps) {
    const [movies, setMovies] = useState(initialMovies);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observerTarget = useRef(null);

    const loadMore = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        const nextPage = page + 1;
        try {
            const newMovies = await fetchMoviesAction(nextPage, sort);
            if (newMovies.length === 0) {
                setHasMore(false);
            } else {
                const existingIds = new Set(movies.map((m: any) => m.imdbId || m.id));
                const uniqueNewMovies = newMovies.filter((m: any) => !existingIds.has(m.imdbId || m.id));

                if (uniqueNewMovies.length === 0) {
                    setHasMore(false);
                } else {
                    setMovies(prev => [...prev, ...uniqueNewMovies]);
                    setPage(nextPage);
                }
            }
        } catch (e) {
            console.error("Failed to load more movies", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [observerTarget, hasMore, loading, page]);

    return (
        <div style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            gap: "4px",
            padding: "60px 40px",
            background: "linear-gradient(to bottom, #1a1a1a, #000)",
            borderRadius: "20px",
            boxShadow: "inset 0 0 100px #000",
            minHeight: "80vh"
        }}>
            {movies.map((movie: any) => (
                <Spine key={`${movie.id}-${movie.imdbId}`} movie={movie} />
            ))}

            {hasMore && (
                <div ref={observerTarget} style={{ width: "100%", textAlign: "center", marginTop: "40px", height: "20px" }}>
                    {loading && <span style={{ color: "#888" }}>Loading more...</span>}
                </div>
            )}
        </div>
    );
}
