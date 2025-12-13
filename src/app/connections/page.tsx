import { getDB } from "@/lib/db";
import dynamic from "next/dynamic";
import Link from "next/link";
import LargeTitle from "@/components/LargeTitle";

// Graph loading skeleton
const GraphSkeleton = () => (
    <div style={{
        height: "100%",
        minHeight: "600px",
        background: "var(--fill-tertiary)",
        borderRadius: "var(--radius-lg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--label-tertiary)",
    }}>
        Loading graph...
    </div>
);

// Heavy graph component - dynamic import (200KB+ library)
const ActorGraph = dynamic(() => import("@/components/ActorGraph"), {
    loading: () => <GraphSkeleton />,
});

export default async function ConnectionsPage() {
    const items = await getDB();
    const movies = items.filter(i => i.type === "movie");

    return (
        <main style={{
            padding: "0 var(--space-md) calc(80px + env(safe-area-inset-bottom)) var(--space-md)",
            minHeight: "100vh"
        }}>
            <div style={{ padding: "0 var(--space-md)" }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-sm)",
                    paddingTop: "var(--space-lg)",
                    paddingBottom: "var(--space-md)",
                }}>
                    <Link
                        href="/"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "44px",
                            height: "44px",
                            borderRadius: "var(--radius-full)",
                            color: "var(--tint)",
                            textDecoration: "none",
                            fontSize: "1.5rem",
                        }}
                    >
                        ←
                    </Link>
                    <h1
                        className="large-title"
                        style={{
                            fontSize: "var(--font-size-title1)",
                            fontWeight: 700,
                            color: "var(--label-primary)",
                            margin: 0,
                            letterSpacing: "-0.3px",
                            fontFamily: "var(--font-system)",
                        }}
                    >
                        Connections
                    </h1>
                </div>
            </div>

            <p style={{
                color: "var(--label-secondary)",
                marginBottom: "var(--space-lg)",
                fontSize: "var(--font-size-subhead)",
                padding: "0 var(--space-md)",
            }}>
                Explore how actors and directors connect through your {movies.length} watched films.
            </p>

            <div style={{ height: "calc(100vh - 200px)", minHeight: "600px" }}>
                <ActorGraph movies={movies} />
            </div>
        </main>
    );
}
