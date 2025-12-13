"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

/**
 * iOS-style Bottom Sheet component
 * Slides up from bottom with backdrop and drag-to-close
 */
export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
    const sheetRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const startY = useRef(0);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Handle drag start
    const handleDragStart = (clientY: number) => {
        setIsDragging(true);
        startY.current = clientY;
    };

    // Handle drag move
    const handleDragMove = (clientY: number) => {
        if (!isDragging) return;
        const delta = clientY - startY.current;
        if (delta > 0) {
            setDragOffset(delta);
        }
    };

    // Handle drag end
    const handleDragEnd = () => {
        setIsDragging(false);
        if (dragOffset > 100) {
            onClose();
        }
        setDragOffset(0);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    zIndex: 200,
                    opacity: isOpen ? 1 : 0,
                    transition: "opacity 0.3s ease",
                }}
            />

            {/* Sheet */}
            <div
                ref={sheetRef}
                role="dialog"
                aria-modal="true"
                aria-label={title || "Bottom sheet"}
                style={{
                    position: "fixed",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 201,
                    background: "var(--bg-secondary)",
                    borderTopLeftRadius: "var(--radius-xl)",
                    borderTopRightRadius: "var(--radius-xl)",
                    paddingBottom: "env(safe-area-inset-bottom)",
                    maxHeight: "85vh",
                    display: "flex",
                    flexDirection: "column",
                    transform: `translateY(${dragOffset}px)`,
                    transition: isDragging ? "none" : "transform 0.3s ease",
                    boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.3)",
                }}
                onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
                onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
                onTouchEnd={handleDragEnd}
                onMouseDown={(e) => handleDragStart(e.clientY)}
                onMouseMove={(e) => isDragging && handleDragMove(e.clientY)}
                onMouseUp={handleDragEnd}
                onMouseLeave={() => isDragging && handleDragEnd()}
            >
                {/* Drag handle */}
                <div
                    style={{
                        width: "36px",
                        height: "5px",
                        background: "var(--fill-tertiary)",
                        borderRadius: "var(--radius-full)",
                        margin: "var(--space-sm) auto var(--space-md)",
                        cursor: "grab",
                    }}
                />

                {/* Header */}
                {title && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0 var(--space-md) var(--space-md)",
                            borderBottom: "1px solid var(--separator)",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "var(--font-size-headline)",
                                fontWeight: 600,
                                fontFamily: "var(--font-system)",
                                color: "var(--label-primary)",
                                margin: 0,
                            }}
                        >
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "32px",
                                height: "32px",
                                borderRadius: "var(--radius-full)",
                                background: "var(--fill-tertiary)",
                                border: "none",
                                cursor: "pointer",
                                color: "var(--label-secondary)",
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "var(--space-md)",
                    }}
                >
                    {children}
                </div>
            </div>
        </>
    );
}
