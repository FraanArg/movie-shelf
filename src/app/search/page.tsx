"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "@/components/Bookshelf.module.css"; // Reuse grid styles

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const q = searchParams.get("q") || "";
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get("query") as string;

        if (!query) return;

        setLoading(true);
        router.push(`/search?q=${encodeURIComponent(query)}`);

        try {
            // We'll implement a server action or API route for this, 
            // but for now let's fetch directly or use a server action.
            // Let's use a simple API route for search to keep client clean.
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data.Search || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addToLibrary = async (movie: any) => {
        await fetch("/api/library", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: movie.imdbID,
                title: movie.Title,
                year: movie.Year,
                posterUrl: movie.Poster,
                type: movie.Type
            }),
        });
        alert("Added to library!");
        router.refresh(); // Refresh to update UI if needed
    };

    return (
        <main style={{ padding: "40px 20px", minHeight: "100vh" }}>
            <Link href="/" style={{ marginBottom: "20px", display: "inline-block", color: "var(--accent)" }}>
                &larr; Back to Shelf
            </Link>

            <h1 style={{ marginBottom: "20px" }}>Search Movies</h1>

            <form onSubmit={handleSearch} style={{ marginBottom: "40px", display: "flex", gap: "10px" }}>
                <input
                    name="query"
                    defaultValue={q}
                    placeholder="Search title..."
                    style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid var(--shelf-border-top)",
                        background: "rgba(255,255,255,0.1)",
                        color: "var(--foreground)",
                        fontSize: "1rem"
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: "0 24px",
                        borderRadius: "8px",
                        background: "var(--accent)",
                        color: "white",
                        border: "none",
                        fontSize: "1rem",
                        cursor: "pointer"
                    }}
                >
                    {loading ? "..." : "Search"}
                </button>
            </form>

            <div className={styles.grid}>
                {results.map((movie) => (
                    <div key={movie.imdbID} style={{ position: "relative" }}>
                        <div style={{ aspectRatio: "2/3", position: "relative", marginBottom: "10px" }}>
                            {movie.Poster !== "N/A" ? (
                                <Image src={movie.Poster} alt={movie.Title} fill style={{ objectFit: "cover", borderRadius: "4px" }} />
                            ) : (
                                <div style={{ width: "100%", height: "100%", background: "#333", borderRadius: "4px" }} />
                            )}
                        </div>
                        <div style={{ fontSize: "0.9rem", fontWeight: "bold", marginBottom: "4px" }}>{movie.Title}</div>
                        <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "8px" }}>{movie.Year}</div>
                        <button
                            onClick={() => addToLibrary(movie)}
                            style={{
                                width: "100%",
                                padding: "8px",
                                background: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                borderRadius: "4px",
                                color: "var(--foreground)",
                                cursor: "pointer"
                            }}
                        >
                            + Add to Shelf
                        </button>
                    </div>
                ))}
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div style={{ padding: "40px", color: "white" }}>Loading search...</div>}>
            <SearchContent />
        </Suspense>
    );
}
