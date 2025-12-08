"use client";

import { useState, useEffect, useCallback } from "react";

interface MovieNotesProps {
    imdbId: string;
    initialRating?: number;
    initialNote?: string;
}

export default function MovieNotes({ imdbId, initialRating = 0, initialNote = "" }: MovieNotesProps) {
    const [rating, setRating] = useState(initialRating);
    const [hoverRating, setHoverRating] = useState(0);
    const [note, setNote] = useState(initialNote);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Auto-save debounce
    const saveNote = useCallback(async (newRating: number, newNote: string) => {
        setSaving(true);
        setSaved(false);
        try {
            await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imdbId, rating: newRating, note: newNote }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            console.error("Failed to save note:", e);
        } finally {
            setSaving(false);
        }
    }, [imdbId]);

    // Debounced save for note changes
    useEffect(() => {
        if (note === initialNote && rating === initialRating) return;

        const timer = setTimeout(() => {
            saveNote(rating, note);
        }, 1000);

        return () => clearTimeout(timer);
    }, [note, rating, initialNote, initialRating, saveNote]);

    const handleRatingClick = (newRating: number) => {
        setRating(newRating);
    };

    return (
        <div style={{
            marginTop: "30px",
            padding: "20px",
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "16px",
            border: "1px solid var(--glass-border)",
        }}>
            <h3 style={{
                fontSize: "1rem",
                fontWeight: "600",
                marginBottom: "15px",
                color: "var(--foreground)",
                opacity: 0.8,
            }}>
                Your Review
            </h3>

            {/* Star Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
                <div style={{ display: "flex", gap: "4px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => handleRatingClick(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "1.5rem",
                                padding: "2px",
                                transition: "transform 0.15s ease",
                                transform: (hoverRating >= star || rating >= star) ? "scale(1.1)" : "scale(1)",
                            }}
                            aria-label={`Rate ${star} stars`}
                        >
                            {(hoverRating >= star || rating >= star) ? "⭐" : "☆"}
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <span style={{ fontSize: "0.85rem", opacity: 0.6 }}>
                        {rating === 1 && "Poor"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Good"}
                        {rating === 4 && "Great"}
                        {rating === 5 && "Excellent"}
                    </span>
                )}
            </div>

            {/* Note Text Area */}
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write your thoughts about this movie..."
                style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    color: "var(--foreground)",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                    resize: "vertical",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--accent)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />

            {/* Save Status */}
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "10px",
                fontSize: "0.8rem",
                opacity: 0.6,
            }}>
                {saving && <span>Saving...</span>}
                {saved && <span style={{ color: "#30d158" }}>✓ Saved</span>}
            </div>
        </div>
    );
}
