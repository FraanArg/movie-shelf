import { cookies } from "next/headers";
import Link from "next/link";
import { getUserStats, getTraktUser } from "@/lib/trakt";
import { getDB } from "@/lib/db";
import ThemeToggle from "@/components/ThemeToggle";

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

    // 1. Read from Local DB
    let items = await getDB();

    // Deduplicate
    const uniqueItems = Array.from(new Map(items.map(m => [m.imdbId || m.id, m])).values());

    // Calculate Stats
    const totalMovies = uniqueItems.filter(i => i.type === "movie").length;
    const totalShows = uniqueItems.filter(i => i.type === "series").length;

    // Genres (Mock logic since we don't have genres in DB yet, but we can infer or fetch)
    // For now, let's use the year as a proxy for "Era" distribution which we DO have.
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
