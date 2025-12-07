"use client";

import { SignInButton, SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";

export default function AuthButton() {
    // Debug: Check if Clerk is loading
    const { isLoaded, isSignedIn } = useAuth();

    // Show loading state while Clerk initializes
    if (!isLoaded) {
        return (
            <button
                style={{
                    padding: "8px 15px",
                    borderRadius: "20px",
                    fontSize: "0.9rem",
                    background: "var(--glass-highlight)",
                    color: "var(--glass-text)",
                    border: "none",
                    opacity: 0.5,
                }}
            >
                ...
            </button>
        );
    }

    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            {!isSignedIn ? (
                <SignInButton mode="modal">
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
                            transition: "all 0.3s ease",
                        }}
                    >
                        Sign In
                    </button>
                </SignInButton>
            ) : (
                <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                        elements: {
                            avatarBox: {
                                width: 36,
                                height: 36,
                            },
                        },
                    }}
                />
            )}
        </div>
    );
}
