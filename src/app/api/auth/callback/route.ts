import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/trakt";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(new URL("/?error=no_code", request.url));
    }

    try {
        console.log("OAuth callback: exchanging code for token...");
        const tokenData = await exchangeCodeForToken(
            code,
            process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID!,
            process.env.TRAKT_CLIENT_SECRET!
        );

        console.log("OAuth callback: token received, setting cookie...");

        // Set the token in a cookie
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.set("trakt_access_token", tokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: tokenData.expires_in,
            path: "/",
            sameSite: "lax", // Important for OAuth redirects
        });

        console.log("OAuth callback: success, redirecting to home");
        return response;
    } catch (error) {
        console.error("Auth error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.redirect(new URL(`/?error=auth_failed&message=${encodeURIComponent(errorMessage)}`, request.url));
    }
}
