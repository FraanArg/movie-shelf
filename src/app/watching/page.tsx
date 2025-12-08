import Link from "next/link";
import Image from "next/image";
import { getDB, MovieItem } from "@/lib/db";

export default async function WatchingPage() {
    // Get all items from DB
    let items: MovieItem[] = [];
    try {
        items = await getDB() || [];
    } catch (e) {
        console.error("Failed to read DB:", e);
    }

    // Filter for TV shows that are currently being watched
    // Include shows marked as "watching" OR shows with watchedEpisodes > 0 but < totalEpisodes
    const watchingShows = items.filter(item => {
        if (item.type !== "series") return false;
        if (item.list === "watching") return true;
        // Also include shows with partial progress
        if (item.watchedEpisodes && item.totalEpisodes && item.watchedEpisodes < item.totalEpisodes) return true;
        return false;
    });

    // Sort by last watched date (most recent first)
    watchingShows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const emptyState = watchingShows.length === 0;

    return (
        <main style={{ padding: "0 0 80px 0", minHeight: "100vh" }}>
            <div style={{ padding: "30px 40px 15px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <Link href="/" style={{
                        fontSize: "1.2rem",
                        textDecoration: "none",
                        color: "var(--foreground)",
                        opacity: 0.6,
                    }}>
                        ←
                    </Link>
                    <h1 style={{
                        fontSize: "2rem",
                        fontWeight: "600",
                        letterSpacing: "-0.3px",
                        background: "linear-gradient(180deg, var(--foreground) 0%, rgba(255,255,255,0.7) 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                    }}>
                        Currently Watching
                    </h1>
                    <span style={{ fontSize: "1rem", opacity: 0.6, fontWeight: "400" }}>
                        {watchingShows.length} {watchingShows.length === 1 ? "show" : "shows"}
                    </span>
                </div>
            </div>

            {emptyState ? (
                <div style={{
                    padding: "80px 40px",
                    textAlign: "center",
                    color: "var(--foreground)",
                    opacity: 0.6
                }}>
                    <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📺</div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "500", marginBottom: "10px" }}>
                        No shows in progress
                    </h2>
                    <p style={{ fontSize: "1rem" }}>
                        TV shows youre currently watching will appear here.
                        <br />
                        Track your progress through each season!
                    </p>
                </div>
            ) : (
                <div style={{ padding: "20px 40px" }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                        gap: "20px",
                    }}>
                        {watchingShows.map((show) => (
                            <ShowProgressCard key={show.imdbId || show.id} show={show} />
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}

function ShowProgressCard({ show }: { show: MovieItem }) {
    const watchedEpisodes = show.watchedEpisodes || 0;
    const totalEpisodes = show.totalEpisodes || 0;
    const progressPercent = totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0;

    // Estimate time remaining (assume ~45min per episode)
    const episodesLeft = totalEpisodes - watchedEpisodes;
    const hoursLeft = Math.round(episodesLeft * 0.75);

    const currentSeason = show.currentSeason || 1;
    const totalSeasons = show.totalSeasons || 1;

    return (
        <Link
            href={`/movie/${show.imdbId}`}
            style={{ textDecoration: "none", color: "inherit" }}
        >
            <div style={{
                display: "flex",
                gap: "20px",
                padding: "20px",
                background: "var(--glass-bg)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "16px",
                border: "1px solid var(--glass-border)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "pointer",
            }}
                className="hover-lift"
            >
                {/* Poster */}
                <div style={{
                    width: "100px",
                    height: "150px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    flexShrink: 0,
                    position: "relative",
                }}>
                    {show.posterUrl ? (
                        <Image
                            src={show.posterUrl}
                            alt={show.title}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="100px"
                        />
                    ) : (
                        <div style={{
                            width: "100%",
                            height: "100%",
                            background: "rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2rem",
                        }}>
                            📺
                        </div>
                    )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "5px" }}>
                            {show.title}
                        </h3>
                        <p style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "10px" }}>
                            Season {currentSeason} of {totalSeasons}
                        </p>
                    </div>

                    {/* Progress bar */}
                    <div>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "6px",
                            fontSize: "0.8rem",
                        }}>
                            <span style={{ opacity: 0.7 }}>
                                {watchedEpisodes} / {totalEpisodes} episodes
                            </span>
                            <span style={{ color: "var(--accent)", fontWeight: "600" }}>
                                {progressPercent.toFixed(0)}%
                            </span>
                        </div>
                        <div style={{
                            height: "6px",
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: "3px",
                            overflow: "hidden",
                        }}>
                            <div style={{
                                width: `${progressPercent}%`,
                                height: "100%",
                                background: "linear-gradient(90deg, var(--accent), #30d158)",
                                borderRadius: "3px",
                                transition: "width 0.3s ease",
                            }} />
                        </div>
                    </div>

                    {/* Time remaining */}
                    {episodesLeft > 0 && (
                        <div style={{
                            marginTop: "10px",
                            padding: "8px 12px",
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "8px",
                            fontSize: "0.8rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}>
                            <span>⏱️</span>
                            <span style={{ opacity: 0.8 }}>
                                {episodesLeft} episodes left • ~{hoursLeft}h to finish
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
