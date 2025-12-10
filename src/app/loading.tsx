export default function Loading() {
    return (
        <main style={{ padding: "0 40px 80px 40px", minHeight: "100vh" }}>
            {/* Header skeleton */}
            <div style={{
                height: "60px",
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "30px 0 15px 0"
            }}>
                <div style={{
                    width: "150px",
                    height: "32px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                    animation: "pulse 1.5s ease-in-out infinite"
                }} />
            </div>

            {/* Grid skeleton */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "25px",
                marginTop: "20px"
            }}>
                {Array.from({ length: 20 }).map((_, i) => (
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
