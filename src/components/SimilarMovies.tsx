import Link from "next/link";
import Image from "next/image";
import { getSimilarMovies, getRecommendedMovies, getTMDbPosterUrl, TMDbMovie } from "@/lib/tmdb";

interface SimilarMoviesProps {
    imdbId: string;
}

export default async function SimilarMovies({ imdbId }: SimilarMoviesProps) {
    // Try recommendations first, fall back to similar
    let movies = await getRecommendedMovies(imdbId);
    if (movies.length === 0) {
        movies = await getSimilarMovies(imdbId);
    }

    if (movies.length === 0) {
        return null; // Don't render if no similar movies found
    }

    return (
        <div style={{ marginTop: "40px" }}>
            <h3 style={{
                color: "#888",
                marginBottom: "20px",
                fontSize: "1rem",
                fontWeight: "600",
                letterSpacing: "1px",
                textTransform: "uppercase",
            }}>
                Movies Like This
            </h3>
            <div style={{
                display: "flex",
                gap: "16px",
                overflowX: "auto",
                paddingBottom: "20px",
            }}
                className="hide-scrollbar"
            >
                {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </div>
    );
}

function MovieCard({ movie }: { movie: TMDbMovie }) {
    const posterUrl = getTMDbPosterUrl(movie.poster_path, "w342");
    const year = movie.release_date?.split("-")[0] || "N/A";

    return (
        <div
            style={{
                flexShrink: 0,
                width: "140px",
                cursor: "pointer",
            }}
        >
            <div style={{
                position: "relative",
                aspectRatio: "2/3",
                borderRadius: "10px",
                overflow: "hidden",
                background: "rgba(255,255,255,0.05)",
                marginBottom: "10px",
            }}>
                {posterUrl ? (
                    <Image
                        src={posterUrl}
                        alt={movie.title}
                        fill
                        sizes="140px"
                        style={{
                            objectFit: "cover",
                            transition: "transform 0.3s ease",
                        }}
                        loading="lazy"
                    />
                ) : (
                    <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#333",
                        fontSize: "2rem",
                    }}>
                        🎬
                    </div>
                )}

                {/* Rating badge */}
                {movie.vote_average > 0 && (
                    <div style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "rgba(0,0,0,0.8)",
                        color: movie.vote_average >= 7 ? "#fbbf24" : "#fff",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}>
                        ⭐ {movie.vote_average.toFixed(1)}
                    </div>
                )}
            </div>

            <div style={{
                fontWeight: "600",
                fontSize: "0.85rem",
                lineHeight: "1.2",
                marginBottom: "4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
            }}>
                {movie.title}
            </div>
            <div style={{
                color: "#666",
                fontSize: "0.75rem",
            }}>
                {year}
            </div>
        </div>
    );
}
