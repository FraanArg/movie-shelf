"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import MovieCard from "./MovieCard";
import SkeletonCard from "./SkeletonCard";
import Bookshelf from "./Bookshelf";
import { fetchMoviesAction } from "@/app/actions";
import { useBackdrop } from "./BackdropProvider";

interface MovieGridProps {
    initialMovies: any[];
    sort: string;
}

export default function MovieGrid({ initialMovies, sort }: MovieGridProps) {
    const [movies, setMovies] = useState(initialMovies);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observerTarget = useRef(null);
    const { setBackdrop } = useBackdrop();

    // Memoize loadMore to prevent unnecessary re-renders
    const loadMore = useCallback(async () => {
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
    }, [loading, hasMore, page, sort, movies]);

    // Intersection Observer with rootMargin for preloading
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            {
                threshold: 0.1,
                rootMargin: "200px" // Preload when 200px away
            }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [loadMore]);

    // Calculate stagger delay for each item (capped for performance)
    const getStaggerDelay = (index: number) => {
        const cappedIndex = Math.min(index, 12);
        return `${cappedIndex * 0.02}s`;
    };

    return (
        <>
            <div className="contain-layout">
                <Bookshelf label="My Collection">
                    {movies.map((movie: any, index: number) => (
                        <div
                            key={`${movie.id}-${movie.imdbId || 'no-imdb'}`}
                            className="stagger-item"
                            style={{
                                animationDelay: getStaggerDelay(index),
                                contain: "layout style"
                            }}
                        >
                            <MovieCard {...movie} />
                        </div>
                    ))}
                </Bookshelf>
            </div>

            {hasMore && (
                <div
                    ref={observerTarget}
                    style={{
                        textAlign: "center",
                        marginTop: "40px",
                        marginBottom: "40px",
                        minHeight: "200px",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                        gap: "20px",
                        padding: "0 8px"
                    }}
                >
                    {loading && [...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}
        </>
    );
}

