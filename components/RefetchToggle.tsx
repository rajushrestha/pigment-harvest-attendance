"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RefetchToggleProps {
	cachedAt?: number | null;
}

export function RefetchToggle({ cachedAt }: RefetchToggleProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isRefreshing, setIsRefreshing] = useState(false);

	const refetch = searchParams.get("refetch");

	// Set refreshing state when refetch parameter is present
	useEffect(() => {
		setIsRefreshing(refetch === "true");
	}, [refetch]);

	const handleRefresh = () => {
		setIsRefreshing(true);
		const params = new URLSearchParams(searchParams.toString());
		params.set("refetch", "true");
		router.push(`?${params.toString()}`);
	};

	const formatCachedDate = () => {
		if (!cachedAt) return null;
		const date = new Date(cachedAt);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const cachedDateStr = formatCachedDate();

	return (
		<div className="flex items-center gap-2">
			<Button
				type="button"
				onClick={handleRefresh}
				disabled={isRefreshing}
				variant="ghost"
				size="sm"
				title="Force refresh from API"
			>
				<RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
				<span>{isRefreshing ? "Refreshing..." : "Force Refresh"}</span>
			</Button>
			{cachedDateStr && (
				<span className="text-xs text-muted-foreground">
					({cachedDateStr})
				</span>
			)}
		</div>
	);
}
