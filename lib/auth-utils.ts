import { cookies } from "next/headers";
import { verifyAuthToken, getAuthCookieName } from "./auth";

export async function getAuthenticatedEmail(): Promise<string | null> {
	const cookieStore = await cookies();
	const authToken = cookieStore.get(getAuthCookieName())?.value;

	if (!authToken) {
		return null;
	}

	const payload = await verifyAuthToken(authToken);
	if (!payload) {
		return null;
	}

	return payload.email;
}

export async function isAuthenticated(): Promise<boolean> {
	const email = await getAuthenticatedEmail();
	return email !== null;
}
