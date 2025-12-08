import { getDB } from "@/lib/db";
import ActorGraph from "@/components/ActorGraph";
import Link from "next/link";

export default async function ConnectionsPage() {
    const items = await getDB();
    const movies = items.filter(i => i.type === "movie"); // Filter for movies for now

    return (
        <main style={{ padding: "30px 40px 100px 40px", minHeight: "100vh" }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
            }}>
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
                        🔗 Connections
                    </h1>
                </div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
                    {movies.length} movies in your library
                </p>
            </div>

            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "25px", fontSize: "1rem" }}>
                Explore how actors and directors connect through your watched films.
            </p>

            <div style={{ height: "calc(100vh - 200px)", minHeight: "600px" }}>
                <ActorGraph movies={movies} />
            </div>
        </main>
    );
}
