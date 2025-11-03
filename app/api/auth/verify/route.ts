import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getAuthCookieName, getCookieExpiry } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const token = searchParams.get("token");
		const email = searchParams.get("email");

		if (!token || !email) {
			return NextResponse.redirect(new URL("/login?error=missing_token", request.url));
		}

		const payload = await verifyAuthToken(token);
		if (!payload) {
			return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
		}

		if (payload.email !== email) {
			return NextResponse.redirect(new URL("/login?error=email_mismatch", request.url));
		}

		// Set auth cookie
		const cookieStore = await cookies();
		cookieStore.set(getAuthCookieName(), token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			expires: getCookieExpiry(),
			path: "/",
		});

		// Redirect to home page or the redirect URL if provided
		const redirectUrl = request.nextUrl.searchParams.get("redirect") || "/";
		return NextResponse.redirect(new URL(redirectUrl, request.url));
	} catch (error) {
		console.error("Error in GET /api/auth/verify:", error);
		return NextResponse.redirect(new URL("/login?error=verification_failed", request.url));
	}
}
