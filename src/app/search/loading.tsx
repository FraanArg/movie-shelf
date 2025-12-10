export default function Loading() {
    return (
        <main style={{ padding: "40px", minHeight: "100vh" }}>
            {/* Header skeleton */}
            <div style={{
                width: "150px",
                height: "32px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "8px",
                marginBottom: "30px",
                animation: "pulse 1.5s ease-in-out infinite"
            }} />

            {/* Search input skeleton */}
            <div style={{
                width: "100%",
                maxWidth: "500px",
                height: "50px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "25px",
                marginBottom: "30px",
                animation: "pulse 1.5s ease-in-out infinite"
            }} />

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }
            `}</style>
        </main>
    );
}
