"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import XRayToggle from "./XRayToggle";
import MagneticButton from "./MagneticButton";

export default function Header() {
    const pathname = usePathname();

    const navItems = [
        { label: "Library", href: "/" },
        { label: "Stats", href: "/profile" },
        { label: "Connections", href: "/connections" },
        { label: "Search", href: "/search" },
    ];

    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "15px 30px",
                background: "transparent", // Fully transparent to let backdrop show
                backdropFilter: "none", // Handled by global glass classes if needed, but header should be clean
                WebkitBackdropFilter: "none",
                borderBottom: "none", // Cleaner look
            }}
        >
            <div style={{ fontWeight: "700", fontSize: "1.2rem", letterSpacing: "-0.5px" }}>
                Movie Shelf
            </div>

            <nav className="liquid-glass" style={{ display: "flex", gap: "10px", padding: "5px", borderRadius: "35px" }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                padding: "10px 24px",
                                borderRadius: "30px",
                                fontSize: "0.95rem",
                                fontWeight: "500",
                                textDecoration: "none",
                                color: isActive ? "var(--glass-text)" : "var(--glass-text-inactive)",
                                background: isActive ? "var(--glass-highlight)" : "transparent",
                                boxShadow: isActive ? "inset 0 1px 0 0 var(--glass-border)" : "none",
                                transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                            }}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <MagneticButton><ShuffleButton /></MagneticButton>
                <MagneticButton><SyncButton /></MagneticButton>
                <MagneticButton><XRayToggle /></MagneticButton>
                <MagneticButton><ThemeToggle /></MagneticButton>
            </div>
        </header>
    );
}

function SyncButton() {
    const [syncing, setSyncing] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch("/api/sync", { method: "POST" });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Sync failed");
            }
            const data = await res.json();
            console.log("Synced items:", data.count);
            router.refresh(); // Refresh to show new data from local DB
        } catch (e: any) {
            console.error(e);
            alert(`Sync failed: ${e.message}`);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <button
            onClick={handleSync}
            disabled={syncing}
            style={{
                padding: "8px 15px",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "500",
                background: "var(--glass-highlight)",
                color: "var(--glass-text)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                opacity: syncing ? 0.7 : 1,
            }}
        >
            {syncing ? "Syncing..." : "Sync"}
        </button>
    );
}

function ShuffleButton() {
    const [shuffling, setShuffling] = useState(false);
    const router = useRouter();

    const handleShuffle = async () => {
        setShuffling(true);
        try {
            const res = await fetch("/api/random");
            const data = await res.json();
            if (data.id) {
                router.push(`/movie/${data.imdbId || data.id}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setShuffling(false);
        }
    };

    return (
        <button
            onClick={handleShuffle}
            disabled={shuffling}
            style={{
                padding: "8px 15px",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "500",
                background: "linear-gradient(45deg, #ff00cc, #333399)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                opacity: shuffling ? 0.7 : 1,
                marginRight: "10px"
            }}
        >
            {shuffling ? "🎲 ..." : "🎲 Shuffle"}
        </button>
    );
}
