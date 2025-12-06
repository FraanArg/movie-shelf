import { getDB } from "@/lib/db";
import ActorGraph from "@/components/ActorGraph";

export default async function ConnectionsPage() {
    const items = await getDB();
    const movies = items.filter(i => i.type === "movie"); // Filter for movies for now

    return (
        <main style={{ padding: "100px 40px", minHeight: "100vh" }}>
            <h1 style={{ fontSize: "3rem", marginBottom: "10px", fontFamily: "var(--font-oswald)" }}>Connections</h1>
            <p style={{ color: "#888", marginBottom: "40px" }}>Explore the web of actors and directors in your library.</p>

            <div style={{ height: "80vh", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px" }}>
                <ActorGraph movies={movies} />
            </div>
        </main>
    );
}
