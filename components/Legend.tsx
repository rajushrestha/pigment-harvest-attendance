"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LegendProps {
	onFilterChange: (filters: {
		holiday: boolean;
		weekend: boolean;
		worked: boolean;
		absent: boolean;
		overtime: boolean;
	}) => void;
	exportButtons?: React.ReactNode;
}

export function Legend({ onFilterChange, exportButtons }: LegendProps) {
	const [filters, setFilters] = useState({
		holiday: false,
		weekend: false,
		worked: false,
		absent: false,
		overtime: false,
	});

	const toggleFilter = (key: keyof typeof filters) => {
		const newFilters = {
			...filters,
			[key]: !filters[key],
		};
		setFilters(newFilters);
		onFilterChange(newFilters);
	};

	const clearFilters = () => {
		const clearedFilters = {
			holiday: false,
			weekend: false,
			worked: false,
			absent: false,
			overtime: false,
		};
		setFilters(clearedFilters);
		onFilterChange(clearedFilters);
	};

	const hasActiveFilters = Object.values(filters).some((val) => val);

	return (
		<div className="py-10">
			<div className="flex flex-wrap items-center justify-between gap-4 text-sm">
				<div className="flex flex-wrap items-center gap-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => toggleFilter("holiday")}
						className={cn(
							"border border-transparent",
							filters.holiday
								? "bg-purple-100 dark:bg-purple-900/30 border-purple-400 dark:border-purple-600"
								: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
						)}
					>
						<div
							className="size-4 rounded"
							style={{
								backgroundColor: "rgba(192, 132, 252, 0.3)",
							}}
						/>
						<span className="text-zinc-700 dark:text-zinc-300 font-medium">
							Holiday
						</span>
					</Button>

					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => toggleFilter("weekend")}
						className={cn(
							"border border-transparent",
							filters.weekend
								? "bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600"
								: " hover:bg-zinc-100 dark:hover:bg-zinc-800",
						)}
					>
						<div className="size-4 rounded bg-red-50 dark:bg-red-900/20" />
						<span className="text-zinc-700 dark:text-zinc-300 font-medium">
							Weekend
						</span>
					</Button>

					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => toggleFilter("worked")}
						className={cn(
							"border border-transparent",
							filters.worked
								? "bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600"
								: " hover:bg-zinc-100 dark:hover:bg-zinc-800",
						)}
					>
						<div
							className="size-4 rounded"
							style={{
								backgroundColor: "rgba(34, 197, 94, 0.3)",
							}}
						/>
						<span className="text-zinc-700 dark:text-zinc-300 font-medium">
							Worked (8h = full green)
						</span>
					</Button>

					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => toggleFilter("absent")}
						className={cn(
							"border border-transparent",
							filters.absent
								? "bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600"
								: " hover:bg-zinc-100 dark:hover:bg-zinc-800",
						)}
					>
						<div
							className="size-4 rounded"
							style={{
								backgroundColor: "rgba(239, 68, 68, 0.15)",
							}}
						/>
						<span className="text-zinc-700 dark:text-zinc-300 font-medium">
							Absent
						</span>
					</Button>

					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => toggleFilter("overtime")}
						className={cn(
							"border border-transparent",
							filters.overtime
								? "bg-orange-100 dark:bg-orange-900/30 border-orange-400 dark:border-orange-600"
								: " hover:bg-zinc-100 dark:hover:bg-zinc-800",
						)}
					>
						<div
							className="size-4 rounded"
							style={{
								backgroundColor: "rgba(251, 146, 60, 0.3)",
							}}
						/>
						<span className="text-zinc-700 dark:text-zinc-300 font-medium">
							Overtime
						</span>
					</Button>

					{hasActiveFilters && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={clearFilters}
						>
							Clear Filters
						</Button>
					)}
				</div>
				{exportButtons && (
					<div className="flex items-center gap-2">{exportButtons}</div>
				)}
			</div>
		</div>
	);
}
