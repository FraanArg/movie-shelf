"use client";

import { ReactNode } from "react";

interface GroupedSectionProps {
    title?: string;
    subtitle?: string;
    children: ReactNode;
    action?: ReactNode;
}

/**
 * iOS Settings-like grouped section component
 * Provides consistent styling for grouped content blocks
 */
export default function GroupedSection({ title, subtitle, children, action }: GroupedSectionProps) {
    return (
        <section style={{ marginBottom: "var(--space-xl)" }}>
            {/* Header */}
            {(title || action) && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "var(--space-sm)",
                        padding: "0 var(--space-md)",
                    }}
                >
                    {title && (
                        <h2
                            style={{
                                fontSize: "var(--font-size-footnote)",
                                fontWeight: 400,
                                fontFamily: "var(--font-system)",
                                color: "var(--label-secondary)",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                margin: 0,
                            }}
                        >
                            {title}
                        </h2>
                    )}
                    {action && <div>{action}</div>}
                </div>
            )}

            {/* Content card */}
            <div
                style={{
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                }}
            >
                {children}
            </div>

            {/* Subtitle/footer text */}
            {subtitle && (
                <p
                    style={{
                        fontSize: "var(--font-size-footnote)",
                        color: "var(--label-tertiary)",
                        margin: 0,
                        marginTop: "var(--space-sm)",
                        padding: "0 var(--space-md)",
                    }}
                >
                    {subtitle}
                </p>
            )}
        </section>
    );
}

interface GroupedRowProps {
    label: string;
    value?: string | ReactNode;
    icon?: ReactNode;
    onClick?: () => void;
    showChevron?: boolean;
    destructive?: boolean;
}

/**
 * Individual row within a GroupedSection
 */
export function GroupedRow({ label, value, icon, onClick, showChevron, destructive }: GroupedRowProps) {
    const Component = onClick ? "button" : "div";

    return (
        <Component
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-md)",
                padding: "var(--space-md)",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid var(--separator)",
                width: "100%",
                textAlign: "left",
                cursor: onClick ? "pointer" : "default",
                fontFamily: "var(--font-system)",
                fontSize: "var(--font-size-body)",
                minHeight: "44px",
            }}
        >
            {/* Icon */}
            {icon && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "28px",
                        height: "28px",
                        borderRadius: "var(--radius-sm)",
                        background: destructive ? "var(--tint-red)" : "var(--tint)",
                        color: "white",
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </div>
            )}

            {/* Label */}
            <span
                style={{
                    flex: 1,
                    color: destructive ? "var(--tint-red)" : "var(--label-primary)",
                }}
            >
                {label}
            </span>

            {/* Value */}
            {value && (
                <span
                    style={{
                        color: "var(--label-secondary)",
                        fontSize: "var(--font-size-body)",
                    }}
                >
                    {value}
                </span>
            )}

            {/* Chevron */}
            {showChevron && (
                <span
                    style={{
                        color: "var(--label-quaternary)",
                        fontSize: "var(--font-size-body)",
                    }}
                >
                    ›
                </span>
            )}
        </Component>
    );
}
