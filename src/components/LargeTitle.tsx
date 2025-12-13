"use client";

import { ReactNode } from "react";

interface LargeTitleProps {
    children: ReactNode;
    subtitle?: string;
    action?: ReactNode;
}

/**
 * iOS-style Large Title component
 * Uses 34px bold font on mobile, slightly smaller on desktop
 */
export default function LargeTitle({ children, subtitle, action }: LargeTitleProps) {
    return (
        <div style={{
            paddingTop: "var(--space-lg)",
            paddingBottom: "var(--space-md)",
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-md)",
            }}>
                <h1
                    className="large-title"
                    style={{
                        fontSize: "var(--font-size-title1)",
                        fontWeight: 700,
                        color: "var(--label-primary)",
                        margin: 0,
                        letterSpacing: "-0.3px",
                        fontFamily: "var(--font-system)",
                        textTransform: "none", // Override the uppercase styling
                    }}
                >
                    {children}
                </h1>
                {action && (
                    <div style={{ flexShrink: 0 }}>
                        {action}
                    </div>
                )}
            </div>
            {subtitle && (
                <p style={{
                    fontSize: "var(--font-size-subhead)",
                    color: "var(--label-secondary)",
                    margin: 0,
                    marginTop: "var(--space-xs)",
                }}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}
