import { cookies } from "next/headers";
import Link from "next/link";
import { getTraktUser } from "@/lib/trakt";
import { getDB } from "@/lib/db";
import GenreRadarChart from "@/components/GenreRadarChart";
import AffinityStats from "@/components/AffinityStats";
import BadgeGrid from "@/components/BadgeGrid";
import ViewingHeatmap from "@/components/ViewingHeatmap";
import ReEnrichButton from "@/components/ReEnrichButton";
import { getEarnedBadges, getAllBadges } from "@/lib/badges";
// New components
import StatCardEnhanced from "@/components/StatCardEnhanced";
import StreakStats from "@/components/StreakStats";
import BestDayChart from "@/components/BestDayChart";
import MonthlyTrendChart from "@/components/MonthlyTrendChart";
import BadgeProgress from "@/components/BadgeProgress";
import MilestoneTimeline from "@/components/MilestoneTimeline";
import PeakHoursChart from "@/components/PeakHoursChart";
import DidYouKnow from "@/components/DidYouKnow";
import LanguagePieChart from "@/components/LanguagePieChart";
import ShareableStatsCard from "@/components/ShareableStatsCard";
import GenreTrendChart from "@/components/GenreTrendChart";
import CountryMap from "@/components/CountryMap";
import StudioStats from "@/components/StudioStats";

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

    // Filter to ONLY watched items (exclude watchlist for stats)
    const watchedItems = uniqueItems.filter(i => i.list !== "watchlist");

    // Calculate Stats based on WATCHED items only
    const totalMovies = watchedItems.filter(i => i.type === "movie").length;
    const totalShows = watchedItems.filter(i => i.type === "series").length;

    // Average Rating
    const ratings = watchedItems
        .map(i => parseFloat(i.imdbRating || "0"))
        .filter(r => r > 0);
    const avgRating = ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : "N/A";

    // Total Runtime
    let totalMinutes = 0;
    watchedItems.forEach(item => {
        if (item.Runtime && item.Runtime !== "N/A") {
            const mins = parseInt(item.Runtime);
            if (!isNaN(mins)) totalMinutes += mins;
        }
    });
    const totalHours = Math.round(totalMinutes / 60);
    const totalDays = (totalMinutes / 60 / 24).toFixed(1);

    // Longest Movie
    const moviesWithRuntime = watchedItems
        .filter(i => i.type === "movie" && i.Runtime && i.Runtime !== "N/A")
        .map(i => ({ ...i, runtimeMins: parseInt(i.Runtime) }))
        .filter(i => !isNaN(i.runtimeMins))
        .sort((a, b) => b.runtimeMins - a.runtimeMins);
    const longestMovie = moviesWithRuntime[0];

    // Average Release Year
    const years = watchedItems
        .map(i => parseInt(i.year))
        .filter(y => !isNaN(y) && y > 1800);
    const avgYear = years.length > 0
        ? Math.round(years.reduce((a, b) => a + b, 0) / years.length)
        : null;
    const avgDecade = avgYear ? `${Math.floor(avgYear / 10) * 10}s` : null;

    // Decades distribution (watched only)
    const decades: Record<string, number> = {};
    watchedItems.forEach(item => {
        if (item.year) {
            const decade = Math.floor(parseInt(item.year) / 10) * 10;
            const key = `${decade}s`;
            decades[key] = (decades[key] || 0) + 1;
        }
    });

    const sortedDecades = Object.entries(decades).sort((a, b) => parseInt(b[0]) - parseInt(a[0]));
    const maxCount = Math.max(...Object.values(decades), 1);

    // Genre aggregation for radar chart (watched only)
    const genreCounts: Record<string, number> = {};
    watchedItems.forEach(item => {
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

    const topGenre = genreData[0]?.name || "N/A";

    // Director aggregation (watched only - movies AND shows)
    const directorMap: Record<string, { count: number; titles: string[] }> = {};
    watchedItems.forEach(item => {
        if (item.Director && item.Director !== "N/A") {
            const directors = item.Director.split(", ");
            directors.forEach((director: string) => {
                const trimmed = director.trim();
                if (trimmed) {
                    if (!directorMap[trimmed]) {
                        directorMap[trimmed] = { count: 0, titles: [] };
                    }
                    directorMap[trimmed].count++;
                    directorMap[trimmed].titles.push(item.title);
                }
            });
        }
    });

    const topDirectors = Object.entries(directorMap)
        .map(([name, data]) => ({ name, count: data.count, movies: data.titles }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Actor aggregation (watched only - movies AND shows)
    const actorMap: Record<string, { count: number; titles: string[] }> = {};
    watchedItems.forEach(item => {
        if (item.Actors && item.Actors !== "N/A") {
            const actors = item.Actors.split(", ");
            actors.forEach((actor: string) => {
                const trimmed = actor.trim();
                if (trimmed) {
                    if (!actorMap[trimmed]) {
                        actorMap[trimmed] = { count: 0, titles: [] };
                    }
                    actorMap[trimmed].count++;
                    actorMap[trimmed].titles.push(item.title);
                }
            });
        }
    });

    const topActors = Object.entries(actorMap)
        .map(([name, data]) => ({ name, count: data.count, movies: data.titles }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Watch dates for components
    const watchDates = watchedItems.filter(m => m.date).map(m => m.date);

    // Movies by date for interactive heatmap
    const moviesByDate: Record<string, string[]> = {};
    watchedItems.forEach(item => {
        if (item.date) {
            const dateKey = item.date.split("T")[0];
            if (!moviesByDate[dateKey]) moviesByDate[dateKey] = [];
            moviesByDate[dateKey].push(item.title);
        }
    });

    // Milestone data
    const milestoneData = watchedItems
        .filter(i => i.date)
        .map(i => ({ date: i.date, title: i.title }));

    // Badge data
    const earnedBadges = getEarnedBadges(watchedItems, genreCounts);
    const allBadges = getAllBadges();
    const earnedBadgeIds = earnedBadges.map(b => b.id);

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

            {/* Main Stats Grid - Animated */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "30px" }}>
                <StatCardEnhanced label="Movies" value={totalMovies} emoji="🎬" color="#f97316" delay={0} />
                <StatCardEnhanced label="TV Shows" value={totalShows} emoji="📺" color="#3b82f6" delay={0.1} />
                <StatCardEnhanced label="Watch Hours" value={totalHours} suffix="h" emoji="⏱️" color="#22c55e" delay={0.2} />
                <StatCardEnhanced label="Avg Rating" value={parseFloat(avgRating) || 0} decimals={1} emoji="⭐" color="#fbbf24" delay={0.3} />
            </div>

            {/* Secondary Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "30px" }}>
                <div style={{
                    padding: "20px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "16px",
                    textAlign: "center",
                }}>
                    <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "8px" }}>Total Watch Time</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#a855f7" }}>{totalDays} days</div>
                </div>
                {longestMovie && (
                    <div style={{
                        padding: "20px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "16px",
                        textAlign: "center",
                    }}>
                        <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "8px" }}>Longest Movie</div>
                        <div style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "4px" }}>{longestMovie.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "#666" }}>{longestMovie.runtimeMins} minutes</div>
                    </div>
                )}
                {avgDecade && (
                    <div style={{
                        padding: "20px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "16px",
                        textAlign: "center",
                    }}>
                        <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "8px" }}>Average Era</div>
                        <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#ec4899" }}>{avgDecade}</div>
                    </div>
                )}
            </div>

            {/* Did You Know */}
            <div style={{ marginBottom: "30px" }}>
                <DidYouKnow items={watchedItems} />
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

            {/* Fix Missing Data */}
            <ReEnrichButton />

            {/* Streak Stats */}
            <div style={{ marginBottom: "30px" }}>
                <h2 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "15px" }}>🔥 Streaks</h2>
                <StreakStats watchDates={watchDates} />
            </div>

            {/* Viewing Activity Heatmap */}
            <ViewingHeatmap watchDates={watchDates} moviesByDate={moviesByDate} />

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <BestDayChart watchDates={watchDates} />
                <PeakHoursChart watchDates={watchDates} />
            </div>

            {/* Monthly Trend */}
            <div style={{ marginBottom: "30px" }}>
                <MonthlyTrendChart watchDates={watchDates} />
            </div>

            {/* Badge Progress */}
            <div style={{ marginBottom: "30px" }}>
                <BadgeProgress
                    allBadges={allBadges}
                    earnedBadgeIds={earnedBadgeIds}
                    currentStats={{ totalMovies, genreCounts }}
                />
            </div>

            {/* Milestones */}
            <div style={{ marginBottom: "30px" }}>
                <MilestoneTimeline watchDates={milestoneData} />
            </div>

            {/* Era Distribution */}
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

            {/* Genre Trend Chart */}
            <div style={{ marginBottom: "30px" }}>
                <GenreTrendChart items={watchedItems} />
            </div>

            {/* Genre Radar Chart */}
            {genreData.length >= 3 && (
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "20px", marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>Genre Distribution</h2>
                    <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "20px" }}>Your top genres based on your collection</p>
                    <GenreRadarChart genres={genreData} size={320} />
                </div>
            )}

            {/* Language Distribution */}
            <div style={{ marginBottom: "30px" }}>
                <LanguagePieChart items={watchedItems} />
            </div>

            {/* Country Distribution */}
            <div style={{ marginBottom: "30px" }}>
                <CountryMap items={watchedItems} />
            </div>

            {/* Studios */}
            <div style={{ marginBottom: "30px" }}>
                <StudioStats items={watchedItems} />
            </div>

            {/* Affinities */}
            {(topDirectors.length > 0 || topActors.length > 0) && (
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "20px", marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "20px" }}>Your Affinities</h2>
                    <AffinityStats directors={topDirectors} actors={topActors} />
                </div>
            )}

            {/* Shareable Stats Card */}
            <div style={{ marginBottom: "30px" }}>
                <ShareableStatsCard
                    username={user?.username || "MovieLover"}
                    totalMovies={totalMovies}
                    totalShows={totalShows}
                    topGenre={topGenre}
                    avgRating={avgRating}
                    watchHours={totalHours}
                />
            </div>

            {/* Collection Badges */}
            <div id="badges" style={{ background: "rgba(255,255,255,0.05)", padding: "30px", borderRadius: "20px", marginBottom: "40px" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>Collection Badges</h2>
                <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "20px" }}>
                    {earnedBadges.length} of {allBadges.length} earned
                </p>
                <BadgeGrid
                    earnedBadges={earnedBadges}
                    allBadges={allBadges}
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
