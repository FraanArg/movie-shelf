import { cookies } from "next/headers";
import Link from "next/link";
import { getUserStats, getTraktUser } from "@/lib/trakt";
import { getDB } from "@/lib/db";
import ThemeToggle from "@/components/ThemeToggle";
import GenreRadarChart from "@/components/GenreRadarChart";
import AffinityStats from "@/components/AffinityStats";
import BadgeGrid from "@/components/BadgeGrid";
import ViewingHeatmap from "@/components/ViewingHeatmap";
import { getEarnedBadges, getAllBadges } from "@/lib/badges";

export default async function ProfilePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("trakt_access_token")?.value;
    const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;

    let user = null;
    if (token && clientId) {
        try {
            user = await getTraktUser(token, clientId);
        } catch (e) {
            console.error("Failed to fetch user", e);
        }
    }

    // 1. Read from Local DB with defensive error handling
    let items: any[] = [];
    try {
        items = await getDB() || [];
    } catch (e) {
        console.error("Failed to read DB:", e);
        items = [];
    }

    // Deduplicate with null checks
    const uniqueItems = Array.from(new Map(items.filter(m => m).map(m => [m.imdbId || m.id, m])).values());


    // Calculate Stats
    const totalMovies = uniqueItems.filter(i => i.type === "movie").length;
    const totalShows = uniqueItems.filter(i => i.type === "series").length;

    // Decades distribution
    const decades: Record<string, number> = {};
    uniqueItems.forEach(item => {
        if (item.year) {
            const decade = Math.floor(parseInt(item.year) / 10) * 10;
            const key = `${decade}s`;
            decades[key] = (decades[key] || 0) + 1;
        }
    });

    const sortedDecades = Object.entries(decades).sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
    const maxCount = Math.max(...Object.values(decades), 1);

    // Genre aggregation for radar chart
    const genreCounts: Record<string, number> = {};
    uniqueItems.forEach(item => {
        if (item.Genre && item.Genre !== "N/A") {
            const genres = item.Genre.split(", ");
            genres.forEach((genre: string) => {
                const trimmed = genre.trim();
                if (trimmed) {
                    genreCounts[trimmed] = (genreCounts[trimmed] || 0) + 1;
                }
            });
        }
    });

    const genreData = Object.entries(genreCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    // Director aggregation
    const directorMap: Record<string, { count: number; movies: string[] }> = {};
    uniqueItems.forEach(item => {
        if (item.Director && item.Director !== "N/A") {
            const directors = item.Director.split(", ");
            directors.forEach((director: string) => {
                const trimmed = director.trim();
                if (trimmed) {
                    if (!directorMap[trimmed]) {
                        directorMap[trimmed] = { count: 0, movies: [] };
                    }
                    directorMap[trimmed].count++;
                    directorMap[trimmed].movies.push(item.title);
                }
            });
        }
    });

    const topDirectors = Object.entries(directorMap)
        .map(([name, data]) => ({ name, count: data.count, movies: data.movies }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Actor aggregation
    const actorMap: Record<string, { count: number; movies: string[] }> = {};
    uniqueItems.forEach(item => {
        if (item.Actors && item.Actors !== "N/A") {
            const actors = item.Actors.split(", ");
            actors.forEach((actor: string) => {
                const trimmed = actor.trim();
                if (trimmed) {
                    if (!actorMap[trimmed]) {
                        actorMap[trimmed] = { count: 0, movies: [] };
                    }
                    actorMap[trimmed].count++;
                    actorMap[trimmed].movies.push(item.title);
                }
            });
        }
    });

    const topActors = Object.entries(actorMap)
        .map(([name, data]) => ({ name, count: data.count, movies: data.movies }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return (
        <main style={{ padding: "40px 20px", minHeight: "100vh", maxWidth: "800px", margin: "0 auto" }}>
            <Link href="/" style={{ color: "var(--accent)", marginBottom: "30px", display: "inline-block" }}>
                &larr; Back to Library
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "bold", color: "#fff" }}>
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "5px" }}>{user?.name || "User Stats"}</h1>
                    <p style={{ color: "#888" }}>@{user?.username || "trakt_user"}</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
                <StatCard label="Movies Watched" value={totalMovies} />
                <StatCard label="TV Shows" value={totalShows} />
                <StatCard label="Total Items" value={uniqueItems.length} />
            </div>

            {/* Quick Links */}
            <div style={{
                display: "flex",
                gap: "15px",
                marginBottom: "30px",
                flexWrap: "wrap",
            }}>
                <Link href="/completionist" style={{
                    padding: "12px 20px",
                    background: "var(--glass-bg)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: "12px",
                    border: "1px solid var(--glass-border)",
                    textDecoration: "none",
                    color: "var(--foreground)",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                }}>
                    🎯 Completionist Tracker
                </Link>
                <Link href="/year-review" style={{
                    padding: "12px 20px",
                    background: "var(--glass-bg)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: "12px",
                    border: "1px solid var(--glass-border)",
                    textDecoration: "none",
                    color: "var(--foreground)",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                }}>
                    📅 Year in Review
                </Link>
            </div>

            {/* Viewing Activity Heatmap */}
            <ViewingHeatmap watchDates={uniqueItems.filter(m => m.date).map(m => m.date)} />

            <div style={{ background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "20px", marginBottom: "40px" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>Era Distribution</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {sortedDecades.map(([decade, count]) => (
                        <div key={decade} style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                            <span style={{ width: "50px", fontWeight: "bold", color: "#888" }}>{decade}</span>
                            <div style={{ flex: 1, height: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "6px", overflow: "hidden" }}>
                                <div style={{ width: `${(count / maxCount) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: "6px" }}></div>
                            </div>
                            <span style={{ width: "30px", textAlign: "right", fontSize: "0.9rem" }}>{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Genre Radar Chart */}
            {genreData.length >= 3 && (
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "20px", marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>Genre Distribution</h2>
                    <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "20px" }}>Your top genres based on your collection</p>
                    <GenreRadarChart genres={genreData} size={320} />
                </div>
            )}

            {/* Affinities */}
            {(topDirectors.length > 0 || topActors.length > 0) && (
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "20px", marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>Your Affinities</h2>
                    <AffinityStats directors={topDirectors} actors={topActors} />
                </div>
            )}

            {/* Collection Badges */}
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "20px", marginBottom: "40px" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>Collection Badges</h2>
                <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "20px" }}>
                    {getEarnedBadges(uniqueItems, genreCounts).length} of {getAllBadges().length} earned
                </p>
                <BadgeGrid
                    earnedBadges={getEarnedBadges(uniqueItems, genreCounts)}
                    allBadges={getAllBadges()}
                />
            </div>

            {/* Export Section */}
            <div style={{ background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "20px", marginBottom: "40px" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>📦 Export Library</h2>
                <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "20px" }}>
                    Download your collection data for backup or analysis
                </p>
                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                    <a
                        href="/api/export?format=json"
                        download
                        style={{
                            padding: "12px 24px",
                            background: "var(--accent)",
                            color: "white",
                            borderRadius: "12px",
                            textDecoration: "none",
                            fontWeight: "500",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        📄 Export as JSON
                    </a>
                    <a
                        href="/api/export?format=csv"
                        download
                        style={{
                            padding: "12px 24px",
                            background: "rgba(255,255,255,0.1)",
                            color: "var(--foreground)",
                            borderRadius: "12px",
                            textDecoration: "none",
                            fontWeight: "500",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        📊 Export as CSV
                    </a>
                </div>
            </div>
        </main>
    );
}

function StatCard({ label, value }: { label: string, value: number }) {
    return (
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "5px", color: "var(--accent)" }}>{value}</div>
            <div style={{ color: "#888", fontSize: "0.9rem", fontWeight: "500" }}>{label}</div>
        </div>
    );
}
