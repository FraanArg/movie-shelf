"use client";

// Simplified test - no Clerk dependency
export default function AuthButton() {
    return (
        <button
            style={{
                padding: "8px 15px",
                borderRadius: "20px",
                fontSize: "0.9rem",
                fontWeight: "500",
                background: "linear-gradient(135deg, #0a84ff, #30d158)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
            }}
        >
            TEST
        </button>
    );
}
