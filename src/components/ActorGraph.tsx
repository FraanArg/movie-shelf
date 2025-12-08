"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { MovieItem } from "@/lib/db";

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

interface ActorGraphProps {
    movies: MovieItem[];
}

interface GraphNode {
    id: string;
    name: string;
    type: "movie" | "actor" | "director";
    val: number;
    img?: string | null;
    connections: number;
    imdbId?: string;
}

interface GraphLink {
    source: string;
    target: string;
}

interface SelectedPerson {
    name: string;
    type: "actor" | "director";
    movies: { title: string; year: string; posterUrl: string | null; imdbId?: string }[];
}

export default function ActorGraph({ movies }: ActorGraphProps) {
    const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] });
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [selectedPerson, setSelectedPerson] = useState<SelectedPerson | null>(null);

    // Filter state
    const [showActors, setShowActors] = useState(true);
    const [showDirectors, setShowDirectors] = useState(true);
    const [minConnections, setMinConnections] = useState(1);

    // Stats
    const [stats, setStats] = useState({
        topActor: { name: "", count: 0 },
        topDirector: { name: "", count: 0 },
        totalConnections: 0,
    });

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight
            });
        }

        // Process Data
        const nodes: GraphNode[] = [];
        const links: GraphLink[] = [];
        const actorMap = new Map<string, GraphNode>();
        const directorMap = new Map<string, GraphNode>();
        const movieMap = new Map<string, GraphNode>();
        const actorMovies = new Map<string, MovieItem[]>();
        const directorMovies = new Map<string, MovieItem[]>();

        movies.forEach(movie => {
            // Add Movie Node
            if (!movieMap.has(movie.id)) {
                const movieNode: GraphNode = {
                    id: `m_${movie.id}`,
                    name: movie.title,
                    type: "movie",
                    val: 8,
                    img: movie.posterUrl,
                    connections: 0,
                    imdbId: movie.imdbId,
                };
                movieMap.set(movie.id, movieNode);
            }

            // Add Director Nodes
            if (showDirectors && movie.Director && movie.Director !== "N/A") {
                const directors = movie.Director.split(", ");
                directors.slice(0, 2).forEach(director => { // Limit to first 2 directors
                    const name = director.trim();
                    if (!name) return;

                    if (!directorMap.has(name)) {
                        const directorNode: GraphNode = {
                            id: `d_${name}`,
                            name,
                            type: "director",
                            val: 5,
                            connections: 0,
                        };
                        directorMap.set(name, directorNode);
                        directorMovies.set(name, []);
                    }

                    directorMovies.get(name)!.push(movie);
                    directorMap.get(name)!.connections++;
                    movieMap.get(movie.id)!.connections++;
                });
            }

            // Add Actor Nodes
            if (showActors && movie.Actors && movie.Actors !== "N/A") {
                const actors = movie.Actors.split(", ");
                actors.slice(0, 4).forEach(actor => { // Limit to first 4 actors
                    const name = actor.trim();
                    if (!name) return;

                    if (!actorMap.has(name)) {
                        const actorNode: GraphNode = {
                            id: `a_${name}`,
                            name,
                            type: "actor",
                            val: 4,
                            connections: 0,
                        };
                        actorMap.set(name, actorNode);
                        actorMovies.set(name, []);
                    }

                    actorMovies.get(name)!.push(movie);
                    actorMap.get(name)!.connections++;
                    movieMap.get(movie.id)!.connections++;
                });
            }
        });

        // Filter by minimum connections and add nodes
        movieMap.forEach(node => {
            if (node.connections >= 1) {
                nodes.push(node);
            }
        });

        if (showDirectors) {
            directorMap.forEach(node => {
                if (node.connections >= minConnections) {
                    nodes.push(node);
                }
            });
        }

        if (showActors) {
            actorMap.forEach(node => {
                if (node.connections >= minConnections) {
                    nodes.push(node);
                }
            });
        }

        // Create links
        const nodeIds = new Set(nodes.map(n => n.id));

        movies.forEach(movie => {
            const movieId = `m_${movie.id}`;
            if (!nodeIds.has(movieId)) return;

            if (showDirectors && movie.Director && movie.Director !== "N/A") {
                movie.Director.split(", ").slice(0, 2).forEach(director => {
                    const directorId = `d_${director.trim()}`;
                    if (nodeIds.has(directorId)) {
                        links.push({ source: directorId, target: movieId });
                    }
                });
            }

            if (showActors && movie.Actors && movie.Actors !== "N/A") {
                movie.Actors.split(", ").slice(0, 4).forEach(actor => {
                    const actorId = `a_${actor.trim()}`;
                    if (nodeIds.has(actorId)) {
                        links.push({ source: actorId, target: movieId });
                    }
                });
            }
        });

        // Calculate stats
        let topActor = { name: "", count: 0 };
        let topDirector = { name: "", count: 0 };

        actorMap.forEach((node, name) => {
            if (node.connections > topActor.count) {
                topActor = { name, count: node.connections };
            }
        });

        directorMap.forEach((node, name) => {
            if (node.connections > topDirector.count) {
                topDirector = { name, count: node.connections };
            }
        });

        setStats({
            topActor,
            topDirector,
            totalConnections: links.length,
        });

        setGraphData({ nodes, links });
    }, [movies, showActors, showDirectors, minConnections]);

    const handleNodeClick = useCallback((node: any) => {
        if (node.type === "movie") {
            // Navigate to movie page
            if (node.imdbId) {
                window.location.href = `/movie/${node.imdbId}`;
            }
        } else {
            // Show person detail panel
            const personMovies = movies.filter(m => {
                if (node.type === "actor" && m.Actors) {
                    return m.Actors.includes(node.name);
                }
                if (node.type === "director" && m.Director) {
                    return m.Director.includes(node.name);
                }
                return false;
            }).map(m => ({
                title: m.title,
                year: m.year,
                posterUrl: m.posterUrl,
                imdbId: m.imdbId,
            }));

            setSelectedPerson({
                name: node.name,
                type: node.type,
                movies: personMovies,
            });
        }
    }, [movies]);

    return (
        <div style={{ display: "flex", height: "100%", gap: "20px" }}>
            {/* Main Graph Area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Filter Controls */}
                <div style={{
                    display: "flex",
                    gap: "15px",
                    padding: "15px 20px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "12px",
                    marginBottom: "15px",
                    flexWrap: "wrap",
                    alignItems: "center",
                }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={showActors}
                            onChange={(e) => setShowActors(e.target.checked)}
                            style={{ width: "18px", height: "18px" }}
                        />
                        <span style={{ fontSize: "0.9rem" }}>⭐ Actors</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={showDirectors}
                            onChange={(e) => setShowDirectors(e.target.checked)}
                            style={{ width: "18px", height: "18px" }}
                        />
                        <span style={{ fontSize: "0.9rem" }}>🎬 Directors</span>
                    </label>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>Min films:</span>
                        <select
                            value={minConnections}
                            onChange={(e) => setMinConnections(parseInt(e.target.value))}
                            style={{
                                padding: "6px 10px",
                                background: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                borderRadius: "8px",
                                color: "var(--foreground)",
                                fontSize: "0.9rem",
                            }}
                        >
                            <option value="1">1+</option>
                            <option value="2">2+</option>
                            <option value="3">3+</option>
                            <option value="5">5+</option>
                        </select>
                    </div>

                    <div style={{ marginLeft: "auto", display: "flex", gap: "20px", fontSize: "0.8rem", opacity: 0.7 }}>
                        <span>🎯 {stats.topActor.name} ({stats.topActor.count} films)</span>
                        <span>🎬 {stats.topDirector.name} ({stats.topDirector.count} films)</span>
                    </div>
                </div>

                {/* Legend */}
                <div style={{
                    display: "flex",
                    gap: "20px",
                    padding: "10px 20px",
                    fontSize: "0.8rem",
                    opacity: 0.8,
                }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffd700" }}></span>
                        Movies
                    </span>
                    {showDirectors && (
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#a855f7" }}></span>
                            Directors
                        </span>
                    )}
                    {showActors && (
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#0a84ff" }}></span>
                            Actors
                        </span>
                    )}
                    <span style={{ marginLeft: "auto", opacity: 0.6 }}>
                        Click nodes for details
                    </span>
                </div>

                {/* Graph */}
                <div
                    ref={containerRef}
                    style={{
                        flex: 1,
                        minHeight: "500px",
                        background: "rgba(0,0,0,0.3)",
                        borderRadius: "16px",
                        overflow: "hidden"
                    }}
                >
                    <ForceGraph2D
                        width={dimensions.width}
                        height={dimensions.height}
                        graphData={graphData}
                        nodeLabel={(node: any) => `${node.name} (${node.connections} connections)`}
                        linkColor={() => "rgba(255,255,255,0.1)"}
                        linkWidth={1}
                        backgroundColor="rgba(0,0,0,0)"
                        onNodeClick={handleNodeClick}
                        nodeCanvasObject={(node: any, ctx, globalScale) => {
                            const size = node.type === "movie" ? 6 : (3 + node.connections * 0.5);
                            const fontSize = Math.max(10 / globalScale, 3);

                            // Node colors by type
                            const colors = {
                                movie: "#ffd700",
                                director: "#a855f7",
                                actor: "#0a84ff",
                            };

                            ctx.beginPath();
                            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                            ctx.fillStyle = colors[node.type as keyof typeof colors];
                            ctx.fill();

                            // Only show labels for nodes with multiple connections or when zoomed in
                            if (node.connections >= 2 || globalScale > 1.5) {
                                ctx.font = `${fontSize}px Inter, sans-serif`;
                                ctx.textAlign = "center";
                                ctx.textBaseline = "middle";
                                ctx.fillStyle = "rgba(255,255,255,0.9)";
                                ctx.fillText(node.name, node.x, node.y + size + 8);
                            }
                        }}
                        nodePointerAreaPaint={(node: any, color, ctx) => {
                            const size = node.type === "movie" ? 8 : (5 + node.connections * 0.5);
                            ctx.fillStyle = color;
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                            ctx.fill();
                        }}
                    />
                </div>
            </div>

            {/* Detail Panel */}
            {selectedPerson && (
                <div style={{
                    width: "320px",
                    background: "var(--glass-bg)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: "16px",
                    border: "1px solid var(--glass-border)",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "100%",
                    overflow: "hidden",
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "15px",
                    }}>
                        <div>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "5px" }}>
                                {selectedPerson.name}
                            </h3>
                            <p style={{
                                fontSize: "0.85rem",
                                color: selectedPerson.type === "director" ? "#a855f7" : "#0a84ff",
                                fontWeight: "500",
                            }}>
                                {selectedPerson.type === "director" ? "🎬 Director" : "⭐ Actor"} • {selectedPerson.movies.length} films
                            </p>
                        </div>
                        <button
                            onClick={() => setSelectedPerson(null)}
                            style={{
                                background: "rgba(255,255,255,0.1)",
                                border: "none",
                                borderRadius: "8px",
                                padding: "8px 12px",
                                color: "var(--foreground)",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{
                        flex: 1,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                    }}
                        className="hide-scrollbar"
                    >
                        {selectedPerson.movies.map((movie, i) => (
                            <Link
                                key={`${movie.title}-${i}`}
                                href={movie.imdbId ? `/movie/${movie.imdbId}` : "#"}
                                style={{
                                    display: "flex",
                                    gap: "12px",
                                    padding: "10px",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: "10px",
                                    textDecoration: "none",
                                    color: "inherit",
                                    transition: "background 0.2s",
                                }}
                            >
                                <div style={{
                                    width: "45px",
                                    height: "67px",
                                    borderRadius: "6px",
                                    overflow: "hidden",
                                    flexShrink: 0,
                                    position: "relative",
                                    background: "rgba(255,255,255,0.1)",
                                }}>
                                    {movie.posterUrl ? (
                                        <Image
                                            src={movie.posterUrl}
                                            alt={movie.title}
                                            fill
                                            style={{ objectFit: "cover" }}
                                            sizes="45px"
                                        />
                                    ) : (
                                        <div style={{
                                            width: "100%",
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "1.2rem",
                                        }}>
                                            🎬
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4 style={{
                                        fontSize: "0.9rem",
                                        fontWeight: "500",
                                        marginBottom: "3px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}>
                                        {movie.title}
                                    </h4>
                                    <p style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                                        {movie.year}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
