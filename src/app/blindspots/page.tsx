import Link from "next/link";
import Image from "next/image";
import { getDB } from "@/lib/db";
import { getTopRatedMovies, getTMDbPosterUrl } from "@/lib/tmdb";

export default async function BlindspotsPage() {
    const items = await getDB();
    const userTitles = new Set(items.map(i => i.title.toLowerCase()));

    // Fetch top rated movies from TMDb
    const [page1, page2, page3] = await Promise.all([
        getTopRatedMovies(1),
        getTopRatedMovies(2),
        getTopRatedMovies(3),
    ]);

    const allTopRated = [...page1, ...page2, ...page3];

    // Filter out movies the user already has (by title match)
    const blindspots = allTopRated.filter(movie =>
        !userTitles.has(movie.title.toLowerCase())
    );

    // Group by decade
    const byDecade: Record<string, typeof blindspots> = {};
    blindspots.forEach(movie => {
        const year = parseInt(movie.release_date?.split("-")[0] || "0");
        if (year > 0) {
            const decade = `${Math.floor(year / 10) * 10}s`;
            if (!byDecade[decade]) byDecade[decade] = [];
            byDecade[decade].push(movie);
        }
    });

    const sortedDecades = Object.entries(byDecade).sort((a, b) =>
        parseInt(b[0]) - parseInt(a[0])
    );

    return (
        <main style={{ padding: "40px 20px", minHeight: "100vh", maxWidth: "1200px", margin: "0 auto" }}>
            <Link href="/" style={{ color: "var(--accent)", marginBottom: "30px", display: "inline-block" }}>
                ← Back to Library
            </Link>

            <div style={{ marginBottom: "40px" }}>
                <h1 style={{
                    fontSize: "2.5rem",
                    fontWeight: "700",
                    marginBottom: "10px",
                    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                }}>
                    🔍 Blind Spot Finder
                </h1>
                <p style={{ color: "#888", fontSize: "1rem" }}>
                    Highly-rated classics you haven't watched yet • {blindspots.length} films to discover
                </p>
            </div>

            {sortedDecades.map(([decade, movies]) => (
                <div key={decade} style={{ marginBottom: "50px" }}>
                    <h2 style={{
                        fontSize: "1.3rem",
                        fontWeight: "600",
                        marginBottom: "20px",
                        color: "var(--foreground)",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}>
                        <span style={{
                            background: "rgba(245, 158, 11, 0.2)",
                            color: "#f59e0b",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "0.9rem",
                        }}>
                            {decade}
                        </span>
                        <span style={{ color: "#666", fontSize: "0.9rem", fontWeight: "400" }}>
                            {movies.length} films
                        </span>
                    </h2>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                        gap: "20px",
                    }}>
                        {movies.slice(0, 10).map((movie) => {
                            const posterUrl = getTMDbPosterUrl(movie.poster_path, "w342");
                            const year = movie.release_date?.split("-")[0] || "N/A";

                            return (
                                <div
                                    key={movie.id}
                                    style={{
                                        cursor: "pointer",
                                        transition: "transform 0.2s ease",
                                    }}
                                >
                                    <div style={{
                                        position: "relative",
                                        aspectRatio: "2/3",
                                        borderRadius: "12px",
                                        overflow: "hidden",
                                        background: "rgba(255,255,255,0.05)",
                                        marginBottom: "12px",
                                    }}>
                                        {posterUrl ? (
                                            <Image
                                                src={posterUrl}
                                                alt={movie.title}
                                                fill
                                                sizes="150px"
                                                style={{ objectFit: "cover" }}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div style={{
                                                width: "100%",
                                                height: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#333",
                                                fontSize: "3rem",
                                            }}>
                                                🎬
                                            </div>
                                        )}

                                        {/* Rating badge */}
                                        <div style={{
                                            position: "absolute",
                                            top: "8px",
                                            right: "8px",
                                            background: "rgba(0,0,0,0.85)",
                                            color: movie.vote_average >= 8 ? "#fbbf24" : "#fff",
                                            padding: "4px 8px",
                                            borderRadius: "8px",
                                            fontSize: "0.75rem",
                                            fontWeight: "700",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "3px",
                                        }}>
                                            ⭐ {movie.vote_average.toFixed(1)}
                                        </div>
                                    </div>

                                    <div style={{
                                        fontWeight: "600",
                                        fontSize: "0.9rem",
                                        lineHeight: "1.3",
                                        marginBottom: "4px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                    }}>
                                        {movie.title}
                                    </div>
                                    <div style={{ color: "#666", fontSize: "0.8rem" }}>
                                        {year}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {blindspots.length === 0 && (
                <div style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#666",
                }}>
                    <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🎉</div>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>No blind spots found!</h2>
                    <p>You've watched all the classics. Impressive!</p>
                </div>
            )}
        </main>
    );
}
