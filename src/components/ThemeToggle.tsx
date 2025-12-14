"use client";

import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [theme, setThemeState] = useState<"light" | "dark">("dark");
    const [mounted, setMounted] = useState(false);

    // Load current theme on mount
    useEffect(() => {
        setMounted(true);
        const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark" || "dark";
        setThemeState(currentTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setThemeState(newTheme);

        // Apply to document
        document.documentElement.setAttribute("data-theme", newTheme);

        // Save to settings in localStorage
        try {
            const saved = localStorage.getItem("movieshelf-settings");
            const settings = saved ? JSON.parse(saved) : {};
            settings.theme = newTheme;
            localStorage.setItem("movieshelf-settings", JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save theme", e);
        }
    };

    if (!mounted) return null;

    return (
        <button
            onClick={toggleTheme}
            style={{
                background: "var(--fill-tertiary)",
                border: "1px solid var(--separator)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--label-primary)",
                transition: "background 0.2s ease, transform 0.2s ease",
            }}
            aria-label="Toggle Theme"
        >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
