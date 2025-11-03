import { Resend } from "resend";
import { generateAuthToken } from "@/lib/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
	try {
		const token = await generateAuthToken(email);
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
			(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

		const magicLink = `${baseUrl}/api/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

		const { error } = await resend.emails.send({
			from: "report@lunover.com",
			to: email,
			subject: "Sign in to Harvest Attendance",
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #333;">Sign in to Harvest Attendance</h2>
					<p>Click the link below to sign in. This link will expire in 24 hours.</p>
					<p>
						<a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
							Sign In
						</a>
					</p>
					<p style="color: #666; font-size: 12px;">
						Or copy and paste this link into your browser:<br/>
						<a href="${magicLink}" style="color: #0070f3; word-break: break-all;">${magicLink}</a>
					</p>
					<p style="color: #666; font-size: 12px; margin-top: 30px;">
						If you didn't request this email, you can safely ignore it.
					</p>
				</div>
			`,
		});

		if (error) {
			console.error("Resend error:", error);
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (error) {
		console.error("Error sending magic link:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
