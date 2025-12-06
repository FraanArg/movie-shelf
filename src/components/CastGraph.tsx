"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

interface GraphData {
    nodes: { id: string, group: number, val: number }[];
    links: { source: string, target: string }[];
}

export default function CastGraph({ data }: { data: GraphData }) {
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight
            });
        }
    }, []);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "600px", background: "#000" }}>
            <ForceGraph2D
                width={dimensions.width}
                height={dimensions.height}
                graphData={data}
                nodeLabel="id"
                nodeColor={node => node.group === 1 ? "#ff0000" : "#007aff"} // Movies red, Actors blue
                nodeRelSize={6}
                linkColor={() => "rgba(255,255,255,0.2)"}
                backgroundColor="#000000"
            />
        </div>
    );
}
