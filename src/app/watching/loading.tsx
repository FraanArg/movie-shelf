export default function Loading() {
    return (
        <main style={{
            padding: "var(--space-xl) var(--space-md)",
            paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
            minHeight: "100vh",
            maxWidth: "900px",
            margin: "0 auto"
        }}>
            {/* Header skeleton */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-sm)",
                marginBottom: "var(--space-lg)"
            }}>
                <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--fill-tertiary)",
                    animation: "pulse 1.5s ease-in-out infinite"
                }} />
                <div style={{
                    width: "180px",
                    height: "32px",
                    background: "var(--fill-tertiary)",
                    borderRadius: "var(--radius-sm)",
                    animation: "pulse 1.5s ease-in-out infinite"
                }} />
            </div>

            {/* Card skeletons */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 350px), 1fr))",
                gap: "var(--space-md)"
            }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{
                        display: "flex",
                        gap: "var(--space-md)",
                        padding: "var(--space-md)",
                        background: "var(--bg-secondary)",
                        borderRadius: "var(--radius-lg)",
                        animation: "pulse 1.5s ease-in-out infinite",
                        animationDelay: `${i * 100}ms`
                    }}>
                        <div style={{
                            width: "80px",
                            height: "120px",
                            background: "var(--fill-tertiary)",
                            borderRadius: "var(--radius-md)",
                            flexShrink: 0
                        }} />
                        <div style={{ flex: 1 }}>
                            <div style={{
                                width: "60%",
                                height: "20px",
                                background: "var(--fill-tertiary)",
                                borderRadius: "var(--radius-xs)",
                                marginBottom: "var(--space-sm)"
                            }} />
                            <div style={{
                                width: "40%",
                                height: "16px",
                                background: "var(--fill-quaternary)",
                                borderRadius: "var(--radius-xs)",
                                marginBottom: "var(--space-md)"
                            }} />
                            <div style={{
                                width: "100%",
                                height: "6px",
                                background: "var(--fill-quaternary)",
                                borderRadius: "var(--radius-full)"
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
