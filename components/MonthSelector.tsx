"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { UserFilter } from "./UserFilter";

const monthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

interface MonthSelectorProps {
	users: Array<{ id: number; name: string; email: string }>;
}

export function MonthSelector({ users }: MonthSelectorProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const today = new Date();
	const currentMonth = searchParams.get("month")
		? parseInt(searchParams.get("month")!)
		: today.getMonth();
	const currentYear = searchParams.get("year")
		? parseInt(searchParams.get("year")!)
		: today.getFullYear();

	const handleMonthChange = (month: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("month", month.toString());
		params.set("year", currentYear.toString());
		router.push(`?${params.toString()}`);
	};

	const handleYearChange = (year: number) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("month", currentMonth.toString());
		params.set("year", year.toString());
		router.push(`?${params.toString()}`);
	};

	// Generate year options (current year ± 2 years)
	const currentYearNum = today.getFullYear();
	const years = Array.from({ length: 5 }, (_, i) => currentYearNum - 2 + i);

	return (
		<div className="flex items-center gap-3 flex-wrap">
			<select
				value={currentMonth}
				onChange={(e) => handleMonthChange(parseInt(e.target.value))}
				className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				{monthNames.map((month, index) => (
					<option key={index} value={index}>
						{month}
					</option>
				))}
			</select>

			<select
				value={currentYear}
				onChange={(e) => handleYearChange(parseInt(e.target.value))}
				className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
			>
				{years.map((year) => (
					<option key={year} value={year}>
						{year}
					</option>
				))}
			</select>

			<UserFilter users={users} />
		</div>
	);
}
