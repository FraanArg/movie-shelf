import Link from "next/link";
import Image from "next/image";
import { getDB } from "@/lib/db";

export default async function PosterWallPage() {
    const items = await getDB();

    // Get unique movies with posters, shuffled randomly
    const uniqueItems = Array.from(new Map(items.map(m => [m.imdbId || m.id, m])).values());
    const moviesWithPosters = uniqueItems
        .filter(m => m.posterUrl && m.posterUrl !== "N/A")
        .sort(() => Math.random() - 0.5); // Shuffle

    return (
        <main className="poster-wall" style={{
            minHeight: "100vh",
            background: "#000",
            padding: "0",
            position: "relative",
        }}>
            {/* Header overlay */}
            <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                padding: "20px 30px",
                background: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)",
                zIndex: 100,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <Link href="/" style={{
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    opacity: 0.7,
                    transition: "opacity 0.2s",
                }}>
                    ← Back to Library
                </Link>
                <h1 style={{
                    color: "#fff",
                    fontSize: "1.2rem",
                    fontWeight: "600",
                    letterSpacing: "4px",
                    textTransform: "uppercase",
                    opacity: 0.8,
                }}>
                    Poster Wall
                </h1>
                <span style={{
                    color: "#888",
                    fontSize: "0.8rem",
                }}>
                    {moviesWithPosters.length} films
                </span>
            </div>

            {/* Masonry Grid */}
            <div style={{
                columns: "6 180px",
                columnGap: "4px",
                padding: "80px 4px 4px 4px",
            }}>
                {moviesWithPosters.map((movie, index) => (
                    <Link
                        key={movie.imdbId || movie.id}
                        href={`/movie/${movie.imdbId}`}
                        className="poster-wall-item"
                        style={{
                            display: "block",
                            marginBottom: "4px",
                            breakInside: "avoid",
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: "4px",
                            transition: "all 0.3s ease",
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                                width: "100%",
                                aspectRatio: "2/3",
                            }}
                        >
                            <Image
                                src={movie.posterUrl!}
                                alt={movie.title}
                                fill
                                sizes="(max-width: 768px) 50vw, 16vw"
                                style={{
                                    objectFit: "cover",
                                    transition: "transform 0.4s ease, filter 0.3s ease",
                                }}
                                loading={index < 20 ? "eager" : "lazy"}
                            />
                            {/* Hover overlay */}
                            <div
                                className="poster-overlay"
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%)",
                                    opacity: 0,
                                    transition: "opacity 0.3s ease",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "flex-end",
                                    padding: "12px",
                                }}
                            >
                                <span style={{
                                    color: "#fff",
                                    fontSize: "0.8rem",
                                    fontWeight: "600",
                                    lineHeight: "1.2",
                                }}>
                                    {movie.title}
                                </span>
                                <span style={{
                                    color: "#888",
                                    fontSize: "0.7rem",
                                    marginTop: "4px",
                                }}>
                                    {movie.year}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}

