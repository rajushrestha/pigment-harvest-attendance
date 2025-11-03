"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
			<button
				type="button"
				onClick={handleRefresh}
				disabled={isRefreshing}
				className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-black dark:text-zinc-50 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				title="Force refresh from API"
			>
				<svg
					className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
				<span>{isRefreshing ? "Refreshing..." : "Force Refresh"}</span>
			</button>
			{cachedDateStr && (
				<span className="text-xs text-zinc-500 dark:text-zinc-400">
					({cachedDateStr})
				</span>
			)}
		</div>
	);
}
