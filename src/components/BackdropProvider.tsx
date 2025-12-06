"use client";

import React, { createContext, useContext, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";

interface BackdropContextType {
    setBackdrop: (url: string | null) => void;
    backdrop: string | null;
}

const BackdropContext = createContext<BackdropContextType | undefined>(undefined);

export function useBackdrop() {
    const context = useContext(BackdropContext);
    if (!context) {
        throw new Error("useBackdrop must be used within a BackdropProvider");
    }
    return context;
}

export default function BackdropProvider({ children }: { children: React.ReactNode }) {
    const [backdrop, setBackdrop] = useState<string | null>(null);
    const { theme } = useTheme();
    const isLight = theme === "light";

    // Debounce backdrop changes for performance
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const setBackdropDebounced = (url: string | null) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setBackdrop(url), 50);
    };

    return (
        <BackdropContext.Provider value={{ backdrop, setBackdrop: setBackdropDebounced }}>
            {/* Fixed Background Layer - Simplified for performance */}
            <div style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: -1,
                overflow: "hidden",
                background: "var(--background-gradient)"
            }}>
                <AnimatePresence mode="popLayout">
                    {backdrop && (
                        <motion.div
                            key={backdrop}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.15 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            style={{
                                position: "absolute",
                                top: "-10%", left: "-10%", right: "-10%", bottom: "-10%",
                                backgroundImage: `url(${backdrop})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                filter: isLight ? "blur(60px) brightness(1.2)" : "blur(60px) brightness(0.3)",
                                willChange: "opacity",
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Simple gradient overlay */}
                <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: isLight
                        ? "linear-gradient(to bottom, rgba(245,245,247,0.8) 0%, rgba(245,245,247,0.95) 100%)"
                        : "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
                    pointerEvents: "none"
                }} />
            </div>

            {children}
        </BackdropContext.Provider>
    );
}
