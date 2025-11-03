"use client";

import type { HarvestTimeEntry } from "@/lib/harvest";
import { formatDate } from "@/lib/utils";

interface TimeEntryCellProps {
	dayGroup: {
		date: string;
		entries: any[];
		totalHours: number;
		totalOvertime?: number;
	} | null;
	isWeekendDay: boolean;
	isHoliday: boolean;
	userName: string;
	userEmail: string;
	date: Date;
	onClick: (dateStr: string) => void;
	filters?: {
		holiday: boolean;
		weekend: boolean;
		worked: boolean;
		absent: boolean;
		overtime?: boolean;
	};
}

export function TimeEntryCell({
	dayGroup,
	isWeekendDay,
	isHoliday,
	date,
	onClick,
	filters,
}: TimeEntryCellProps) {
	const handleClick = () => {
		// Allow clicking on any date, even if it has no entries
		onClick(formatDate(date));
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTableCellElement>) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onClick(formatDate(date));
		}
	};

	// Calculate work percentage for this day (based on 8 hours per day)
	const dayWorkPercentage =
		dayGroup && dayGroup.totalHours > 0
			? Math.min((dayGroup.totalHours / 8) * 100, 100)
			: 0;

	// Only apply green background for non-weekend, non-holiday days with entries
	const shouldShowGreenBackground =
		!isWeekendDay && !isHoliday && dayGroup && dayGroup.totalHours > 0;

	// Show light red for days with 0 hours that are not weekend or holiday (absent/not working)
	const shouldShowAbsentBackground =
		!isWeekendDay && !isHoliday && (!dayGroup || dayGroup.totalHours === 0);

	// Calculate overtime hours
	const overtimeHours = dayGroup?.totalOvertime || 0;
	const regularHours =
		dayGroup && dayGroup.totalHours > 0
			? dayGroup.totalHours - overtimeHours
			: 0;
	const hasOvertime = overtimeHours > 0;

	// Check if this cell should be highlighted based on filters (including overtime)
	const isHighlighted =
		filters &&
		((filters.holiday && isHoliday) ||
			(filters.weekend && isWeekendDay) ||
			(filters.worked && shouldShowGreenBackground) ||
			(filters.absent && shouldShowAbsentBackground) ||
			(filters.overtime && hasOvertime));

	// Determine which filter type is active for this cell (for color matching)
	const getHighlightColor = () => {
		if (!filters || !isHighlighted) return null;
		if (filters.holiday && isHoliday) return "purple";
		if (filters.weekend && isWeekendDay) return "red";
		if (filters.worked && shouldShowGreenBackground) return "green";
		if (filters.absent && shouldShowAbsentBackground) return "red";
		if (filters.overtime && hasOvertime) return "orange";
		return null;
	};

	// Get default background color class for weekends and holidays (when not showing green or absent)
	const getDefaultBackgroundClass = () => {
		if (shouldShowGreenBackground || shouldShowAbsentBackground) {
			return ""; // Will use inline style for green or red
		}
		if (isHoliday) {
			return "bg-purple-100 dark:bg-purple-900/30";
		}
		if (isWeekendDay) {
			return "bg-red-50 dark:bg-red-900/20";
		}
		return "bg-white dark:bg-zinc-900";
	};

	// Always use normal border width to prevent layout shift
	// Use outline for highlighting instead of border
	const getBorderClass = () => {
		// Holiday cells have normal border unless filter is active
		if (isHoliday && !isHighlighted) {
			return "border border-purple-300 dark:border-purple-700";
		}
		return "border border-zinc-300 dark:border-zinc-700";
	};

	// Get outline style for highlighting (doesn't affect layout)
	const getHighlightStyle = () => {
		const highlightColor = getHighlightColor();
		if (!highlightColor) return {};

		// Use outline with matching legend colors (darker versions)
		const outlineColors = {
			purple: "rgb(192, 132, 252)", // purple-400 (matches legend border)
			red: "rgb(248, 113, 113)", // red-400 (matches legend border)
			green: "rgb(74, 222, 128)", // green-400 (matches legend border)
			orange: "rgb(251, 146, 60)", // orange-400 (for overtime)
		};

		return {
			outline: `2px solid ${outlineColors[highlightColor as keyof typeof outlineColors]}`,
			outlineOffset: "-2px",
		};
	};

	const highlightStyle = getHighlightStyle();
	const backgroundColorStyle =
		hasOvertime && !isHoliday && !isWeekendDay
			? {
					backgroundColor: `rgba(251, 146, 60, ${Math.min(((overtimeHours / 8) * 100) / 100, 0.3)})`,
				}
			: shouldShowGreenBackground
				? {
						backgroundColor: `rgba(34, 197, 94, ${Math.min(dayWorkPercentage / 100, 0.3)})`,
					}
				: shouldShowAbsentBackground
					? {
							backgroundColor: "rgba(239, 68, 68, 0.15)",
						}
					: {};

	return (
		<td
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			aria-label={`Time entries for ${formatDate(date)}`}
			className={`${getBorderClass()} p-2 text-center text-sm ${getDefaultBackgroundClass()} cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all ${
				isHighlighted ? "z-20 relative" : ""
			}`}
			style={{
				...backgroundColorStyle,
				...highlightStyle,
			}}
		>
			{dayGroup && dayGroup.entries.length > 0 ? (
				<div className="font-semibold">
					{regularHours > 0 && (
						<div className="text-green-700 dark:text-green-400">
							{regularHours.toFixed(1)}H
						</div>
					)}
					{hasOvertime && (
						<div className="text-orange-600 dark:text-orange-400 mt-0.5">
							+ OT {overtimeHours.toFixed(1)}H
						</div>
					)}
				</div>
			) : (
				<span className="text-zinc-400 dark:text-zinc-600">-</span>
			)}
		</td>
	);
}
