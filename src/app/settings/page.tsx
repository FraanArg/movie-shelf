"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Library, Shuffle, Moon, Sun, Info } from "lucide-react";
import GroupedSection, { GroupedRow } from "@/components/GroupedSection";

interface Settings {
    defaultSort: string;
    defaultView: string;
    theme: "system" | "light" | "dark";
}

const DEFAULT_SETTINGS: Settings = {
    defaultSort: "title",
    defaultView: "grid",
    theme: "system",
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [mounted, setMounted] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("movieshelf-settings");
        if (saved) {
            try {
                const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
                setSettings(parsed);
                applyTheme(parsed.theme);
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
    }, []);

    // Apply theme to document
    const applyTheme = (theme: Settings["theme"]) => {
        if (theme === "system") {
            // Check system preference
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
        } else {
            document.documentElement.setAttribute("data-theme", theme);
        }
    };

    // Save settings to localStorage and apply theme
    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem("movieshelf-settings", JSON.stringify(newSettings));

        // Apply theme immediately if it changed
        if (key === "theme") {
            applyTheme(value as Settings["theme"]);
        }
    };

    const sortOptions = [
        { label: "A-Z (Alphabetical)", value: "title" },
        { label: "Year (Newest First)", value: "year" },
        { label: "Recently Added", value: "date" },
        { label: "Rating (Highest First)", value: "rating" },
        { label: "🎲 Random", value: "random" },
    ];

    const viewOptions = [
        { label: "Grid", value: "grid" },
        { label: "Shelf (Spine View)", value: "spine" },
    ];

    const themeOptions = [
        { label: "System", value: "system" },
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
    ];

    if (!mounted) {
        return (
            <main style={{
                padding: "var(--space-xl) var(--space-md)",
                paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
                minHeight: "100vh",
                maxWidth: "600px",
                margin: "0 auto",
            }}>
                <div style={{ height: "200px", background: "var(--fill-tertiary)", borderRadius: "var(--radius-lg)" }} />
            </main>
        );
    }

    return (
        <main style={{
            padding: "var(--space-xl) var(--space-md)",
            paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
            minHeight: "100vh",
            maxWidth: "600px",
            margin: "0 auto",
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
                marginBottom: "var(--space-xl)",
            }}>
                <Link
                    href="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "44px",
                        height: "44px",
                        borderRadius: "var(--radius-full)",
                        color: "var(--tint)",
                        textDecoration: "none",
                    }}
                >
                    <ChevronLeft size={24} />
                </Link>
                <h1
                    className="large-title"
                    style={{
                        fontSize: "var(--font-size-largetitle)",
                        fontWeight: 700,
                        color: "var(--label-primary)",
                        margin: 0,
                        fontFamily: "var(--font-system)",
                    }}
                >
                    Settings
                </h1>
            </div>

            {/* Library Section */}
            <GroupedSection title="Library">
                <div style={{ padding: "var(--space-md)" }}>
                    <label style={{
                        display: "block",
                        fontSize: "var(--font-size-body)",
                        color: "var(--label-primary)",
                        marginBottom: "var(--space-sm)",
                    }}>
                        Default Sort Order
                    </label>
                    <select
                        value={settings.defaultSort}
                        onChange={(e) => updateSetting("defaultSort", e.target.value)}
                        style={{
                            width: "100%",
                            padding: "var(--space-sm) var(--space-md)",
                            fontSize: "var(--font-size-body)",
                            fontFamily: "var(--font-system)",
                            background: "var(--fill-tertiary)",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            color: "var(--label-primary)",
                            cursor: "pointer",
                        }}
                    >
                        {sortOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <p style={{
                        fontSize: "var(--font-size-footnote)",
                        color: "var(--label-tertiary)",
                        marginTop: "var(--space-sm)",
                    }}>
                        This will be the default sort when you open the app
                    </p>
                </div>

                <div style={{ height: "1px", background: "var(--separator)" }} />

                <div style={{ padding: "var(--space-md)" }}>
                    <label style={{
                        display: "block",
                        fontSize: "var(--font-size-body)",
                        color: "var(--label-primary)",
                        marginBottom: "var(--space-sm)",
                    }}>
                        Default View
                    </label>
                    <select
                        value={settings.defaultView}
                        onChange={(e) => updateSetting("defaultView", e.target.value)}
                        style={{
                            width: "100%",
                            padding: "var(--space-sm) var(--space-md)",
                            fontSize: "var(--font-size-body)",
                            fontFamily: "var(--font-system)",
                            background: "var(--fill-tertiary)",
                            border: "none",
                            borderRadius: "var(--radius-sm)",
                            color: "var(--label-primary)",
                            cursor: "pointer",
                        }}
                    >
                        {viewOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </GroupedSection>

            {/* Appearance Section */}
            <GroupedSection title="Appearance">
                <div style={{ padding: "var(--space-md)" }}>
                    <label style={{
                        display: "block",
                        fontSize: "var(--font-size-body)",
                        color: "var(--label-primary)",
                        marginBottom: "var(--space-sm)",
                    }}>
                        Theme
                    </label>
                    <div style={{
                        display: "flex",
                        gap: "var(--space-sm)",
                    }}>
                        {themeOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => updateSetting("theme", opt.value as Settings["theme"])}
                                style={{
                                    flex: 1,
                                    padding: "var(--space-sm) var(--space-md)",
                                    fontSize: "var(--font-size-subhead)",
                                    fontFamily: "var(--font-system)",
                                    background: settings.theme === opt.value ? "var(--tint)" : "var(--fill-tertiary)",
                                    border: "none",
                                    borderRadius: "var(--radius-sm)",
                                    color: settings.theme === opt.value ? "white" : "var(--label-primary)",
                                    cursor: "pointer",
                                    fontWeight: settings.theme === opt.value ? 600 : 400,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </GroupedSection>

            {/* About Section */}
            <GroupedSection title="About">
                <GroupedRow
                    icon={<Info size={16} />}
                    label="Version"
                    value="1.0.0"
                />
                <GroupedRow
                    icon={<Library size={16} />}
                    label="Movie Shelf"
                    value="Made with ❤️"
                />
            </GroupedSection>

            {/* Reset */}
            <GroupedSection>
                <button
                    onClick={() => {
                        localStorage.removeItem("movieshelf-settings");
                        setSettings(DEFAULT_SETTINGS);
                    }}
                    style={{
                        width: "100%",
                        padding: "var(--space-md)",
                        fontSize: "var(--font-size-body)",
                        fontFamily: "var(--font-system)",
                        background: "transparent",
                        border: "none",
                        color: "var(--tint-red)",
                        cursor: "pointer",
                        textAlign: "center",
                    }}
                >
                    Reset All Settings
                </button>
            </GroupedSection>
        </main>
    );
}
