"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleLogout = async () => {
		setIsLoading(true);
		try {
			const response = await fetch("/api/auth/logout", {
				method: "POST",
			});
			if (response.ok) {
				router.push("/login");
				router.refresh();
			}
		} catch (error) {
			console.error("Error logging out:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			onClick={handleLogout}
			disabled={isLoading}
			className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{isLoading ? "Logging out..." : "Logout"}
		</button>
	);
}
