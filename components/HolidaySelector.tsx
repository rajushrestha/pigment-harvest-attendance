"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addHolidayAction, removeHolidayAction } from "@/lib/actions/holidays";
import {
	formatDate,
	getDaysInMonth,
	getMonthYear,
	isWeekend,
} from "@/lib/utils";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
			const promises: Promise<{ success: boolean }>[] = [];
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
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" disabled={isSaving}>
					{holidaysInMonth.size > 0
						? `${holidaysInMonth.size} holiday${holidaysInMonth.size !== 1 ? "s" : ""} this month`
						: "Select holidays"}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-96 p-0" align="start">
				<Card className="border-0 shadow-none">
					<CardHeader>
						<CardTitle className="text-sm">
							Select Holidays for{" "}
							{new Date(year, month).toLocaleDateString("en-US", {
								month: "long",
								year: "numeric",
							})}
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-0">
						<div className="grid grid-cols-7 gap-1">
							{/* Day headers - Monday first */}
							{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
								<div
									key={day}
									className="text-xs font-semibold text-center text-muted-foreground p-1"
								>
									{day}
								</div>
							))}

							{/* Empty cells for days before month start - adjusted for Monday first */}
							{Array.from({
								length: (daysInMonth[0].getDay() + 6) % 7,
							}).map((_, idx) => {
								// Create a unique key based on the month start date and offset
								// This avoids using index directly while maintaining uniqueness
								const offsetDate = new Date(year, month, -(idx + 1));
								return (
									<div
										key={`empty-${formatDate(offsetDate)}`}
										className="p-1"
									/>
								);
							})}

							{/* Calendar days */}
							{daysInMonth.map((day) => {
								const dayStr = formatDate(day);
								const isHoliday = pendingHolidays.has(dayStr);
								const isWeekendDay = isWeekend(day);
								const isToday = dayStr === formatDate(new Date());

								return (
									<Button
										key={dayStr}
										type="button"
										variant="ghost"
										onClick={() => handleToggleHoliday(day)}
										disabled={isSaving}
										size="sm"
										className={`
											p-2 text-xs h-auto
											${
												isHoliday
													? "bg-purple-200 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100 font-semibold border-2 border-purple-400 dark:border-purple-600"
													: isWeekendDay
														? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
														: ""
											}
											${isToday ? "ring-2 ring-blue-400" : ""}
										`}
										title={
											isHoliday
												? "Click to remove holiday"
												: "Click to add holiday"
										}
									>
										{day.getDate()}
									</Button>
								);
							})}
						</div>
						<div className="mt-4 pt-4 border-t">
							<div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
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
								<Button
									type="button"
									onClick={handleSave}
									disabled={isSaving || !hasChanges}
									className="flex-1"
								>
									{isSaving ? (
										<>
											<Loader2 className="animate-spin h-4 w-4 mr-2" />
											Saving...
										</>
									) : (
										"Save"
									)}
								</Button>
								<Button
									type="button"
									onClick={handleCancel}
									disabled={isSaving || !hasChanges}
									variant="secondary"
									className="flex-1"
								>
									Cancel
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</PopoverContent>
		</Popover>
	);
}
