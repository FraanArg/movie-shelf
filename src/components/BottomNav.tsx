"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, Play, BarChart3, Search } from "lucide-react";

const navItems = [
    { label: "Library", href: "/", icon: Home },
    { label: "Watchlist", href: "/watchlist", icon: List },
    { label: "Watching", href: "/watching", icon: Play },
    { label: "Stats", href: "/profile", icon: BarChart3 },
    { label: "Search", href: "/search", icon: Search },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav
            className="bottom-nav"
            style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                background: "var(--glass-bg)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                borderTop: "1px solid var(--separator)",
                paddingTop: "var(--space-sm)",
                paddingBottom: "calc(var(--space-sm) + env(safe-area-inset-bottom))",
                paddingLeft: "var(--space-sm)",
                paddingRight: "var(--space-sm)",
                display: "none", // Hidden by default, shown on mobile via CSS
            }}
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
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "var(--space-xxs)",
                                padding: "var(--space-xs) var(--space-md)",
                                borderRadius: "var(--radius-md)",
                                textDecoration: "none",
                                color: isActive ? "var(--tint)" : "var(--label-secondary)",
                                transition: "color 0.2s ease",
                                minWidth: "64px",
                                minHeight: "44px", // Minimum touch target
                            }}
                        >
                            <Icon
                                size={24}
                                strokeWidth={isActive ? 2 : 1.5}
                                style={{
                                    transition: "transform 0.2s ease",
                                    transform: isActive ? "scale(1.05)" : "scale(1)",
                                }}
                            />
                            <span style={{
                                fontSize: "var(--font-size-caption2)",
                                fontWeight: isActive ? "600" : "400",
                                letterSpacing: "0.2px",
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
