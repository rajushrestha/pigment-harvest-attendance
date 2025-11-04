import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getAuthCookieName, getCookieExpiry } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		let token = searchParams.get("token");
		const email = searchParams.get("email");

		if (!token || !email) {
			console.error("Missing token or email:", { hasToken: !!token, hasEmail: !!email });
			return NextResponse.redirect(new URL("/login?error=missing_token", request.url));
		}

		// Clean up token - remove any whitespace that might have been introduced
		token = token.trim();

		// Handle potential double-encoding from email clients/proxies
		// searchParams.get() already decodes once, but some email clients might encode again
		// Check if token looks URL-encoded (contains % characters) and decode if needed
		if (token.includes("%")) {
			try {
				const decoded = decodeURIComponent(token);
				// Only use decoded version if it results in a valid-looking JWT (has dots)
				if (decoded.includes(".") && decoded.split(".").length === 3) {
					token = decoded;
				}
			} catch (decodeError) {
				// If decoding fails, use original token
				console.warn("Token decode warning (using original):", decodeError);
			}
		}

		// Validate token format (JWT tokens have 3 parts separated by dots)
		const tokenParts = token.split(".");
		if (tokenParts.length !== 3) {
			console.error("Invalid token format:", {
				parts: tokenParts.length,
				tokenLength: token.length,
				tokenPrefix: token.substring(0, 50) + "...",
				hasPercentEncoding: token.includes("%"),
				url: request.url.substring(0, 200), // Log first 200 chars of URL for debugging
			});
			return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
		}

		// Verify the token
		const payload = await verifyAuthToken(token);
		if (!payload) {
			console.error("Token verification failed:", {
				tokenLength: token.length,
				tokenPrefix: token.substring(0, 20) + "...",
				email: email,
			});
			return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
		}

		if (payload.email !== email) {
			console.error("Email mismatch:", {
				payloadEmail: payload.email,
				providedEmail: email,
			});
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
