"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addHolidayAction, removeHolidayAction } from "@/lib/actions/holidays";
import { formatDate, getDaysInMonth, getMonthYear } from "@/lib/utils";

interface HolidaySelectorProps {
	month: number;
	year: number;
	initialHolidays: string[];
}

export function HolidaySelector({
	month,
	year,
	initialHolidays,
}: HolidaySelectorProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [holidays, setHolidays] = useState<Set<string>>(
		new Set(initialHolidays),
	);
	const [pendingHolidays, setPendingHolidays] = useState<Set<string>>(
		new Set(initialHolidays),
	);
	const [isSaving, setIsSaving] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const { month: daysMonth, year: daysYear } = getMonthYear(
		new Date(year, month, 1),
	);
	const daysInMonth = getDaysInMonth(daysYear, daysMonth);

	// Calculate date range for current month
	const monthStart = formatDate(daysInMonth[0]);
	const monthEnd = formatDate(daysInMonth[daysInMonth.length - 1]);

	// Filter holidays to only include those in the current month
	const holidaysInMonth = useMemo(() => {
		const monthHolidays = new Set<string>();
		for (const dateStr of pendingHolidays) {
			if (dateStr >= monthStart && dateStr <= monthEnd) {
				monthHolidays.add(dateStr);
			}
		}
		return monthHolidays;
	}, [pendingHolidays, monthStart, monthEnd]);

	// Sync holidays state when initialHolidays prop changes (month changes)
	useEffect(() => {
		const newHolidays = new Set(initialHolidays);
		setHolidays(newHolidays);
		setPendingHolidays(new Set(initialHolidays));
		setHasChanges(false);
	}, [initialHolidays]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleToggleHoliday = useCallback(
		(date: Date) => {
			const dateStr = formatDate(date);
			const isCurrentlyHoliday = pendingHolidays.has(dateStr);

			const newPendingHolidays = new Set(pendingHolidays);
			if (isCurrentlyHoliday) {
				newPendingHolidays.delete(dateStr);
			} else {
				newPendingHolidays.add(dateStr);
			}
			setPendingHolidays(newPendingHolidays);
			setHasChanges(true);
		},
		[pendingHolidays],
	);

	const handleSave = useCallback(async () => {
		setIsSaving(true);
		try {
			// Calculate what changed
			const toAdd = new Set<string>();
			const toRemove = new Set<string>();

			// Find holidays to add (in pending but not in saved)
			for (const date of pendingHolidays) {
				if (!holidays.has(date)) {
					toAdd.add(date);
				}
			}

			// Find holidays to remove (in saved but not in pending)
			for (const date of holidays) {
				if (!pendingHolidays.has(date)) {
					toRemove.add(date);
				}
			}

			// Apply all changes
			const promises: Promise<any>[] = [];
			for (const date of toAdd) {
				promises.push(addHolidayAction(date));
			}
			for (const date of toRemove) {
				promises.push(removeHolidayAction(date));
			}

			const results = await Promise.all(promises);
			const allSuccess = results.every((r) => r.success);

			if (allSuccess) {
				setHolidays(new Set(pendingHolidays));
				setHasChanges(false);
				// Trigger a refresh to update the table
				router.refresh();
			} else {
				console.error("Failed to save some holidays");
				// Show error message or revert
				alert("Failed to save holidays. Please try again.");
			}
		} catch (error) {
			console.error("Error saving holidays:", error);
			alert("Error saving holidays. Please try again.");
		} finally {
			setIsSaving(false);
		}
	}, [pendingHolidays, holidays, router]);

	const handleCancel = useCallback(() => {
		setPendingHolidays(new Set(holidays));
		setHasChanges(false);
	}, [holidays]);

	return (
		<div className="inline-flex items-center" ref={dropdownRef}>
			<div className="relative ml-2">
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					disabled={isSaving}
					className="px-4 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] text-left flex items-center justify-between disabled:opacity-50"
				>
					<span className="truncate">
						{holidaysInMonth.size > 0
							? `${holidaysInMonth.size} holiday${holidaysInMonth.size !== 1 ? "s" : ""} this month`
							: "Select holidays"}
					</span>
					<svg
						className={`w-4 h-4 transition-transform ${
							isOpen ? "rotate-180" : ""
						}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				{isOpen && (
					<div className="absolute top-full left-0 mt-1 w-96 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg z-50 max-h-[600px] overflow-y-auto">
						<div className="p-4">
							<h3 className="text-sm font-semibold text-black dark:text-zinc-50 mb-3">
								Select Holidays for{" "}
								{new Date(year, month).toLocaleDateString("en-US", {
									month: "long",
									year: "numeric",
								})}
							</h3>
							<div className="grid grid-cols-7 gap-1">
								{/* Day headers - Monday first */}
								{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
									(day) => (
										<div
											key={day}
											className="text-xs font-semibold text-center text-zinc-600 dark:text-zinc-400 p-1"
										>
											{day}
										</div>
									),
								)}

								{/* Empty cells for days before month start - adjusted for Monday first */}
								{Array.from({
									length: (daysInMonth[0].getDay() + 6) % 7,
								}).map((_, idx) => (
									<div key={`empty-${idx}`} className="p-1" />
								))}

								{/* Calendar days */}
								{daysInMonth.map((day) => {
									const dayStr = formatDate(day);
									const isHoliday = pendingHolidays.has(dayStr);
									const isWeekend = day.getDay() === 0 || day.getDay() === 6;
									const isToday = dayStr === formatDate(new Date());

									return (
										<button
											key={dayStr}
											type="button"
											onClick={() => handleToggleHoliday(day)}
											disabled={isSaving}
											className={`
											p-2 text-xs rounded transition-colors
											${
												isHoliday
													? "bg-purple-200 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100 font-semibold border-2 border-purple-400 dark:border-purple-600"
													: isWeekend
														? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
														: "bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
											}
											${isToday ? "ring-2 ring-blue-400" : ""}
											disabled:opacity-50 disabled:cursor-not-allowed
										`}
											title={
												isHoliday
													? "Click to remove holiday"
													: "Click to add holiday"
											}
										>
											{day.getDate()}
										</button>
									);
								})}
							</div>
							<div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
								<div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 mb-4">
									<div className="flex items-center gap-1">
										<div className="w-4 h-4 bg-purple-200 dark:bg-purple-900/40 border-2 border-purple-400 dark:border-purple-600 rounded" />
										<span>Holiday</span>
									</div>
									<div className="flex items-center gap-1">
										<div className="w-4 h-4 bg-red-50 dark:bg-red-900/20 rounded" />
										<span>Weekend</span>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={handleSave}
										disabled={isSaving || !hasChanges}
										className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
									>
										{isSaving ? (
											<>
												<svg
													className="animate-spin h-4 w-4"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
												>
													<circle
														className="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														strokeWidth="4"
													></circle>
													<path
														className="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													></path>
												</svg>
												Saving...
											</>
										) : (
											"Save"
										)}
									</button>
									<button
										type="button"
										onClick={handleCancel}
										disabled={isSaving || !hasChanges}
										className="flex-1 px-4 py-2 bg-zinc-200 hover:bg-zinc-300 disabled:bg-zinc-100 disabled:cursor-not-allowed dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:disabled:bg-zinc-800 text-black dark:text-zinc-50 rounded-lg font-medium transition-colors"
									>
										Cancel
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
