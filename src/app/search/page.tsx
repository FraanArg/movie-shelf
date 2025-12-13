"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Search, Plus } from "lucide-react";
import styles from "@/components/Bookshelf.module.css";

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
        router.refresh();
    };

    return (
        <main style={{
            padding: "0 var(--space-md)",
            paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
            minHeight: "100vh",
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
                paddingTop: "var(--space-lg)",
                marginBottom: "var(--space-lg)",
            }}>
                <Link
                    href="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "44px",
                        height: "44px",
                        borderRadius: "var(--radius-full)",
                        color: "var(--tint)",
                        textDecoration: "none",
                    }}
                >
                    <ChevronLeft size={24} />
                </Link>
                <h1
                    className="large-title"
                    style={{
                        fontSize: "var(--font-size-largetitle)",
                        fontWeight: 700,
                        color: "var(--label-primary)",
                        margin: 0,
                        fontFamily: "var(--font-system)",
                    }}
                >
                    Search
                </h1>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} style={{
                marginBottom: "var(--space-xl)",
                display: "flex",
                gap: "var(--space-sm)",
            }}>
                <div style={{
                    flex: 1,
                    position: "relative",
                }}>
                    <Search
                        size={18}
                        style={{
                            position: "absolute",
                            left: "var(--space-md)",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--label-tertiary)",
                        }}
                    />
                    <input
                        name="query"
                        defaultValue={q}
                        placeholder="Search movies and TV shows..."
                        style={{
                            width: "100%",
                            padding: "var(--space-md)",
                            paddingLeft: "44px",
                            borderRadius: "var(--radius-lg)",
                            border: "none",
                            background: "var(--fill-tertiary)",
                            color: "var(--label-primary)",
                            fontSize: "var(--font-size-body)",
                            fontFamily: "var(--font-system)",
                        }}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        padding: "0 var(--space-lg)",
                        borderRadius: "var(--radius-lg)",
                        background: "var(--tint)",
                        color: "white",
                        border: "none",
                        fontSize: "var(--font-size-body)",
                        fontWeight: 600,
                        cursor: "pointer",
                        minHeight: "44px",
                    }}
                >
                    {loading ? "..." : "Search"}
                </button>
            </form>

            {/* Results */}
            {results.length > 0 && (
                <div className={styles.grid}>
                    {results.map((movie) => (
                        <div key={movie.imdbID} style={{ position: "relative" }}>
                            <div style={{
                                aspectRatio: "2/3",
                                position: "relative",
                                marginBottom: "var(--space-sm)",
                                borderRadius: "var(--radius-md)",
                                overflow: "hidden",
                                background: "var(--fill-tertiary)",
                            }}>
                                {movie.Poster !== "N/A" ? (
                                    <Image
                                        src={movie.Poster}
                                        alt={movie.Title}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    <div style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "2rem",
                                    }}>
                                        🎬
                                    </div>
                                )}
                            </div>
                            <div style={{
                                fontSize: "var(--font-size-subhead)",
                                fontWeight: 600,
                                marginBottom: "var(--space-xxs)",
                                color: "var(--label-primary)",
                            }}>
                                {movie.Title}
                            </div>
                            <div style={{
                                fontSize: "var(--font-size-footnote)",
                                color: "var(--label-secondary)",
                                marginBottom: "var(--space-sm)",
                            }}>
                                {movie.Year}
                            </div>
                            <button
                                onClick={() => addToLibrary(movie)}
                                style={{
                                    width: "100%",
                                    padding: "var(--space-sm)",
                                    background: "var(--fill-tertiary)",
                                    border: "none",
                                    borderRadius: "var(--radius-sm)",
                                    color: "var(--tint)",
                                    cursor: "pointer",
                                    fontSize: "var(--font-size-subhead)",
                                    fontWeight: 500,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "var(--space-xs)",
                                    minHeight: "44px",
                                }}
                            >
                                <Plus size={16} />
                                Add to Shelf
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {results.length === 0 && !loading && q && (
                <div style={{
                    textAlign: "center",
                    padding: "var(--space-xxl)",
                    color: "var(--label-secondary)",
                }}>
                    <div style={{ fontSize: "4rem", marginBottom: "var(--space-lg)" }}>🔍</div>
                    <p style={{ fontSize: "var(--font-size-body)" }}>
                        No results found for &quot;{q}&quot;
                    </p>
                </div>
            )}
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div style={{
                padding: "var(--space-xl) var(--space-md)",
                textAlign: "center",
                color: "var(--label-secondary)",
            }}>
                Loading search...
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
