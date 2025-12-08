import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { getShowsInProgress, TraktShow } from "@/lib/trakt";
import { getDB, MovieItem } from "@/lib/db";

interface ShowWithProgress {
    show: TraktShow;
    progress: { aired: number; completed: number; percent: number };
    posterUrl?: string;
}

export default async function WatchingPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("trakt_access_token")?.value;
    const clientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;

    let watchingShows: ShowWithProgress[] = [];
    let errorMessage = "";

    // Try to fetch from Trakt API first
    if (token && clientId) {
        try {
            const inProgress = await getShowsInProgress(token, clientId);

            // Get poster URLs from our DB
            let dbItems: MovieItem[] = [];
            try {
                dbItems = await getDB() || [];
            } catch (e) {
                console.error("Failed to read DB:", e);
            }

            // Map to our format with poster URLs
            watchingShows = inProgress.map(item => {
                const dbMatch = dbItems.find(
                    db => db.imdbId === item.show.ids?.imdb ||
                        db.title?.toLowerCase() === item.show.title?.toLowerCase()
                );
                return {
                    ...item,
                    posterUrl: dbMatch?.posterUrl || undefined,
                };
            });
        } catch (e) {
            console.error("Failed to fetch shows in progress:", e);
            errorMessage = "Could not load progress data from Trakt";
        }
    } else {
        errorMessage = "Connect to Trakt to see your shows in progress";
    }

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
                        {errorMessage || "No shows in progress"}
                    </h2>
                    <p style={{ fontSize: "1rem" }}>
                        {!token ? (
                            <>Connect to Trakt from the home page to see your progress.</>
                        ) : (
                            <>Shows you&apos;ve started but not finished will appear here.</>
                        )}
                    </p>
                </div>
            ) : (
                <div style={{ padding: "20px 40px" }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                        gap: "20px",
                    }}>
                        {watchingShows.map((item) => (
                            <ShowProgressCard
                                key={item.show.ids?.imdb || item.show.title}
                                show={item.show}
                                progress={item.progress}
                                posterUrl={item.posterUrl}
                            />
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}

function ShowProgressCard({
    show,
    progress,
    posterUrl
}: {
    show: TraktShow;
    progress: { aired: number; completed: number; percent: number };
    posterUrl?: string;
}) {
    const episodesLeft = progress.aired - progress.completed;
    const hoursLeft = Math.round(episodesLeft * 0.75); // ~45min per episode
    const hasDetailLink = !!show.ids?.imdb;

    const CardContent = (
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
            cursor: hasDetailLink ? "pointer" : "default",
        }}
            className={hasDetailLink ? "hover-lift" : ""}
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
                {posterUrl ? (
                    <Image
                        src={posterUrl}
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
                        {show.year}
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
                            {progress.completed} / {progress.aired} episodes
                        </span>
                        <span style={{ color: "var(--accent)", fontWeight: "600" }}>
                            {progress.percent.toFixed(0)}%
                        </span>
                    </div>
                    <div style={{
                        height: "6px",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "3px",
                        overflow: "hidden",
                    }}>
                        <div style={{
                            width: `${progress.percent}%`,
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
    );

    if (hasDetailLink) {
        return (
            <Link
                href={`/movie/${show.ids?.imdb}`}
                style={{ textDecoration: "none", color: "inherit" }}
            >
                {CardContent}
            </Link>
        );
    }

    return CardContent;
}
