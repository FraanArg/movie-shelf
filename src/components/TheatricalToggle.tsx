"use client";

import { useState, useEffect } from "react";

export default function TheatricalToggle() {
    const [isTheatrical, setIsTheatrical] = useState(false);

    useEffect(() => {
        if (isTheatrical) {
            document.body.classList.add("theatrical-mode");
        } else {
            document.body.classList.remove("theatrical-mode");
        }
    }, [isTheatrical]);

    return (
        <button
            onClick={() => setIsTheatrical(!isTheatrical)}
            style={{
                background: "transparent",
                border: "1px solid var(--accent)",
                color: "var(--accent)",
                padding: "5px 15px",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "5px"
            }}
        >
            {isTheatrical ? "💡 Lights On" : "🍿 Lights Out"}
        </button>
    );
}
