export default function Loading() {
    return (
        <main style={{
            padding: "var(--space-xl) var(--space-md)",
            paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
            minHeight: "100vh",
            maxWidth: "800px",
            margin: "0 auto"
        }}>
            {/* Profile header skeleton */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-lg)",
                marginBottom: "var(--space-xl)"
            }}>
                <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--fill-tertiary)",
                    animation: "pulse 1.5s ease-in-out infinite"
                }} />
                <div>
                    <div style={{
                        width: "200px",
                        height: "32px",
                        background: "var(--fill-tertiary)",
                        borderRadius: "var(--radius-sm)",
                        marginBottom: "var(--space-sm)",
                        animation: "pulse 1.5s ease-in-out infinite"
                    }} />
                    <div style={{
                        width: "120px",
                        height: "20px",
                        background: "var(--fill-quaternary)",
                        borderRadius: "var(--radius-xs)",
                        animation: "pulse 1.5s ease-in-out infinite"
                    }} />
                </div>
            </div>

            {/* Stats grid skeleton */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "var(--space-md)",
                marginBottom: "var(--space-xl)"
            }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{
                        height: "100px",
                        background: "var(--fill-tertiary)",
                        borderRadius: "var(--radius-lg)",
                        animation: "pulse 1.5s ease-in-out infinite",
                        animationDelay: `${i * 100}ms`
                    }} />
                ))}
            </div>

            {/* Content blocks skeleton */}
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{
                    height: "200px",
                    background: "var(--fill-quaternary)",
                    borderRadius: "var(--radius-xl)",
                    marginBottom: "var(--space-xl)",
                    animation: "pulse 1.5s ease-in-out infinite",
                    animationDelay: `${i * 150}ms`
                }} />
            ))}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </main>
    );
}
