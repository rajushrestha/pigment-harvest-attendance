import { NextRequest, NextResponse } from "next/server";
import { sendMagicLink } from "@/lib/send-magic-link";
import { isEmailAllowed } from "@/lib/allowed-emails";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email } = body;

		if (!email || typeof email !== "string") {
			return NextResponse.json(
				{ success: false, error: "Email is required" },
				{ status: 400 },
			);
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ success: false, error: "Invalid email format" },
				{ status: 400 },
			);
		}

		// Check if email is allowed
		if (!isEmailAllowed(email)) {
			return NextResponse.json(
				{ success: false, error: "This email is not authorized to access this application" },
				{ status: 403 },
			);
		}

		const result = await sendMagicLink(email);

		if (!result.success) {
			return NextResponse.json(
				{ success: false, error: result.error || "Failed to send email" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			success: true,
			message: "Magic link sent to your email",
		});
	} catch (error) {
		console.error("Error in POST /api/auth/send-link:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
