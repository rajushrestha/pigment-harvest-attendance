import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	compiler: {
		// Remove console statements in production builds
		// This removes console.log, console.info, console.debug, etc.
		// but keeps console.error and console.warn for error tracking
		removeConsole: process.env.NODE_ENV === "production" ? {
			exclude: ["error", "warn"],
		} : false,
	},
};

export default nextConfig;
