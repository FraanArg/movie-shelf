"use client";

import { SignInButton, SignOutButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function AuthButton() {
    return (
        <>
            <SignedOut>
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
            </SignedOut>
            <SignedIn>
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
            </SignedIn>
        </>
    );
}
