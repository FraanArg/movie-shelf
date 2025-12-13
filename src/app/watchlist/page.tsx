import Link from "next/link";
import { Suspense } from "react";
import MovieGrid from "@/components/MovieGrid";
import SortControls from "@/components/SortControls";
import QuickFilters from "@/components/QuickFilters";
import LargeTitle from "@/components/LargeTitle";
import { getDB } from "@/lib/db";

export default async function WatchlistPage({ searchParams }: { searchParams: Promise<{ sort?: string, genre?: string }> }) {
    const { sort, genre } = await searchParams;

    // Get all items from DB
    let items: any[] = [];
    try {
        items = await getDB() || [];
    } catch (e) {
        console.error("Failed to read DB:", e);
        items = [];
    }

    // Filter for watchlist items only
    const watchlistItems = items.filter(m => m && m.list === "watchlist");

    // Deduplicate
    const uniqueItems = Array.from(new Map(watchlistItems.map(m => [m.imdbId || m.id, m])).values());

    let displayedMovies = [...uniqueItems];

    // Genre filtering
    if (genre) {
        displayedMovies = displayedMovies.filter(m => {
            const movieGenres = (m.Genre || "").toLowerCase();
            return movieGenres.includes(genre.toLowerCase());
        });
    }

    // Apply sorting
    if (sort === "year") {
        displayedMovies.sort((a, b) => parseInt(b.year) - parseInt(a.year));
    } else if (sort === "rating") {
        displayedMovies.sort((a, b) => parseFloat(b.imdbRating || "0") - parseFloat(a.imdbRating || "0"));
    } else if (sort === "added") {
        displayedMovies.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
        // Default: Title A-Z
        displayedMovies.sort((a, b) => a.title.localeCompare(b.title));
    }

    const emptyState = uniqueItems.length === 0;

    return (
        <main style={{
            padding: "0 var(--space-md)",
            paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
            minHeight: "100vh"
        }}>
            {/* Header with back button and title */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
                paddingTop: "var(--space-lg)",
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
                <div style={{ flex: 1 }}>
                    <h1
                        className="large-title"
                        style={{
                            fontSize: "var(--font-size-title1)",
                            fontWeight: 700,
                            color: "var(--label-primary)",
                            margin: 0,
                            fontFamily: "var(--font-system)",
                        }}
                    >
                        Watchlist
                    </h1>
                    <span style={{
                        fontSize: "var(--font-size-subhead)",
                        color: "var(--label-secondary)",
                    }}>
                        {uniqueItems.length} {uniqueItems.length === 1 ? "item" : "items"}
                    </span>
                </div>
                <SortControls />
            </div>

            {/* Quick genre filter chips */}
            <div style={{ marginTop: "var(--space-md)" }}>
                <Suspense fallback={null}>
                    <QuickFilters />
                </Suspense>
            </div>

            {emptyState ? (
                <div style={{
                    padding: "var(--space-xxl) var(--space-md)",
                    textAlign: "center",
                    color: "var(--label-secondary)",
                }}>
                    <div style={{ fontSize: "4rem", marginBottom: "var(--space-lg)" }}>📝</div>
                    <h2 style={{
                        fontSize: "var(--font-size-title2)",
                        fontWeight: 600,
                        marginBottom: "var(--space-sm)",
                        color: "var(--label-primary)",
                    }}>
                        Your watchlist is empty
                    </h2>
                    <p style={{ fontSize: "var(--font-size-body)", lineHeight: 1.5 }}>
                        Movies and shows you want to watch will appear here.
                        <br />
                        Add items from Trakt or search for movies to add.
                    </p>
                    <Link href="/search" style={{
                        display: "inline-block",
                        marginTop: "var(--space-lg)",
                        padding: "var(--space-md) var(--space-xl)",
                        background: "var(--tint)",
                        color: "white",
                        borderRadius: "var(--radius-full)",
                        fontWeight: 600,
                        textDecoration: "none",
                        fontSize: "var(--font-size-body)",
                    }}>
                        Search Movies
                    </Link>
                </div>
            ) : (
                <Suspense fallback={<div style={{ padding: "var(--space-xl)", textAlign: "center" }}>Loading...</div>}>
                    <MovieGrid initialMovies={displayedMovies.slice(0, 50)} allMovies={displayedMovies} sort={sort || "title"} />
                </Suspense>
            )}
        </main>
    );
}
