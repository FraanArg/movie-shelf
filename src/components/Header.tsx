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
    const [progress, setProgress] = useState<{ percent: number; message: string } | null>(null);
    const router = useRouter();

    const handleSync = async () => {
        setSyncing(true);
        setProgress({ percent: 0, message: "Starting sync..." });

        try {
            const response = await fetch("/api/sync", { method: "POST" });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Sync failed");
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response stream");

            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value);
                const lines = text.split("\n\n").filter(line => line.startsWith("data: "));

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line.replace("data: ", ""));

                        if (data.error) {
                            throw new Error(data.error);
                        }

                        if (data.done) {
                            setProgress({ percent: 100, message: `Done! Synced ${data.count} items` });
                            setTimeout(() => {
                                router.refresh();
                                setSyncing(false);
                                setProgress(null);
                            }, 1500);
                            return;
                        }

                        if (data.stage === "enrich") {
                            // Show item count progress for enrichment stage
                            const enrichPercent = 25 + Math.round((data.current / data.total) * 70);
                            setProgress({ percent: enrichPercent, message: data.message || `${data.current}/${data.total}` });
                        } else {
                            setProgress({ percent: data.percent || 0, message: data.message || "Syncing..." });
                        }
                    } catch (e) {
                        // Skip unparseable lines
                    }
                }
            }
        } catch (e: any) {
            console.error(e);
            alert(`Sync failed: ${e.message}`);
            setSyncing(false);
            setProgress(null);
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
                background: syncing ? "linear-gradient(90deg, #333, #555)" : "var(--glass-highlight)",
                color: "var(--glass-text)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                opacity: syncing ? 0.9 : 1,
                position: "relative",
                minWidth: syncing ? "150px" : "auto",
                overflow: "hidden",
            }}
        >
            {syncing && progress && (
                <div style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${progress.percent}%`,
                    background: "linear-gradient(90deg, #0a84ff, #30d158)",
                    transition: "width 0.3s ease",
                    borderRadius: "20px",
                }} />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>
                {syncing && progress ? `${progress.percent}%` : "Sync"}
            </span>
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
