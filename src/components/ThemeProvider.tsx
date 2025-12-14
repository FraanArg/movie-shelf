"use client";

import { useEffect, ReactNode } from "react";

interface ThemeProviderProps {
    children: ReactNode;
    attribute?: string;
    defaultTheme?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
}

export function ThemeProvider({
    children,
    attribute = "data-theme",
    defaultTheme = "dark",
    enableSystem = true,
    disableTransitionOnChange = false
}: ThemeProviderProps) {
    useEffect(() => {
        // Load theme from localStorage on mount
        const saved = localStorage.getItem("movieshelf-settings");
        let theme = defaultTheme;

        if (saved) {
            try {
                const settings = JSON.parse(saved);
                theme = settings.theme || defaultTheme;
            } catch (e) {
                console.error("Failed to parse theme settings", e);
            }
        }

        // Apply theme
        if (theme === "system" && enableSystem) {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.setAttribute(attribute, prefersDark ? "dark" : "light");
        } else if (theme === "system") {
            document.documentElement.setAttribute(attribute, defaultTheme);
        } else {
            document.documentElement.setAttribute(attribute, theme);
        }

        // Listen for system preference changes
        if (enableSystem) {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = (e: MediaQueryListEvent) => {
                const saved = localStorage.getItem("movieshelf-settings");
                if (saved) {
                    try {
                        const settings = JSON.parse(saved);
                        if (settings.theme === "system") {
                            document.documentElement.setAttribute(attribute, e.matches ? "dark" : "light");
                        }
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            };

            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [attribute, defaultTheme, enableSystem]);

    return <>{children}</>;
}

export default ThemeProvider;
