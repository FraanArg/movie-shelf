export default function Loading() {
    return (
        <main style={{ padding: "40px 20px 80px 20px", minHeight: "100vh", maxWidth: "900px", margin: "0 auto" }}>
            {/* Header skeleton */}
            <div style={{
                width: "150px",
                height: "32px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "8px",
                marginBottom: "30px",
                animation: "pulse 1.5s ease-in-out infinite"
            }} />

            {/* Grid skeleton */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "20px"
            }}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} style={{
                        aspectRatio: "2/3",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "12px",
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
