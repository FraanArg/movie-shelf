"use client";

import { useEffect, useState } from "react";

export default function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check initial state
        setIsOffline(!navigator.onLine);

        const handleOnline = () => {
            setIsOffline(false);
            setShowBanner(true);
            // Auto-hide after 3 seconds
            setTimeout(() => setShowBanner(false), 3000);
        };

        const handleOffline = () => {
            setIsOffline(true);
            setShowBanner(true);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!showBanner && !isOffline) return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: "80px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "12px 24px",
                borderRadius: "30px",
                background: isOffline
                    ? "linear-gradient(135deg, #ef4444, #dc2626)"
                    : "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff",
                fontSize: "0.9rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                zIndex: 9999,
                animation: "slideUp 0.3s ease",
            }}
        >
            <span style={{ fontSize: "1.2rem" }}>
                {isOffline ? "📴" : "✓"}
            </span>
            {isOffline ? "You're offline — cached content available" : "Back online!"}

            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
