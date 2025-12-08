import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getMovieDetails, getTMDbPosterUrl } from "@/lib/tmdb";
import { getMovieTrailer } from "@/lib/trakt";
import { getMovieMetadata } from "@/lib/omdb";
import TheatricalToggle from "@/components/TheatricalToggle";
import ColorExtractor from "@/components/ColorExtractor";
import SimilarMovies from "@/components/SimilarMovies";
import MovieNotes from "@/components/MovieNotes";

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const traktClientId = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID;
    const omdbKey = process.env.OMDB_API_KEY;

    // Fetch from TMDb (primary)
    const movie = await getMovieDetails(id);

    // Fetch trailer from Trakt
    let trailer = null;
    if (traktClientId) {
        try {
            trailer = await getMovieTrailer(id, traktClientId);
        } catch (e) {
            console.error("Failed to fetch trailer", e);
        }
    }

    // Optionally fetch OMDB for IMDb/RT ratings
    let omdbRatings: { imdb?: string; rt?: string; metascore?: string } = {};
    if (omdbKey) {
        try {
            const omdb = await getMovieMetadata(id, omdbKey);
            if (omdb && omdb.imdbRating !== "N/A") {
                omdbRatings.imdb = omdb.imdbRating;
                const rtEntry = omdb.Ratings?.find((r: any) => r.Source === "Rotten Tomatoes");
                if (rtEntry) omdbRatings.rt = rtEntry.Value;
                if (omdb.Metascore !== "N/A") omdbRatings.metascore = omdb.Metascore;
            }
        } catch (e) {
            // OMDB unavailable, continue without
        }
    }

    if (!movie) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <h1>Movie not found</h1>
                <p style={{ color: "#888", marginBottom: "20px" }}>Unable to load movie details from TMDb</p>
                <Link href="/" style={{ color: "var(--accent)" }}>Back to Shelf</Link>
            </div>
        );
    }

    // Convert YouTube URL to Embed URL
    let embedUrl = null;
    if (trailer) {
        const videoId = trailer.split("v=")?.[1];
        if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
    }

    const posterUrl = getTMDbPosterUrl(movie.poster_path, "w500");
    const backdropUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : posterUrl;

    const directors = movie.credits?.crew
        ?.filter(c => c.job === "Director")
        ?.slice(0, 3)
        .map(c => c.name) || [];

    const cast = movie.credits?.cast?.slice(0, 8) || [];
    const genres = movie.genres?.map(g => g.name).join(", ") || "N/A";
    const runtime = movie.runtime ? `${movie.runtime} min` : "N/A";
    const year = movie.release_date?.split("-")[0] || "N/A";

    return (
        <main style={{ padding: "40px 20px", minHeight: "100vh", maxWidth: "800px", margin: "0 auto" }}>
            {backdropUrl && <ColorExtractor imageUrl={backdropUrl} />}
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
                    ) : posterUrl ? (
                        <Image
                            src={posterUrl}
                            alt={movie.title}
                            fill
                            style={{ objectFit: "contain" }}
                        />
                    ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", color: "#333" }}>🎬</div>
                    )}
                </div>

                <div className="movie-info">
                    <h1 style={{ fontSize: "2.5rem", fontWeight: "700", marginBottom: "10px" }}>{movie.title}</h1>

                    {movie.tagline && (
                        <p style={{ color: "#888", fontStyle: "italic", marginBottom: "15px" }}>{movie.tagline}</p>
                    )}

                    <div style={{ display: "flex", gap: "15px", color: "#888", marginBottom: "20px", flexWrap: "wrap" }}>
                        <span>{year}</span>
                        <span>{runtime}</span>
                        <span>{genres}</span>
                    </div>

                    {/* Ratings Row */}
                    <div style={{ display: "flex", gap: "20px", marginBottom: "25px", flexWrap: "wrap" }}>
                        {/* TMDb Rating (Primary) */}
                        <div style={{
                            background: "linear-gradient(135deg, #01b4e4, #0d253f)",
                            padding: "12px 20px",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}>
                            <span style={{ fontSize: "1.5rem" }}>⭐</span>
                            <div>
                                <div style={{ fontWeight: "700", fontSize: "1.2rem" }}>{movie.vote_average.toFixed(1)}</div>
                                <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>TMDb</div>
                            </div>
                        </div>

                        {/* IMDb Rating */}
                        {omdbRatings.imdb && (
                            <div style={{
                                background: "linear-gradient(135deg, #f5c518, #000)",
                                padding: "12px 20px",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                            }}>
                                <span style={{ fontSize: "1rem", fontWeight: "bold" }}>IMDb</span>
                                <div style={{ fontWeight: "700", fontSize: "1.2rem" }}>{omdbRatings.imdb}</div>
                            </div>
                        )}

                        {/* Rotten Tomatoes */}
                        {omdbRatings.rt && (
                            <div style={{
                                background: "linear-gradient(135deg, #fa320a, #000)",
                                padding: "12px 20px",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                            }}>
                                <span style={{ fontSize: "1.2rem" }}>🍅</span>
                                <div style={{ fontWeight: "700", fontSize: "1.2rem" }}>{omdbRatings.rt}</div>
                            </div>
                        )}

                        {/* Metascore */}
                        {omdbRatings.metascore && (
                            <div style={{
                                background: parseInt(omdbRatings.metascore) >= 60 ? "#6c3" : "#fc3",
                                padding: "12px 20px",
                                borderRadius: "12px",
                                color: "#000",
                            }}>
                                <div style={{ fontWeight: "700", fontSize: "1.2rem" }}>{omdbRatings.metascore}</div>
                                <div style={{ fontSize: "0.7rem" }}>Metascore</div>
                            </div>
                        )}
                    </div>

                    <p style={{ lineHeight: "1.6", fontSize: "1.1rem", color: "#ddd" }}>
                        {movie.overview}
                    </p>

                    {directors.length > 0 && (
                        <div style={{ marginTop: "30px" }}>
                            <h3 style={{ color: "#888", marginBottom: "10px" }}>Director{directors.length > 1 ? "s" : ""}</h3>
                            <p>{directors.join(", ")}</p>
                        </div>
                    )}

                    {/* Cast Grid */}
                    {cast.length > 0 && (
                        <div style={{ marginTop: "30px" }}>
                            <h3 style={{ color: "#888", marginBottom: "15px" }}>Cast</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "15px" }}>
                                {cast.map((actor) => (
                                    <div key={actor.id} style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "10px", textAlign: "center" }}>
                                        <div style={{
                                            width: "50px",
                                            height: "50px",
                                            borderRadius: "50%",
                                            background: actor.profile_path
                                                ? `url(https://image.tmdb.org/t/p/w185${actor.profile_path}) center/cover`
                                                : "#333",
                                            margin: "0 auto 10px auto",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.2rem",
                                            fontWeight: "bold",
                                            color: "#666"
                                        }}>
                                            {!actor.profile_path && actor.name.charAt(0)}
                                        </div>
                                        <span style={{ fontSize: "0.8rem", fontWeight: "500" }}>{actor.name}</span>
                                        {actor.character && (
                                            <div style={{ fontSize: "0.7rem", color: "#888", marginTop: "4px" }}>{actor.character}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Soundtrack Integration */}
                    <div style={{ marginTop: "40px" }}>
                        <h3 style={{ color: "#888", marginBottom: "15px" }}>Soundtrack</h3>
                        <iframe
                            style={{ borderRadius: "12px" }}
                            src={`https://open.spotify.com/embed/search/${encodeURIComponent(movie.title + " soundtrack")}?utm_source=generator`}
                            width="100%"
                            height="152"
                            frameBorder="0"
                            allowFullScreen
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                        ></iframe>
                    </div>

                    {/* User Notes and Rating */}
                    <MovieNotes imdbId={id} />

                    {/* Similar Movies */}
                    <Suspense fallback={
                        <div style={{ marginTop: "40px" }}>
                            <h3 style={{ color: "#888", marginBottom: "15px" }}>Loading recommendations...</h3>
                        </div>
                    }>
                        <SimilarMovies imdbId={id} />
                    </Suspense>
                </div>
            </div>
        </main>
    );
}

