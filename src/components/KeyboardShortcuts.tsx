"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KeyboardShortcuts() {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // "/" - Focus search
            if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                // Dispatch custom event to open search overlay
                window.dispatchEvent(new CustomEvent("open-search"));
            }

            // "r" - Random movie
            if (e.key === "r" && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                fetch("/api/random")
                    .then(res => res.json())
                    .then(data => {
                        if (data.imdbId) {
                            router.push(`/movie/${data.imdbId}`);
                        }
                    });
            }

            // "s" - Sync
            if (e.key === "s" && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                fetch("/api/sync", { method: "POST" })
                    .then(() => router.refresh());
            }

            // "h" or "Home" - Go home
            if (e.key === "h" && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                router.push("/");
            }

            // "Escape" - Close modals/overlays and go back
            if (e.key === "Escape") {
                window.dispatchEvent(new CustomEvent("close-overlays"));
            }

            // "?" - Show keyboard shortcuts help
            if (e.key === "?" && e.shiftKey) {
                e.preventDefault();
                alert(`⌨️ Keyboard Shortcuts:

/ - Search
r - Random movie
s - Sync library
h - Go home
Esc - Close overlays
? - Show this help`);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    return null; // This component doesn't render anything
}
