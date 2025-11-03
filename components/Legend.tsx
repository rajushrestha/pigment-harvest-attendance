"use client";

import { useState } from "react";

interface LegendProps {
	onFilterChange: (filters: {
		holiday: boolean;
		weekend: boolean;
		worked: boolean;
		absent: boolean;
		overtime?: boolean;
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
		<div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
			<div className="flex flex-wrap items-center justify-between gap-4 text-sm">
				<div className="flex flex-wrap items-center gap-4">
					<button
						type="button"
						onClick={() => toggleFilter("holiday")}
						className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
							filters.holiday
								? "bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-400 dark:border-purple-600"
								: "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
						}`}
					>
						<div
							className="w-6 h-6 rounded"
							style={{
								backgroundColor: "rgba(192, 132, 252, 0.3)",
							}}
						/>
						<span className="text-zinc-700 dark:text-zinc-300 font-medium">
							Holiday
						</span>
					</button>

					<button
						type="button"
						onClick={() => toggleFilter("weekend")}
						className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
							filters.weekend
								? "bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600"
								: "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
						}`}
					>
						<div className="w-6 h-6 rounded bg-red-50 dark:bg-red-900/20" />
						<span className="text-zinc-700 dark:text-zinc-300 font-medium">
							Weekend
						</span>
					</button>

					<button
						type="button"
						onClick={() => toggleFilter("worked")}
						className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
							filters.worked
								? "bg-green-100 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-600"
								: "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
						}`}
					>
						<div
							className="w-6 h-6 rounded"
							style={{
								backgroundColor: "rgba(34, 197, 94, 0.3)",
							}}
						/>
						<span className="text-zinc-700 dark:text-zinc-300 font-medium">
							Worked (8h = full green)
						</span>
					</button>

					<button
						type="button"
						onClick={() => toggleFilter("absent")}
						className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
							filters.absent
								? "bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-600"
								: "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
						}`}
					>
						<div
							className="w-6 h-6 rounded"
							style={{
								backgroundColor: "rgba(239, 68, 68, 0.15)",
							}}
						/>
						<span className="text-zinc-700 dark:text-zinc-300 font-medium">
							Absent (0h on working day)
						</span>
					</button>

					<button
						type="button"
						onClick={() => toggleFilter("overtime")}
						className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
							filters.overtime
								? "bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 dark:border-orange-600"
								: "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
						}`}
					>
						<div
							className="w-6 h-6 rounded"
							style={{
								backgroundColor: "rgba(251, 146, 60, 0.3)",
							}}
						/>
						<span className="text-zinc-700 dark:text-zinc-300 font-medium">
							Overtime
						</span>
					</button>

					{hasActiveFilters && (
						<button
							type="button"
							onClick={clearFilters}
							className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors border border-zinc-300 dark:border-zinc-600"
						>
							Clear Filters
						</button>
					)}
				</div>
				{exportButtons && (
					<div className="flex items-center gap-2">{exportButtons}</div>
				)}
			</div>
		</div>
	);
}
