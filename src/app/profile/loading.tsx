export default function Loading() {
    return (
        <main style={{ padding: "40px 20px 80px 20px", minHeight: "100vh", maxWidth: "800px", margin: "0 auto" }}>
            {/* Profile header skeleton */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
                <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)",
                    animation: "pulse 1.5s ease-in-out infinite"
                }} />
                <div>
                    <div style={{
                        width: "200px",
                        height: "32px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "8px",
                        marginBottom: "8px",
                        animation: "pulse 1.5s ease-in-out infinite"
                    }} />
                    <div style={{
                        width: "120px",
                        height: "20px",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "6px",
                        animation: "pulse 1.5s ease-in-out infinite"
                    }} />
                </div>
            </div>

            {/* Stats grid skeleton */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "15px",
                marginBottom: "30px"
            }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{
                        height: "100px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "16px",
                        animation: "pulse 1.5s ease-in-out infinite",
                        animationDelay: `${i * 100}ms`
                    }} />
                ))}
            </div>

            {/* Content blocks skeleton */}
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{
                    height: "200px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "20px",
                    marginBottom: "30px",
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
