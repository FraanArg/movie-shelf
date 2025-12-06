"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={{
                background: "var(--glass-highlight)",
                border: "1px solid var(--glass-border)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--foreground)",
                backdropFilter: "blur(10px)",
            }}
            aria-label="Toggle Theme"
        >
            {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
}
