"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Client component that checks for default sort/view settings in localStorage
 * and redirects to apply them if no sort/view params are set
 */
export default function DefaultSortRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasRun = useRef(false);

    useEffect(() => {
        // Only run once on initial page load
        if (hasRun.current) return;
        hasRun.current = true;

        // Check if sort or view params are already set
        const currentSort = searchParams.get("sort");
        const currentView = searchParams.get("view");

        // If params are already set, don't override
        if (currentSort || currentView) return;

        // Load settings from localStorage
        const saved = localStorage.getItem("movieshelf-settings");
        if (!saved) return;

        try {
            const settings = JSON.parse(saved);
            const params = new URLSearchParams();

            if (settings.defaultSort && settings.defaultSort !== "title") {
                params.set("sort", settings.defaultSort);
            }
            if (settings.defaultView && settings.defaultView !== "grid") {
                params.set("view", settings.defaultView);
            }

            // Only redirect if we have params to set
            if (params.toString()) {
                router.replace(`/?${params.toString()}`);
            }
        } catch (e) {
            console.error("Failed to parse settings", e);
        }
    }, [router, searchParams]);

    return null; // This component renders nothing
}
