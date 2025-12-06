"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MovieItem } from "@/lib/db";

export default function SearchOverlay() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<MovieItem[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Toggle with Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Search Logic
    useEffect(() => {
        const search = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                // We can use the existing search API or a server action. 
                // For now, let's assume we have a client-side search or use the API.
                // Using the API route we saw earlier: /api/search?q=...
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data.results || []);
            } catch (e) {
                console.error("Search failed", e);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(search, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const handleSelect = (id: string) => {
        router.push(`/movie/${id}`);
        setIsOpen(false);
        setQuery("");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
                    exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    transition={{ duration: 0.4, ease: "easeOut" }} // Rack focus speed
                    style={{
                        position: "fixed",
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(20px)", // Initial blur
                        WebkitBackdropFilter: "blur(20px)",
                        zIndex: 9999,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        paddingTop: "15vh"
                    }}
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                        style={{
                            width: "100%",
                            maxWidth: "700px",
                            background: "rgba(30, 30, 30, 0.8)",
                            borderRadius: "24px",
                            border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search Input */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "20px 25px",
                            borderBottom: "1px solid rgba(255,255,255,0.1)"
                        }}>
                            <span style={{ fontSize: "1.5rem", marginRight: "15px", opacity: 0.5 }}>🔍</span>
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search movies, shows, actors..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                style={{
                                    flex: 1,
                                    background: "transparent",
                                    border: "none",
                                    fontSize: "1.5rem",
                                    color: "#fff",
                                    outline: "none",
                                    fontFamily: "var(--font-inter)",
                                    fontWeight: "500"
                                }}
                            />
                            {loading && <div className="spinner" style={{ width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />}
                        </div>

                        {/* Results */}
                        <div style={{
                            maxHeight: "60vh",
                            overflowY: "auto",
                            padding: "10px"
                        }}>
                            {results.length === 0 && query && !loading && (
                                <div style={{ padding: "40px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                                    No results found for "{query}"
                                </div>
                            )}

                            {results.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelect(item.imdbId || item.id.toString())}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "15px",
                                        padding: "12px 15px",
                                        borderRadius: "12px",
                                        cursor: "pointer",
                                        transition: "background 0.2s ease",
                                        color: "#fff"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                    <div style={{
                                        width: "40px",
                                        height: "60px",
                                        borderRadius: "6px",
                                        overflow: "hidden",
                                        background: "#333",
                                        flexShrink: 0
                                    }}>
                                        {item.posterUrl ? (
                                            <Image src={item.posterUrl} alt={item.title} width={40} height={60} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                                        ) : (
                                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", color: "#666" }}>?</div>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>{item.title}</div>
                                        <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>{item.year} • {item.type === "series" ? "TV Show" : "Movie"}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: "10px 20px",
                            background: "rgba(0,0,0,0.2)",
                            fontSize: "0.8rem",
                            color: "rgba(255,255,255,0.3)",
                            display: "flex",
                            justifyContent: "space-between"
                        }}>
                            <span>ProTip: Use arrow keys to navigate</span>
                            <span>Press ESC to close</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
