"use client";

import { useState, useCallback, useMemo } from "react";
import { TimeEntryCell } from "./TimeEntryCell";
import { TimeEntryDrawer } from "./TimeEntryDrawer";
import type { TimeEntryWithOvertime } from "@/lib/timeEntriesCache";
import { formatDate, isWeekend, parseDate } from "@/lib/utils";

interface UserRowProps {
	user: {
		id: number;
		name: string;
		email: string;
		attendance: {
			userId: number;
			userName: string;
			email: string;
			dailyEntries: Map<
				string,
				{
					date: string;
					entries: TimeEntryWithOvertime[];
					totalHours: number;
					totalOvertime: number;
				}
			>;
		};
	};
	daysInMonth: Date[];
	holidays: Set<string>;
	dateRangeStart: string;
	dateRangeEnd: string;
	filters?: {
		holiday: boolean;
		weekend: boolean;
		worked: boolean;
		absent: boolean;
		overtime?: boolean;
	};
}

export function UserRow({
	user,
	daysInMonth,
	holidays,
	dateRangeStart,
	dateRangeEnd,
	filters,
}: UserRowProps) {
	const [currentDateStr, setCurrentDateStr] = useState<string | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	// Create a map of dates with entries for navigation
	const datesWithEntries = useMemo(() => {
		const map = new Map<
			string,
			{
				date: Date;
				dateStr: string;
				entries: TimeEntryWithOvertime[];
				totalHours: number;
			}
		>();

		for (const [dateStr, dayGroup] of user.attendance.dailyEntries.entries()) {
			if (dayGroup.entries.length > 0) {
				const date = parseDate(dateStr);
				map.set(dateStr, {
					date,
					dateStr,
					entries: dayGroup.entries,
					totalHours: dayGroup.totalHours,
				});
			}
		}

		return map;
	}, [user.attendance.dailyEntries]);

	const openDrawer = useCallback((dateStr: string) => {
		setCurrentDateStr(dateStr);
		setIsDrawerOpen(true);
	}, []);

	const closeDrawer = useCallback(() => {
		setIsDrawerOpen(false);
		setCurrentDateStr(null);
	}, []);

	// Create sorted array of all dates in month for navigation
	const allDatesInMonth = useMemo(() => {
		return daysInMonth.map((day) => formatDate(day));
	}, [daysInMonth]);

	const navigateToDate = useCallback(
		(direction: "prev" | "next") => {
			if (!currentDateStr) return;

			const currentIndex = allDatesInMonth.indexOf(currentDateStr);
			if (currentIndex === -1) return;

			let newIndex: number;
			if (direction === "prev") {
				newIndex =
					currentIndex > 0 ? currentIndex - 1 : allDatesInMonth.length - 1;
			} else {
				newIndex =
					currentIndex < allDatesInMonth.length - 1 ? currentIndex + 1 : 0;
			}

			setCurrentDateStr(allDatesInMonth[newIndex]);
		},
		[currentDateStr, allDatesInMonth],
	);

	// Get current date and entry data (entry might be null if no entries)
	const currentDate = currentDateStr ? parseDate(currentDateStr) : null;
	const currentEntry = currentDateStr
		? datesWithEntries.get(currentDateStr) || null
		: null;

	const currentIndex = currentDateStr
		? allDatesInMonth.indexOf(currentDateStr)
		: -1;

	const hasPrevious = currentIndex > 0;
	const hasNext =
		currentIndex < allDatesInMonth.length - 1 && currentIndex !== -1;

	// Calculate total hours for the month
	const totalHours = useMemo(() => {
		let total = 0;
		for (const dayGroup of user.attendance.dailyEntries.values()) {
			total += dayGroup.totalHours;
		}
		return total;
	}, [user.attendance.dailyEntries]);

	// Calculate worked days based on 8 hours per day (totalHours / 8)
	const workedDays = useMemo(() => {
		return totalHours / 8;
	}, [totalHours]);

	// Calculate working days (excluding weekends and holidays)
	const workingDays = useMemo(() => {
		return daysInMonth.filter((day) => {
			const dayStr = formatDate(day);
			return !isWeekend(day) && !holidays.has(dayStr);
		}).length;
	}, [daysInMonth, holidays]);

	// Calculate total working hours (working days * 8 hours per day)
	const totalWorkingHours = workingDays * 8;

	// Calculate total overtime hours for the month
	const totalOvertime = useMemo(() => {
		let total = 0;
		for (const dayGroup of user.attendance.dailyEntries.values()) {
			total += dayGroup.totalOvertime || 0;
		}
		return total;
	}, [user.attendance.dailyEntries]);

	// Calculate regular hours (total - overtime)
	const regularHours = totalHours - totalOvertime;

	// Calculate present percentage based on regular hours (excluding OT) vs total working hours
	const presentPercentage = useMemo(() => {
		if (totalWorkingHours === 0) return 0;
		// Use regular hours (total - overtime) for percentage calculation
		return (regularHours / totalWorkingHours) * 100;
	}, [regularHours, totalWorkingHours]);

	return (
		<>
			<tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
				<td className="border border-zinc-300 dark:border-zinc-700 p-3 sticky left-0 bg-white dark:bg-zinc-900 font-medium text-black dark:text-zinc-50 z-10">
					<div>{user.name}</div>
					<div className="text-xs text-zinc-500 dark:text-zinc-400">
						{user.email}
					</div>
				</td>
				{daysInMonth.map((day) => {
					const dayStr = formatDate(day);
					const dayGroup = user.attendance.dailyEntries.get(dayStr);
					const isWeekendDay = isWeekend(day);
					const isHoliday = holidays.has(dayStr);

					return (
						<TimeEntryCell
							key={dayStr}
							dayGroup={
								dayGroup
									? {
											...dayGroup,
											totalOvertime: dayGroup.totalOvertime || 0,
										}
									: null
							}
							isWeekendDay={isWeekendDay}
							isHoliday={isHoliday}
							userName={user.name}
							userEmail={user.email}
							date={day}
							onClick={openDrawer}
							filters={filters}
						/>
					);
				})}
				{/* Separator Column */}
				<td className="border-l-2 border-l-zinc-400 dark:border-l-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 p-0 w-5"></td>
				{/* Days Column */}
				<td className="border border-zinc-300 dark:border-zinc-700 p-2 text-center bg-zinc-50 dark:bg-zinc-800/50">
					<div className="text-base font-bold text-zinc-800 dark:text-zinc-200">
						{workedDays.toFixed(1)}
					</div>
					<div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
						of {workingDays} days
					</div>
				</td>
				{/* Overtime Column */}
				<td className="border border-zinc-300 dark:border-zinc-700 p-2 text-center bg-orange-50 dark:bg-orange-900/20">
					{totalOvertime > 0 ? (
						<div className="text-base font-bold text-orange-700 dark:text-orange-400">
							{totalOvertime.toFixed(1)}H
						</div>
					) : (
						<div className="text-sm text-zinc-400 dark:text-zinc-600">-</div>
					)}
				</td>
				{/* Hours Column */}
				<td className="border border-zinc-300 dark:border-zinc-700 p-2 text-center bg-green-50 dark:bg-green-900/20">
					<div className="text-base font-bold text-green-700 dark:text-green-400">
						{totalHours.toFixed(1)}h
					</div>
					{regularHours > 0 && totalOvertime > 0 && (
						<div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
							{regularHours.toFixed(1)} reg
						</div>
					)}
				</td>
				{/* Present % Column */}
				<td className="border border-zinc-300 dark:border-zinc-700 p-2 text-center bg-blue-50 dark:bg-blue-900/20">
					<div
						className={`text-base font-bold ${
							presentPercentage >= 100
								? "text-green-600 dark:text-green-400"
								: presentPercentage >= 80
									? "text-blue-600 dark:text-blue-400"
									: presentPercentage >= 50
										? "text-yellow-600 dark:text-yellow-400"
										: "text-red-600 dark:text-red-400"
						}`}
					>
						{presentPercentage.toFixed(1)}%
					</div>
					<div className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
						{regularHours.toFixed(1)}h / {totalWorkingHours.toFixed(0)}h
					</div>
				</td>
			</tr>
			{isDrawerOpen && currentDate && (
				<TimeEntryDrawer
					isOpen={isDrawerOpen}
					onClose={closeDrawer}
					userName={user.name}
					userEmail={user.email}
					date={currentDate}
					entries={currentEntry?.entries || []}
					totalHours={currentEntry?.totalHours || 0}
					onPrevious={() => navigateToDate("prev")}
					onNext={() => navigateToDate("next")}
					hasPrevious={hasPrevious}
					hasNext={hasNext}
					dateRangeStart={dateRangeStart}
					dateRangeEnd={dateRangeEnd}
				/>
			)}
		</>
	);
}
