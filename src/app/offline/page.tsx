import Link from "next/link";

export default function OfflinePage() {
    return (
        <main style={{
            padding: "60px 20px",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
        }}>
            <div style={{
                fontSize: "5rem",
                marginBottom: "30px",
            }}>
                📡
            </div>

            <h1 style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                marginBottom: "15px",
                background: "linear-gradient(180deg, var(--foreground) 0%, rgba(255,255,255,0.7) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
            }}>
                You&apos;re Offline
            </h1>

            <p style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: "1.1rem",
                maxWidth: "400px",
                marginBottom: "40px",
                lineHeight: "1.6",
            }}>
                It looks like you&apos;ve lost your internet connection.
                Some cached pages and posters may still be available.
            </p>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
                width: "100%",
                maxWidth: "300px",
            }}>
                <Link
                    href="/"
                    style={{
                        padding: "14px 28px",
                        background: "var(--accent)",
                        color: "white",
                        borderRadius: "12px",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "1rem",
                        textAlign: "center",
                    }}
                >
                    Try Home Page
                </Link>

                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: "14px 28px",
                        background: "rgba(255,255,255,0.1)",
                        color: "var(--foreground)",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontWeight: "500",
                        fontSize: "1rem",
                    }}
                >
                    Retry Connection
                </button>
            </div>

            <div style={{
                marginTop: "60px",
                padding: "20px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "16px",
                maxWidth: "400px",
            }}>
                <h3 style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    marginBottom: "10px",
                }}>
                    💡 Tip
                </h3>
                <p style={{
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: "1.5",
                }}>
                    Movie Shelf caches your library and movie posters for offline viewing.
                    Visit pages while online to cache them for later!
                </p>
            </div>
        </main>
    );
}
