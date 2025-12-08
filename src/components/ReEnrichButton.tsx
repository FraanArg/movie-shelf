"use client";

import { useState, useCallback } from "react";

interface EnrichStatus {
    totalNeedingEnrichment?: number;
    enriched?: number;
    remaining?: number;
    message?: string;
    error?: string;
}

export default function ReEnrichButton() {
    const [status, setStatus] = useState<EnrichStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);

    const checkStatus = useCallback(async () => {
        setChecking(true);
        try {
            const res = await fetch("/api/re-enrich");
            const data = await res.json();
            setStatus(data);
        } catch (e) {
            setStatus({ error: "Failed to check status" });
        }
        setChecking(false);
    }, []);

    const runEnrich = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/re-enrich", { method: "POST" });
            const data = await res.json();
            setStatus(data);

            // If there are more, automatically continue
            if (data.remaining > 0) {
                setTimeout(runEnrich, 500);
            }
        } catch (e) {
            setStatus({ error: "Failed to enrich" });
            setLoading(false);
        }
        if (status?.remaining === 0) {
            setLoading(false);
        }
    }, [status?.remaining]);

    const needsEnrichment = status?.totalNeedingEnrichment ?? 0;
    const remaining = status?.remaining ?? needsEnrichment;

    return (
        <div style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "30px",
        }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "15px" }}>
                <div>
                    <h3 style={{ fontSize: "1rem", marginBottom: "5px", display: "flex", alignItems: "center", gap: "8px" }}>
                        🔧 Fix Missing Data
                    </h3>
                    <p style={{ color: "#888", fontSize: "0.85rem", margin: 0 }}>
                        {status?.totalNeedingEnrichment !== undefined
                            ? `${status.totalNeedingEnrichment} items need Director/Actor data`
                            : "Check if any items need Director/Actor data enrichment"
                        }
                    </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    {!status && (
                        <button
                            onClick={checkStatus}
                            disabled={checking}
                            style={{
                                padding: "10px 20px",
                                background: "rgba(255,255,255,0.1)",
                                border: "none",
                                borderRadius: "10px",
                                color: "#fff",
                                cursor: checking ? "wait" : "pointer",
                                fontSize: "0.9rem",
                            }}
                        >
                            {checking ? "Checking..." : "Check Status"}
                        </button>
                    )}
                    {status && needsEnrichment > 0 && (
                        <button
                            onClick={runEnrich}
                            disabled={loading}
                            style={{
                                padding: "10px 20px",
                                background: loading ? "rgba(168, 85, 247, 0.5)" : "var(--accent)",
                                border: "none",
                                borderRadius: "10px",
                                color: "#fff",
                                cursor: loading ? "wait" : "pointer",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                            }}
                        >
                            {loading
                                ? `Fixing... ${remaining} left`
                                : `Fix ${needsEnrichment} Items`
                            }
                        </button>
                    )}
                </div>
            </div>

            {status?.message && remaining === 0 && (
                <div style={{
                    marginTop: "15px",
                    padding: "12px",
                    background: "rgba(34, 197, 94, 0.1)",
                    borderRadius: "8px",
                    color: "#22c55e",
                    fontSize: "0.9rem",
                }}>
                    ✅ {status.message}
                </div>
            )}

            {status?.error && (
                <div style={{
                    marginTop: "15px",
                    padding: "12px",
                    background: "rgba(239, 68, 68, 0.1)",
                    borderRadius: "8px",
                    color: "#ef4444",
                    fontSize: "0.9rem",
                }}>
                    ❌ {status.error}
                </div>
            )}
        </div>
    );
}
