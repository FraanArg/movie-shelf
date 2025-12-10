export default function Loading() {
    return (
        <main style={{ padding: "40px 20px 80px 20px", minHeight: "100vh", maxWidth: "900px", margin: "0 auto" }}>
            {/* Header skeleton */}
            <div style={{
                width: "180px",
                height: "32px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "8px",
                marginBottom: "30px",
                animation: "pulse 1.5s ease-in-out infinite"
            }} />

            {/* Card skeletons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{
                        display: "flex",
                        gap: "20px",
                        padding: "20px",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "16px",
                        animation: "pulse 1.5s ease-in-out infinite",
                        animationDelay: `${i * 100}ms`
                    }}>
                        <div style={{
                            width: "80px",
                            height: "120px",
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "8px",
                            flexShrink: 0
                        }} />
                        <div style={{ flex: 1 }}>
                            <div style={{
                                width: "60%",
                                height: "20px",
                                background: "rgba(255,255,255,0.05)",
                                borderRadius: "4px",
                                marginBottom: "10px"
                            }} />
                            <div style={{
                                width: "40%",
                                height: "16px",
                                background: "rgba(255,255,255,0.03)",
                                borderRadius: "4px",
                                marginBottom: "15px"
                            }} />
                            <div style={{
                                width: "100%",
                                height: "8px",
                                background: "rgba(255,255,255,0.03)",
                                borderRadius: "4px"
                            }} />
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </main>
    );
}
