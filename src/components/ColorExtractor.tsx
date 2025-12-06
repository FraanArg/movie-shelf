"use client";

import { useEffect } from "react";
import ColorThief from "colorthief";

export default function ColorExtractor({ imageUrl }: { imageUrl: string }) {
    useEffect(() => {
        if (!imageUrl || imageUrl === "N/A") return;

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;

        img.onload = () => {
            const colorThief = new ColorThief();
            try {
                const color = colorThief.getColor(img);
                const palette = colorThief.getPalette(img, 2);

                const primary = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                const secondary = palette && palette[1] ? `rgb(${palette[1][0]}, ${palette[1][1]}, ${palette[1][2]})` : primary;

                document.documentElement.style.setProperty("--accent", primary);
                document.documentElement.style.setProperty("--glow", secondary);

                // Add a glow effect to the body background
                document.body.style.background = `radial-gradient(circle at 50% 0%, ${primary}22 0%, #000 100%)`;

            } catch (e) {
                console.error("Error extracting color", e);
            }
        };
    }, [imageUrl]);

    return null;
}
