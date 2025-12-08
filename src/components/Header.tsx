"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import XRayToggle from "./XRayToggle";
import MagneticButton from "./MagneticButton";
import AuthButton from "./AuthButton";

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
                background: "transparent",
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
                borderBottom: "none",
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
                <MagneticButton><AuthButton /></MagneticButton>
                {/* Inline TEST button for debugging */}
                <button style={{ padding: "8px 15px", borderRadius: "20px", background: "#ff0000", color: "#fff", border: "none" }}>
                    INLINE
                </button>
            </div>
        </header>
    );
}

function SyncButton() {
    const [syncing, setSyncing] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const router = useRouter();

    const handleSync = async () => {
        setSyncing(true);
        setStatus("Syncing...");

        try {
            const response = await fetch("/api/sync", { method: "POST" });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Sync failed");
            }

            // Show result with remaining count
            if (data.remaining > 0) {
                setStatus(`+${data.synced} (${data.remaining} left)`);
            } else {
                setStatus(`✓ ${data.total} items`);
            }

            router.refresh();

            setTimeout(() => {
                setSyncing(false);
                // Keep showing remaining count if there are more
                if (data.remaining > 0) {
                    setStatus(`${data.remaining} more`);
                } else {
                    setStatus(null);
                }
            }, 1500);

        } catch (e: any) {
            console.error(e);
            setStatus("Failed");
            alert(`Sync failed: ${e.message}`);
            setTimeout(() => {
                setSyncing(false);
                setStatus(null);
            }, 2000);
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
                background: syncing
                    ? "linear-gradient(90deg, #0a84ff, #30d158)"
                    : "var(--glass-highlight)",
                color: syncing ? "#fff" : "var(--glass-text)",
                border: "none",
                cursor: syncing ? "wait" : "pointer",
                transition: "all 0.3s ease",
                minWidth: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
            }}
        >
            {syncing && (
                <span style={{
                    display: "inline-block",
                    width: "14px",
                    height: "14px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                }} />
            )}
            {status || "Sync"}
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

// Force cache bust Sun Dec  7 22:07:08 -03 2025
