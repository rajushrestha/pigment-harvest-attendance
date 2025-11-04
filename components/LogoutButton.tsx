"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
		<Button
			onClick={handleLogout}
			disabled={isLoading}
			variant="outline"
			size="sm"
		>
			{isLoading ? "Logging out..." : "Logout"}
		</Button>
	);
}
