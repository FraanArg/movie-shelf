import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/trakt";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(new URL("/?error=no_code", request.url));
    }

    try {
        const tokenData = await exchangeCodeForToken(
            code,
            process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID!,
            process.env.TRAKT_CLIENT_SECRET!
        );

        // Set the token in a cookie
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.set("trakt_access_token", tokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: tokenData.expires_in,
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Auth error:", error);
        return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
    }
}
