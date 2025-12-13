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
                    width: "150px",
                    height: "32px",
                    background: "var(--fill-tertiary)",
                    borderRadius: "var(--radius-sm)",
                    animation: "pulse 1.5s ease-in-out infinite"
                }} />
            </div>

            {/* Grid skeleton */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "var(--space-md)"
            }}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} style={{
                        aspectRatio: "2/3",
                        background: "var(--fill-tertiary)",
                        borderRadius: "var(--radius-md)",
                        animation: "pulse 1.5s ease-in-out infinite",
                        animationDelay: `${i * 50}ms`
                    }} />
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
