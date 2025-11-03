import { NextRequest, NextResponse } from "next/server";
import { getAuthCookieName } from "@/lib/auth";

export async function POST(request: NextRequest) {
	try {
		const response = NextResponse.json({ success: true });
		response.cookies.delete(getAuthCookieName());
		return response;
	} catch (error) {
		console.error("Error in POST /api/auth/logout:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
