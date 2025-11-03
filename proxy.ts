import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken, getAuthCookieName } from "@/lib/auth";

export async function proxy(request: NextRequest) {
	// Allow public access to welcome, login and API routes
	if (
		request.nextUrl.pathname === "/welcome" ||
		request.nextUrl.pathname === "/login" ||
		request.nextUrl.pathname.startsWith("/api/auth")
	) {
		return NextResponse.next();
	}

	// Check authentication for all other routes
	const authToken = request.cookies.get(getAuthCookieName())?.value;

	if (!authToken) {
		// Redirect to welcome page if not authenticated
		return NextResponse.redirect(new URL("/welcome", request.url));
	}

	const payload = await verifyAuthToken(authToken);
	if (!payload) {
		// Invalid or expired token, redirect to welcome page
		const response = NextResponse.redirect(new URL("/welcome", request.url));
		// Clear invalid cookie
		response.cookies.delete(getAuthCookieName());
		return response;
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
