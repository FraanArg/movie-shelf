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
        <div className="shelf-container" style={{
            position: "relative",
            padding: "40px 20px 60px",
            minHeight: "80vh",
        }}>
            {/* Bookshelf Background */}
            <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, #1a1410 0%, #0d0a08 100%)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "inset 0 20px 60px rgba(0,0,0,0.8), inset 0 -20px 60px rgba(0,0,0,0.5)",
            }} />

            {/* Shelf Rows */}
            <div style={{
                position: "relative",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-end",
                gap: "3px",
                paddingBottom: "40px",
            }}>
                {movies.map((movie: any) => (
                    <Spine key={`${movie.id}-${movie.imdbId}`} movie={movie} />
                ))}
            </div>

            {/* Shelf Surface - The wooden ledge */}
            <div style={{
                position: "absolute",
                bottom: "20px",
                left: "10px",
                right: "10px",
                height: "24px",
                background: "linear-gradient(180deg, #3d2d1f 0%, #2a1f15 50%, #1a1410 100%)",
                borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}>
                {/* Wood grain texture */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 42px)",
                    borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                }} />
            </div>

            {/* Back Wall Shadow */}
            <div style={{
                position: "absolute",
                bottom: "44px",
                left: "20px",
                right: "20px",
                height: "20px",
                background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)",
                pointerEvents: "none",
            }} />

            {hasMore && (
                <div ref={observerTarget} style={{
                    width: "100%",
                    textAlign: "center",
                    marginTop: "40px",
                    height: "20px",
                    position: "relative",
                    zIndex: 10,
                }}>
                    {loading && <span style={{ color: "#888" }}>Loading more...</span>}
                </div>
            )}

            {/* Ambient light from top */}
            <div style={{
                position: "absolute",
                top: 0,
                left: "10%",
                right: "10%",
                height: "80px",
                background: "radial-gradient(ellipse at center top, rgba(255,240,220,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />
        </div>
    );
}
