import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { getDB, MovieItem } from "@/lib/db";

interface PersonProgress {
    name: string;
    watchedCount: number;
    watchedMovies: { title: string; year: string; posterUrl: string | null }[];
    role: "director" | "actor";
}

export default async function CompletionistPage() {
    // Get all items from DB
    let items: MovieItem[] = [];
    try {
        items = await getDB() || [];
    } catch (e) {
        console.error("Failed to read DB:", e);
    }

    // Only count movies (not TV shows) for filmography tracking
    const movies = items.filter(i => i.type === "movie");

    // Build director counts
    const directorMap: Record<string, PersonProgress> = {};
    movies.forEach(movie => {
        if (movie.Director && movie.Director !== "N/A") {
            movie.Director.split(",").forEach(director => {
                const name = director.trim();
                if (!name) return;
                if (!directorMap[name]) {
                    directorMap[name] = {
                        name,
                        watchedCount: 0,
                        watchedMovies: [],
                        role: "director",
                    };
                }
                directorMap[name].watchedCount++;
                directorMap[name].watchedMovies.push({
                    title: movie.title,
                    year: movie.year,
                    posterUrl: movie.posterUrl,
                });
            });
        }
    });

    // Build actor counts
    const actorMap: Record<string, PersonProgress> = {};
    movies.forEach(movie => {
        if (movie.Actors && movie.Actors !== "N/A") {
            movie.Actors.split(",").forEach(actor => {
                const name = actor.trim();
                if (!name) return;
                if (!actorMap[name]) {
                    actorMap[name] = {
                        name,
                        watchedCount: 0,
                        watchedMovies: [],
                        role: "actor",
                    };
                }
                actorMap[name].watchedCount++;
                actorMap[name].watchedMovies.push({
                    title: movie.title,
                    year: movie.year,
                    posterUrl: movie.posterUrl,
                });
            });
        }
    });

    // Sort and get top directors and actors
    const topDirectors = Object.values(directorMap)
        .sort((a, b) => b.watchedCount - a.watchedCount)
        .slice(0, 15);

    const topActors = Object.values(actorMap)
        .sort((a, b) => b.watchedCount - a.watchedCount)
        .slice(0, 15);

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
            }}>
                <Link
                    href="/profile"
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
                    Completionist
                </h1>
            </div>

            <p style={{
                color: "var(--label-secondary)",
                fontSize: "var(--font-size-body)",
                marginTop: "var(--space-sm)",
                marginBottom: "var(--space-xl)",
            }}>
                Track your progress toward completing filmographies.
            </p>

            {/* Directors Section */}
            <section style={{ padding: "0 40px", marginBottom: "40px" }}>
                <h2 style={{
                    fontSize: "1.3rem",
                    fontWeight: "600",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}>
                    🎬 Top Directors
                </h2>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "20px",
                }}>
                    {topDirectors.map((person, index) => (
                        <PersonCard
                            key={person.name}
                            person={person}
                            rank={index + 1}
                        />
                    ))}
                </div>
            </section>

            {/* Actors Section */}
            <section style={{ padding: "0 40px", marginBottom: "40px" }}>
                <h2 style={{
                    fontSize: "1.3rem",
                    fontWeight: "600",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}>
                    ⭐ Top Actors
                </h2>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "20px",
                }}>
                    {topActors.map((person, index) => (
                        <PersonCard
                            key={person.name}
                            person={person}
                            rank={index + 1}
                        />
                    ))}
                </div>
            </section>
        </main>
    );
}

function PersonCard({ person, rank }: { person: PersonProgress; rank: number }) {
    const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";

    return (
        <div style={{
            padding: "20px",
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "16px",
            border: "1px solid var(--glass-border)",
        }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "15px",
            }}>
                <div>
                    <h3 style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        marginBottom: "5px",
                    }}>
                        {rankEmoji} {person.name}
                    </h3>
                    <p style={{
                        fontSize: "0.85rem",
                        color: "var(--accent)",
                        fontWeight: "500",
                    }}>
                        {person.watchedCount} {person.watchedCount === 1 ? "film" : "films"} watched
                    </p>
                </div>
                <div style={{
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "rgba(255,255,255,0.6)",
                }}>
                    {person.role === "director" ? "Director" : "Actor"}
                </div>
            </div>

            {/* Mini posters */}
            <div style={{
                display: "flex",
                gap: "8px",
                overflowX: "auto",
                paddingBottom: "5px",
            }}
                className="hide-scrollbar"
            >
                {person.watchedMovies.slice(0, 6).map((movie, i) => (
                    <div
                        key={`${movie.title}-${i}`}
                        title={`${movie.title} (${movie.year})`}
                        style={{
                            width: "45px",
                            height: "67px",
                            borderRadius: "6px",
                            overflow: "hidden",
                            flexShrink: 0,
                            position: "relative",
                            background: "rgba(255,255,255,0.1)",
                        }}
                    >
                        {movie.posterUrl ? (
                            <Image
                                src={movie.posterUrl}
                                alt={movie.title}
                                fill
                                style={{ objectFit: "cover" }}
                                sizes="45px"
                            />
                        ) : (
                            <div style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.8rem",
                            }}>
                                🎬
                            </div>
                        )}
                    </div>
                ))}
                {person.watchedMovies.length > 6 && (
                    <div style={{
                        width: "45px",
                        height: "67px",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        color: "rgba(255,255,255,0.6)",
                        flexShrink: 0,
                    }}>
                        +{person.watchedMovies.length - 6}
                    </div>
                )}
            </div>
        </div>
    );
}
