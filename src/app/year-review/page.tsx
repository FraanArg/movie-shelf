import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getDB } from "@/lib/db";

export default async function YearInReviewPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
    const { year: yearParam } = await searchParams;
    const currentYear = new Date().getFullYear();
    const year = yearParam ? parseInt(yearParam) : currentYear;

    // Get all items
    let items: any[] = [];
    try {
        items = await getDB() || [];
    } catch (e) {
        console.error("Failed to read DB:", e);
        items = [];
    }

    // Filter for the selected year and watched items
    const yearItems = items.filter(item => {
        if (!item || !item.date) return false;
        const itemYear = new Date(item.date).getFullYear();
        return itemYear === year && (item.list === "watched" || !item.list);
    });

    const movies = yearItems.filter(i => i.type === "movie");
    const shows = yearItems.filter(i => i.type === "series");

    // Calculate total watch time (estimate ~2h per movie, ~45min per episode)
    const totalHours = Math.round(movies.length * 2 + shows.length * 0.75);

    // Top genres
    const genreCounts: Record<string, number> = {};
    yearItems.forEach(item => {
        if (item.Genre && item.Genre !== "N/A") {
            item.Genre.split(", ").forEach((g: string) => {
                const trimmed = g.trim();
                if (trimmed) genreCounts[trimmed] = (genreCounts[trimmed] || 0) + 1;
            });
        }
    });
    const topGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Top directors
    const directorCounts: Record<string, number> = {};
    yearItems.forEach(item => {
        if (item.Director && item.Director !== "N/A") {
            item.Director.split(", ").forEach((d: string) => {
                const trimmed = d.trim();
                if (trimmed) directorCounts[trimmed] = (directorCounts[trimmed] || 0) + 1;
            });
        }
    });
    const topDirectors = Object.entries(directorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Rating distribution
    const ratings = yearItems
        .map(i => parseFloat(i.imdbRating || "0"))
        .filter(r => r > 0);
    const avgRating = ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : "N/A";

    // Decade distribution
    const decades: Record<string, number> = {};
    yearItems.forEach(item => {
        if (item.year) {
            const decade = Math.floor(parseInt(item.year) / 10) * 10;
            decades[`${decade}s`] = (decades[`${decade}s`] || 0) + 1;
        }
    });
    const topDecades = Object.entries(decades)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // Best month
    const monthCounts: Record<number, number> = {};
    yearItems.forEach(item => {
        if (item.date) {
            const month = new Date(item.date).getMonth();
            monthCounts[month] = (monthCounts[month] || 0) + 1;
        }
    });
    const bestMonth = Object.entries(monthCounts)
        .sort((a, b) => b[1] - a[1])[0];
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    // Available years for navigation
    const allYears = new Set(
        items
            .filter(i => i && i.date)
            .map(i => new Date(i.date).getFullYear())
    );
    const years = Array.from(allYears).sort((a, b) => b - a);

    return (
        <main style={{
            padding: "0 var(--space-md)",
            paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
            minHeight: "100vh",
            maxWidth: "800px",
            margin: "0 auto",
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
                    {year} Review
                </h1>
            </div>

            {/* Year navigation */}
            <div style={{
                display: "flex",
                gap: "var(--space-sm)",
                marginTop: "var(--space-lg)",
                marginBottom: "var(--space-xl)",
                flexWrap: "wrap",
            }}>
                {years.map(y => (
                    <Link
                        key={y}
                        href={`/year-review?year=${y}`}
                        style={{
                            padding: "var(--space-sm) var(--space-md)",
                            borderRadius: "var(--radius-full)",
                            background: y === year ? "var(--tint)" : "var(--fill-tertiary)",
                            color: y === year ? "white" : "var(--label-primary)",
                            textDecoration: "none",
                            fontSize: "var(--font-size-subhead)",
                            fontWeight: y === year ? 600 : 400,
                        }}
                    >
                        {y}
                    </Link>
                ))}
            </div>

            {yearItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", opacity: 0.6 }}>
                    <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🎬</div>
                    <p>No movies watched in {year}. Check another year!</p>
                </div>
            ) : (
                <>
                    {/* Big Stats */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: "20px",
                        marginBottom: "40px"
                    }}>
                        <StatBox value={movies.length} label="Movies" emoji="🎬" color="#ff6b6b" />
                        <StatBox value={shows.length} label="TV Shows" emoji="📺" color="#48dbfb" />
                        <StatBox value={`${totalHours}h`} label="Watch Time" emoji="⏱️" color="#feca57" />
                        <StatBox value={avgRating} label="Avg Rating" emoji="⭐" color="#ff9ff3" />
                    </div>

                    {/* Top Genres */}
                    <Section title="🎭 Top Genres">
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {topGenres.map(([genre, count], i) => (
                                <div key={genre} style={{
                                    padding: "12px 20px",
                                    background: `rgba(255,255,255,${0.15 - i * 0.02})`,
                                    borderRadius: "20px",
                                    fontSize: "0.95rem",
                                }}>
                                    {genre} <span style={{ opacity: 0.6 }}>({count})</span>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* Top Directors */}
                    {topDirectors.length > 0 && (
                        <Section title="🎬 Favorite Directors">
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {topDirectors.map(([director, count], i) => (
                                    <div key={director} style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "12px 16px",
                                        background: "rgba(255,255,255,0.05)",
                                        borderRadius: "12px",
                                    }}>
                                        <span style={{ fontWeight: i === 0 ? "600" : "400" }}>
                                            {i === 0 && "🏆 "}{director}
                                        </span>
                                        <span style={{ opacity: 0.6 }}>{count} films</span>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Era Preference */}
                    <Section title="📅 Your Era">
                        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                            {topDecades.map(([decade, count], i) => (
                                <div key={decade} style={{
                                    padding: "15px 25px",
                                    background: i === 0 ? "var(--accent)" : "rgba(255,255,255,0.1)",
                                    color: i === 0 ? "white" : "inherit",
                                    borderRadius: "12px",
                                    fontWeight: "600",
                                }}>
                                    {decade} <span style={{ opacity: 0.7, fontWeight: "400" }}>({count})</span>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* Best Month */}
                    {bestMonth && (
                        <Section title="🗓️ Most Active Month">
                            <div style={{
                                padding: "20px",
                                background: "rgba(255,255,255,0.05)",
                                borderRadius: "16px",
                                textAlign: "center",
                            }}>
                                <div style={{ fontSize: "2rem", fontWeight: "700" }}>
                                    {monthNames[parseInt(bestMonth[0])]}
                                </div>
                                <div style={{ opacity: 0.6, marginTop: "5px" }}>
                                    {bestMonth[1]} movies watched
                                </div>
                            </div>
                        </Section>
                    )}
                </>
            )}
        </main>
    );
}

function StatBox({ value, label, emoji, color }: { value: string | number; label: string; emoji: string; color: string }) {
    return (
        <div style={{
            padding: "25px 20px",
            background: `linear-gradient(135deg, ${color}22, ${color}11)`,
            border: `1px solid ${color}33`,
            borderRadius: "16px",
            textAlign: "center",
        }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "5px" }}>{emoji}</div>
            <div style={{ fontSize: "2rem", fontWeight: "700" }}>{value}</div>
            <div style={{ opacity: 0.7, fontSize: "0.85rem" }}>{label}</div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: "35px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "15px" }}>{title}</h2>
            {children}
        </div>
    );
}
