// List of allowed email addresses for authentication
// You can also set ALLOWED_EMAILS environment variable (comma-separated)
// Example: ALLOWED_EMAILS=user1@example.com,user2@example.com

const DEFAULT_ALLOWED_EMAILS: string[] = [
	"raju@lunover.com",
  "officialprabin@gmail.com",
  "ritesh@pigment.se",
  "ronash@pigment.se",
  "krishna@pigment.se",
];

export function getAllowedEmails(): string[] {
	const envEmails = process.env.ALLOWED_EMAILS;
	if (envEmails) {
		return envEmails.split(",").map((email) => email.trim()).filter(Boolean);
	}
	return DEFAULT_ALLOWED_EMAILS;
}

export function isEmailAllowed(email: string): boolean {
	const allowedEmails = getAllowedEmails();
	return allowedEmails.includes(email.toLowerCase().trim());
}

export function isSuperAdmin(email: string): boolean {
	const allowedEmails = ["raju@lunover.com"];
	return allowedEmails.includes(email.toLowerCase().trim());
}
