import "dotenv/config";
import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
	process.env.AUTH_SECRET ||
		process.env.RESEND_API_KEY ||
		"default-secret-change-in-production",
);

const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface AuthTokenPayload {
	email: string;
	exp: number;
}

export async function generateAuthToken(email: string): Promise<string> {
	const now = Date.now();
	const exp = now + TOKEN_EXPIRY;

	const token = await new SignJWT({ email, exp })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt(Math.floor(now / 1000))
		.setExpirationTime(Math.floor(exp / 1000))
		.sign(SECRET_KEY);

	return token;
}

export async function verifyAuthToken(
	token: string,
): Promise<AuthTokenPayload | null> {
	try {
		// Validate token is not empty
		if (!token || typeof token !== "string" || token.trim().length === 0) {
			console.error("Token is empty or invalid");
			return null;
		}

		const { payload } = await jwtVerify(token, SECRET_KEY);
		const exp = (payload.exp as number) * 1000; // Convert to milliseconds

		// Check if token is expired
		if (exp < Date.now()) {
			console.error("Token expired:", {
				exp,
				now: Date.now(),
				diff: Date.now() - exp,
			});
			return null;
		}

		// Validate email exists in payload
		if (!payload.email || typeof payload.email !== "string") {
			console.error("Invalid payload - missing email:", payload);
			return null;
		}

		return {
			email: payload.email,
			exp,
		};
	} catch (error) {
		console.error("JWT verification error:", {
			error: error instanceof Error ? error.message : String(error),
			tokenLength: token?.length,
			tokenPrefix: token?.substring(0, 20),
		});
		return null;
	}
}

export function getAuthCookieName(): string {
	return "auth_token";
}

export function getCookieExpiry(): Date {
	const expiry = new Date();
	expiry.setTime(expiry.getTime() + TOKEN_EXPIRY);
	return expiry;
}
