"use client";

import { useEffect, useState } from "react";
import { getDB, MovieItem } from "@/lib/db"; // We can't use server actions directly in client component for initial render easily without props
// Actually, let's just make it accept items as props or fetch via API.
// For simplicity, let's assume we pass items or fetch them.
// I'll make it fetch from a new API route or just use the existing sync one?
// Let's make it a server component that fetches data? No, it needs animation.
// Client component that takes initial data.

import Image from "next/image";

export default function Marquee({ items }: { items: any[] }) {
    return (
        <div style={{
            width: "100%",
            background: "#111",
            borderTop: "4px solid #333",
            borderBottom: "4px solid #333",
            padding: "20px 0",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 0 50px rgba(0,0,0,0.8)",
            marginBottom: "40px"
        }}>
            {/* Lights Top */}
            <div className="marquee-lights top" />

            <div style={{
                display: "flex",
                gap: "40px",
                animation: "scrollLeft 30s linear infinite",
                width: "max-content",
                paddingLeft: "100%" // Start off-screen
            }}>
                {items.map((item, i) => (
                    <div key={i} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                        opacity: 0.8
                    }}>
                        <div style={{
                            width: "60px",
                            height: "90px",
                            position: "relative",
                            borderRadius: "4px",
                            overflow: "hidden"
                        }}>
                            <Image
                                src={item.posterUrl || "/placeholder.jpg"}
                                alt={item.title}
                                fill
                                style={{ objectFit: "cover" }}
                            />
                        </div>
                        <span style={{
                            fontFamily: "var(--font-oswald)",
                            fontSize: "1.5rem",
                            textTransform: "uppercase",
                            color: "#ffcc00",
                            textShadow: "0 0 10px rgba(255, 204, 0, 0.5)",
                            whiteSpace: "nowrap"
                        }}>
                            {item.title}
                        </span>
                        <span style={{ color: "#555" }}>★</span>
                    </div>
                ))}
            </div>

            {/* Lights Bottom */}
            <div className="marquee-lights bottom" />

            <style jsx>{`
                .marquee-lights {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 4px;
                    display: flex;
                    justify-content: space-around;
                }
                .marquee-lights.top { top: 2px; }
                .marquee-lights.bottom { bottom: 2px; }
                
                .marquee-lights::before {
                    content: '..........................................................................................';
                    font-size: 20px;
                    letter-spacing: 10px;
                    color: rgba(255, 255, 200, 0.5);
                    text-shadow: 0 0 5px rgba(255, 255, 200, 0.8);
                    white-space: nowrap;
                }

                @keyframes scrollLeft {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
}
