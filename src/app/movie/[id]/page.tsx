import Link from "next/link";
import Image from "next/image";
import { getMovieMetadata } from "@/lib/omdb";
import { getMovieTrailer } from "@/lib/trakt";
import TheatricalToggle from "@/components/TheatricalToggle";
import ColorExtractor from "@/components/ColorExtractor";

// Mock function to get Trakt ID details if needed, 
// but for now we might just pass the OMDB ID or use the Trakt ID to lookup.
// Since we don't have a full database, we'll fetch from OMDB again using the ID passed (assuming it's IMDB ID for simplicity in this demo, 
// but in reality we'd need to lookup Trakt -> IMDB).
// For this demo, let's assume the route is /movie/[imdbId] for simplicity.

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const apiKey = process.env.OMDB_API_KEY;
    const traktClientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;

    let movie = null;
    let trailer = null;

    if (apiKey) {
        try {
            // We assume the ID passed is the IMDB ID for now to make it easy to fetch from OMDB
            // In a real app, we'd look up the Trakt ID -> IMDB ID first.
            movie = await getMovieMetadata(id, apiKey);
            if (traktClientId) {
                trailer = await getMovieTrailer(id, traktClientId);
            }
        } catch (e) {
            console.error("Failed to fetch movie details", e);
        }
    }

    if (!movie) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <h1>Movie not found</h1>
                <Link href="/" style={{ color: "var(--accent)" }}>Back to Shelf</Link>
            </div>
        );
    }

    // Convert YouTube URL to Embed URL
    let embedUrl = null;
    if (trailer) {
        const videoId = trailer.split("v=")[1];
        if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
    }

    // Theatrical Mode State (Client Component needed for this, but we are in Server Component)
    // We need to make a client wrapper or just a small client component for the toggle.
    // Let's create a client component for the controls.

    return (
        <main style={{ padding: "40px 20px", minHeight: "100vh", maxWidth: "800px", margin: "0 auto" }}>
            <ColorExtractor imageUrl={movie.Poster} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <Link href="/" style={{ color: "var(--accent)", display: "inline-block" }}>
                    &larr; Back to Shelf
                </Link>
                <TheatricalToggle />
            </div>

            <div style={{ display: "flex", gap: "40px", flexDirection: "column" }}>
                {/* Trailer or Poster */}
                <div
                    className="theatrical-screen"
                    style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "12px", overflow: "hidden", background: "#000", boxShadow: "0 0 50px rgba(0,0,0,0.5)" }}
                >
                    {embedUrl ? (
                        <iframe
                            width="100%"
                            height="100%"
                            src={embedUrl}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : movie.Poster !== "N/A" ? (
                        <Image
                            src={movie.Poster}
                            alt={movie.Title}
                            fill
                            style={{ objectFit: "contain" }}
                        />
                    ) : null}
                </div>

                <div className="movie-info">
                    <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "10px" }}>{movie.Title}</h1>
                    <div style={{ display: "flex", gap: "15px", color: "#888", marginBottom: "20px" }}>
                        <span>{movie.Year}</span>
                        <span>{movie.Runtime}</span>
                        <span>{movie.Genre}</span>
                    </div>

                    <p style={{ lineHeight: "1.6", fontSize: "1.1rem", color: "#ddd" }}>
                        {movie.Plot}
                    </p>

                    <div style={{ marginTop: "30px" }}>
                        <h3 style={{ color: "#888", marginBottom: "10px" }}>Director</h3>
                        <p>{movie.Director}</p>
                    </div>

                    {/* Cast Grid */}
                    <div style={{ marginTop: "30px" }}>
                        <h3 style={{ color: "#888", marginBottom: "15px" }}>Cast</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "15px" }}>
                            {movie.Actors.split(", ").map((actor: string) => (
                                <div key={actor} style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "10px", textAlign: "center" }}>
                                    <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#333", margin: "0 auto 10px auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold", color: "#666" }}>
                                        {actor.charAt(0)}
                                    </div>
                                    <span style={{ fontSize: "0.8rem", fontWeight: "500" }}>{actor}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Soundtrack Integration */}
                    <div style={{ marginTop: "40px" }}>
                        <h3 style={{ color: "#888", marginBottom: "15px" }}>Soundtrack</h3>
                        <iframe
                            style={{ borderRadius: "12px" }}
                            src={`https://open.spotify.com/embed/search/${encodeURIComponent(movie.Title + " soundtrack")}?utm_source=generator`}
                            width="100%"
                            height="152"
                            frameBorder="0"
                            allowFullScreen
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                        ></iframe>
                    </div>
                </div>
            </div>
        </main>
    );
}
