"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { label: "Library", href: "/", icon: "📚" },
    { label: "Watchlist", href: "/watchlist", icon: "📝" },
    { label: "Watching", href: "/watching", icon: "📺" },
    { label: "Stats", href: "/profile", icon: "📊" },
    { label: "Search", href: "/search", icon: "🔍" },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "8px 10px",
            paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
            display: "none", // Hidden by default, shown on mobile via CSS
        }}
            className="bottom-nav"
        >
            <div style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                maxWidth: "500px",
                margin: "0 auto",
            }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "4px",
                                padding: "8px 12px",
                                borderRadius: "12px",
                                textDecoration: "none",
                                color: isActive ? "var(--accent)" : "rgba(255, 255, 255, 0.6)",
                                background: isActive ? "rgba(var(--accent-rgb), 0.15)" : "transparent",
                                transition: "all 0.2s ease",
                                minWidth: "60px",
                            }}
                        >
                            <span style={{ fontSize: "1.3rem" }}>{item.icon}</span>
                            <span style={{
                                fontSize: "0.65rem",
                                fontWeight: isActive ? "600" : "400",
                                letterSpacing: "0.3px",
                            }}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
