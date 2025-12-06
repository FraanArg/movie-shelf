"use client";

import { useEffect, useCallback } from "react";
import useSound from "use-sound";

// You would typically host these sounds or import them. 
// For now, I'll use placeholders or assume they exist in public/sounds.
// Since I can't upload files easily, I'll use a simple implementation that *would* play sounds if files existed,
// or use a web audio API generator for simple beeps/clicks if requested.
// For this demo, I'll setup the structure.

export default function SoundManager() {
    // We can use the Web Audio API to generate simple UI sounds without external assets for now.

    const playClick = useCallback(() => {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.05, ctx.currentTime); // Very quiet
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }, []);

    const playHover = useCallback(() => {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.02, ctx.currentTime); // Extremely quiet
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    }, []);

    useEffect(() => {
        const handleClick = () => playClick();
        const handleHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('a') || target.closest('button')) {
                playHover();
            }
        };

        window.addEventListener("click", handleClick);
        window.addEventListener("mouseover", handleHover);

        return () => {
            window.removeEventListener("click", handleClick);
            window.removeEventListener("mouseover", handleHover);
        };
    }, [playClick, playHover]);

    return null; // Headless component
}
