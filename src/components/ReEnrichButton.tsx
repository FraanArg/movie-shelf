"use client";

import { useState, useCallback, useEffect } from "react";

interface EnrichStatus {
    totalNeedingEnrichment?: number;
    enriched?: number;
    remaining?: number;
    message?: string;
    error?: string;
    moviesMissing?: number;
    showsMissing?: number;
}

export default function ReEnrichButton() {
    const [status, setStatus] = useState<EnrichStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [totalProcessed, setTotalProcessed] = useState(0);
    const [initialTotal, setInitialTotal] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    // Check status on mount
    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await fetch("/api/re-enrich");
            const data = await res.json();
            setStatus(data);
            if (!initialTotal && data.totalNeedingEnrichment) {
                setInitialTotal(data.totalNeedingEnrichment);
            }
        } catch (e) {
            setStatus({ error: "Failed to check status" });
        }
    };

    const runEnrichBatch = useCallback(async () => {
        try {
            const res = await fetch("/api/re-enrich", { method: "POST" });
            const data = await res.json();

            if (data.error) {
                setStatus(data);
                setIsRunning(false);
                setLoading(false);
                return;
            }

            setTotalProcessed(prev => prev + (data.enriched || 0));
            setStatus(data);

            // Continue if more remaining
            if (data.remaining > 0) {
                setTimeout(runEnrichBatch, 300);
            } else {
                setIsRunning(false);
                setLoading(false);
            }
        } catch (e) {
            setStatus({ error: "Network error - please retry" });
            setIsRunning(false);
            setLoading(false);
        }
    }, []);

    const startEnrich = () => {
        setLoading(true);
        setIsRunning(true);
        setTotalProcessed(0);
        if (status?.totalNeedingEnrichment) {
            setInitialTotal(status.totalNeedingEnrichment);
        }
        runEnrichBatch();
    };

    const needsEnrichment = status?.totalNeedingEnrichment ?? 0;
    const remaining = status?.remaining ?? needsEnrichment;

    // Calculate progress based on total processed vs initial amount
    const progressPercent = initialTotal > 0
        ? Math.min(99, Math.round((totalProcessed / initialTotal) * 100))
        : 0;

    // Nothing to fix
    if (status && needsEnrichment === 0 && !isRunning) {
        return (
            <div style={{
                background: "rgba(34, 197, 94, 0.1)",
                padding: "15px 20px",
                borderRadius: "12px",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#22c55e",
            }}>
                ✅ All items have Director/Actor data!
            </div>
        );
    }

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
                        {isRunning
                            ? `Processing... ${totalProcessed} fixed, ${remaining} left`
                            : `${needsEnrichment} items need Director/Actor data`
                        }
                    </p>
                </div>

                {!isRunning && needsEnrichment > 0 && (
                    <button
                        onClick={startEnrich}
                        disabled={loading}
                        style={{
                            padding: "10px 20px",
                            background: "var(--accent)",
                            border: "none",
                            borderRadius: "10px",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                        }}
                    >
                        Fix {needsEnrichment} Items
                    </button>
                )}
            </div>

            {/* Progress bar */}
            {isRunning && (
                <div style={{ marginTop: "15px" }}>
                    <div style={{
                        height: "8px",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: "4px",
                        overflow: "hidden",
                    }}>
                        <div style={{
                            width: `${progressPercent}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, var(--accent), #30d158)",
                            borderRadius: "4px",
                            transition: "width 0.3s ease",
                        }} />
                    </div>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "8px",
                        fontSize: "0.8rem",
                        color: "#888",
                    }}>
                        <span>{totalProcessed} processed</span>
                        <span>{progressPercent}%</span>
                    </div>
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
