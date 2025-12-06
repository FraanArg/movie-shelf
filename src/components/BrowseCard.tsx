"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface BrowseCardProps {
    label: string;
    icon: ReactNode;
    href: string;
    color: string;
}

export default function BrowseCard({ label, icon, href, color }: BrowseCardProps) {
    return (
        <Link
            href={href}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: color,
                borderRadius: "16px",
                aspectRatio: "16/9",
                textDecoration: "none",
                color: "#fff",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            className="browse-card"
        >
            <div style={{ fontSize: "2.5rem", marginBottom: "10px", zIndex: 2 }}>
                {icon}
            </div>
            <span style={{ fontSize: "1.1rem", fontWeight: "600", zIndex: 2, textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                {label}
            </span>

            {/* Background decoration */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)",
                zIndex: 1
            }} />
        </Link>
    );
}
