"use client";

import { useXRay } from "./XRayProvider";
import { Flashlight } from "lucide-react";

export default function XRayToggle() {
    const { isXRayEnabled, toggleXRay } = useXRay();

    return (
        <button
            onClick={toggleXRay}
            style={{
                background: isXRayEnabled ? "var(--accent)" : "var(--glass-highlight)",
                border: "1px solid var(--glass-border)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: isXRayEnabled ? "#fff" : "var(--glass-text)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                boxShadow: isXRayEnabled ? "0 0 15px var(--accent)" : "none"
            }}
            aria-label="Toggle X-Ray Mode"
        >
            <Flashlight size={20} />
        </button>
    );
}
