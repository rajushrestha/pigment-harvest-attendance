import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Use webpack for native modules compatibility
	webpack: (config, { isServer }) => {
		if (isServer) {
			// Exclude native modules from optimization
			config.externals = config.externals || [];
			// Handle native modules that need to be externalized
			if (Array.isArray(config.externals)) {
				config.externals.push("@tursodatabase/sync");
			} else {
				config.externals = [
					config.externals,
					"@tursodatabase/sync",
				];
			}
		}
		return config;
	},
	// Externalize packages for server components (native modules)
	serverExternalPackages: ["@tursodatabase/sync"],
	// Set empty turbopack config to silence warning (we use webpack for native modules)
	turbopack: {},
};

export default nextConfig;
