"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MovieCard from "./MovieCard";
import SkeletonCard from "./SkeletonCard";
import Bookshelf from "./Bookshelf";
import { useBackdrop } from "./BackdropProvider";

interface MovieGridProps {
    initialMovies: any[];  // First page of movies to display immediately
    allMovies: any[];      // Full sorted list for pagination
    sort: string;
}

const PAGE_SIZE = 50;

export default function MovieGrid({ initialMovies, allMovies, sort }: MovieGridProps) {
    const [displayCount, setDisplayCount] = useState(initialMovies.length);
    const [loading, setLoading] = useState(false);
    const observerTarget = useRef(null);
    const { setBackdrop } = useBackdrop();

    const hasMore = displayCount < allMovies.length;

    // Load more movies from the pre-sorted full list
    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;

        setLoading(true);
        // Small delay for visual feedback
        setTimeout(() => {
            setDisplayCount(prev => Math.min(prev + PAGE_SIZE, allMovies.length));
            setLoading(false);
        }, 100);
    }, [loading, hasMore, allMovies.length]);

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

    // Get displayed movies from the sorted list
    const displayedMovies = allMovies.slice(0, displayCount);

    // Calculate stagger delay for each item (capped for performance)
    const getStaggerDelay = (index: number) => {
        const cappedIndex = Math.min(index, 12);
        return `${cappedIndex * 0.02}s`;
    };

    return (
        <>
            <div className="contain-layout">
                <Bookshelf label="My Collection">
                    {displayedMovies.map((movie: any, index: number) => (
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


