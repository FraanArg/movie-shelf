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
                        Currently Watching
                    </h1>
                    <span style={{
                        fontSize: "var(--font-size-subhead)",
                        color: "var(--label-secondary)",
                    }}>
                        {watchingShows.length} {watchingShows.length === 1 ? "show" : "shows"}
                    </span>
                </div>
            </div>

            {emptyState ? (
                <div style={{
                    padding: "var(--space-xxl) var(--space-md)",
                    textAlign: "center",
                    color: "var(--label-secondary)",
                }}>
                    <div style={{ fontSize: "4rem", marginBottom: "var(--space-lg)" }}>📺</div>
                    <h2 style={{
                        fontSize: "var(--font-size-title2)",
                        fontWeight: 600,
                        marginBottom: "var(--space-sm)",
                        color: "var(--label-primary)",
                    }}>
                        {errorMessage || "No shows in progress"}
                    </h2>
                    <p style={{ fontSize: "var(--font-size-body)", lineHeight: 1.5 }}>
                        {!token ? (
                            <>Connect to Trakt from the home page to see your progress.</>
                        ) : (
                            <>Shows you&apos;ve started but not finished will appear here.</>
                        )}
                    </p>
                </div>
            ) : (
                <div style={{ marginTop: "var(--space-lg)" }}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 350px), 1fr))",
                        gap: "var(--space-md)",
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
    const hoursLeft = Math.round(episodesLeft * 0.75);
    const hasDetailLink = !!show.ids?.imdb;

    const CardContent = (
        <div style={{
            display: "flex",
            gap: "var(--space-md)",
            padding: "var(--space-md)",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-lg)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            cursor: hasDetailLink ? "pointer" : "default",
        }}
            className={hasDetailLink ? "hover-lift" : ""}
        >
            {/* Poster */}
            <div style={{
                width: "80px",
                height: "120px",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                flexShrink: 0,
                position: "relative",
                background: "var(--fill-tertiary)",
            }}>
                {posterUrl ? (
                    <Image
                        src={posterUrl}
                        alt={show.title}
                        fill
                        style={{ objectFit: "cover" }}
                        sizes="80px"
                    />
                ) : (
                    <div style={{
                        width: "100%",
                        height: "100%",
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
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                <div>
                    <h3 style={{
                        fontSize: "var(--font-size-headline)",
                        fontWeight: 600,
                        marginBottom: "var(--space-xxs)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}>
                        {show.title}
                    </h3>
                    <p style={{
                        fontSize: "var(--font-size-footnote)",
                        color: "var(--label-secondary)",
                        marginBottom: "var(--space-sm)"
                    }}>
                        {show.year}
                    </p>
                </div>

                {/* Progress bar */}
                <div>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "var(--space-xs)",
                        fontSize: "var(--font-size-caption1)",
                    }}>
                        <span style={{ color: "var(--label-secondary)" }}>
                            {progress.completed} / {progress.aired} episodes
                        </span>
                        <span style={{ color: "var(--tint)", fontWeight: 600 }}>
                            {progress.percent.toFixed(0)}%
                        </span>
                    </div>
                    <div style={{
                        height: "6px",
                        background: "var(--fill-tertiary)",
                        borderRadius: "var(--radius-full)",
                        overflow: "hidden",
                    }}>
                        <div style={{
                            width: `${progress.percent}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, var(--tint), var(--tint-green))",
                            borderRadius: "var(--radius-full)",
                            transition: "width 0.3s ease",
                        }} />
                    </div>
                </div>

                {/* Time remaining */}
                {episodesLeft > 0 && (
                    <div style={{
                        marginTop: "var(--space-sm)",
                        padding: "var(--space-xs) var(--space-sm)",
                        background: "var(--fill-quaternary)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "var(--font-size-caption1)",
                        color: "var(--label-secondary)",
                    }}>
                        ⏱️ {episodesLeft} episodes left • ~{hoursLeft}h to finish
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
