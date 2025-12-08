import Link from "next/link";
import { Suspense } from "react";
import MovieGrid from "@/components/MovieGrid";
import SortControls from "@/components/SortControls";
import QuickFilters from "@/components/QuickFilters";
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
    let pageTitle = "Watchlist";

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
        <main style={{ padding: "0 0 80px 0", minHeight: "100vh" }}>
            <div style={{ padding: "30px 40px 15px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <Link href="/" style={{
                        fontSize: "1.2rem",
                        textDecoration: "none",
                        color: "var(--foreground)",
                        opacity: 0.6,
                        transition: "opacity 0.2s ease"
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
                        {pageTitle}
                    </h1>
                    <span style={{
                        fontSize: "1rem",
                        opacity: 0.6,
                        fontWeight: "400"
                    }}>
                        {uniqueItems.length} {uniqueItems.length === 1 ? "item" : "items"}
                    </span>
                </div>
                <SortControls />
            </div>

            {/* Quick genre filter chips */}
            <div style={{ padding: "0 40px" }}>
                <Suspense fallback={null}>
                    <QuickFilters />
                </Suspense>
            </div>

            {emptyState ? (
                <div style={{
                    padding: "80px 40px",
                    textAlign: "center",
                    color: "var(--foreground)",
                    opacity: 0.6
                }}>
                    <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📝</div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "500", marginBottom: "10px" }}>
                        Your watchlist is empty
                    </h2>
                    <p style={{ fontSize: "1rem" }}>
                        Movies and shows you want to watch will appear here.
                        <br />
                        Add items from Trakt or search for movies to add.
                    </p>
                    <Link href="/search" style={{
                        display: "inline-block",
                        marginTop: "20px",
                        padding: "12px 24px",
                        background: "var(--accent)",
                        color: "white",
                        borderRadius: "25px",
                        fontWeight: "500",
                        textDecoration: "none"
                    }}>
                        Search Movies
                    </Link>
                </div>
            ) : (
                <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>}>
                    <MovieGrid initialMovies={displayedMovies.slice(0, 50)} allMovies={displayedMovies} sort={sort || "title"} />
                </Suspense>
            )}
        </main>
    );
}
