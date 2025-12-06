"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { MovieItem } from "@/lib/db";

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

interface ActorGraphProps {
    movies: MovieItem[];
}

export default function ActorGraph({ movies }: ActorGraphProps) {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight
            });
        }

        // Process Data
        const nodes: any[] = [];
        const links: any[] = [];
        const actorMap = new Map(); // Name -> Node ID
        const movieMap = new Map(); // ID -> Node ID

        movies.forEach(movie => {
            // Add Movie Node
            if (!movieMap.has(movie.id)) {
                const movieNode = { id: `m_${movie.id}`, name: movie.title, type: "movie", val: 10, img: movie.posterUrl };
                nodes.push(movieNode);
                movieMap.set(movie.id, movieNode);
            }

            // Add Actor Nodes
            if (movie.Actors) {
                const actors = movie.Actors.split(", ");
                actors.forEach(actor => {
                    if (!actorMap.has(actor)) {
                        const actorNode = { id: `a_${actor}`, name: actor, type: "actor", val: 5 };
                        nodes.push(actorNode);
                        actorMap.set(actor, actorNode);
                    }

                    // Link Actor to Movie
                    links.push({
                        source: `a_${actor}`,
                        target: `m_${movie.id}`
                    });
                });
            }
        });

        setGraphData({ nodes: nodes as any, links: links as any });
    }, [movies]);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "600px", background: "rgba(0,0,0,0.2)", borderRadius: "20px", overflow: "hidden" }}>
            <ForceGraph2D
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}
                nodeLabel="name"
                nodeAutoColorBy="type"
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={d => 0.005}
                backgroundColor="rgba(0,0,0,0)"
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

                    if (node.type === "movie") {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                        ctx.fill();
                    } else {
                        ctx.fillStyle = 'rgba(10, 132, 255, 0.8)';
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, 3, 0, 2 * Math.PI, false);
                        ctx.fill();
                    }

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = node.type === "movie" ? '#fff' : '#aaa';
                    ctx.fillText(label, node.x, node.y + 8);

                    // If hovered (we can't easily check hover state in canvas object without extra state, 
                    // but let's just draw labels for now)
                }}
            />
        </div>
    );
}
