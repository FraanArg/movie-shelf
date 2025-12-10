export default function Loading() {
    return (
        <main style={{ padding: "40px 20px 80px 20px", minHeight: "100vh", maxWidth: "1000px", margin: "0 auto" }}>
            {/* Header skeleton */}
            <div style={{
                width: "200px",
                height: "32px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "8px",
                marginBottom: "30px",
                animation: "pulse 1.5s ease-in-out infinite"
            }} />

            {/* Network visualization skeleton */}
            <div style={{
                height: "400px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "20px",
                marginBottom: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "pulse 1.5s ease-in-out infinite"
            }}>
                <div style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)"
                }} />
            </div>

            {/* Stats row skeleton */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px"
            }}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{
                        height: "100px",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "16px",
                        animation: "pulse 1.5s ease-in-out infinite",
                        animationDelay: `${i * 100}ms`
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
