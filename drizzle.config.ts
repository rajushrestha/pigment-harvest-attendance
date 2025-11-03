import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// Load environment variables
config();

export default {
	schema: "./lib/db/schema.ts",
	out: "./drizzle",
	dialect: "turso",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN!,
	},
	breakpoints: true,
	verbose: true,
	strict: true,
} satisfies Config;
