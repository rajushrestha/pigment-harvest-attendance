"use client";

import { useState, useCallback, useMemo } from "react";
import { type TimeEntryWithOvertime } from "@/lib/timeEntriesCache";
import { TimeEntryDrawer } from "./TimeEntryDrawer";
import { formatDate } from "@/lib/utils";

interface DateEntry {
	date: Date;
	dateStr: string;
	entries: TimeEntryWithOvertime[];
	totalHours: number;
}

interface TimeEntryDrawerProviderProps {
	children: React.ReactNode;
	userName: string;
	userEmail: string;
	datesWithEntries: Map<string, DateEntry>;
	dateRangeStart: string;
	dateRangeEnd: string;
}

export function TimeEntryDrawerProvider({
	children,
	userName,
	userEmail,
	datesWithEntries,
	dateRangeStart,
	dateRangeEnd,
}: TimeEntryDrawerProviderProps) {
	const [currentDateStr, setCurrentDateStr] = useState<string | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const openDrawer = useCallback(
		(dateStr: string) => {
			setCurrentDateStr(dateStr);
			setIsDrawerOpen(true);
		},
		[],
	);

	const closeDrawer = useCallback(() => {
		setIsDrawerOpen(false);
		setCurrentDateStr(null);
	}, []);

	const navigateToDate = useCallback(
		(direction: "prev" | "next") => {
			if (!currentDateStr) return;

			const sortedDates = Array.from(datesWithEntries.keys()).sort();
			const currentIndex = sortedDates.indexOf(currentDateStr);

			if (currentIndex === -1) return;

			let newIndex: number;
			if (direction === "prev") {
				newIndex = currentIndex > 0 ? currentIndex - 1 : sortedDates.length - 1;
			} else {
				newIndex =
					currentIndex < sortedDates.length - 1 ? currentIndex + 1 : 0;
			}

			setCurrentDateStr(sortedDates[newIndex]);
		},
		[currentDateStr, datesWithEntries],
	);

	const currentEntry = currentDateStr
		? datesWithEntries.get(currentDateStr)
		: null;

	const sortedDates = useMemo(
		() => Array.from(datesWithEntries.keys()).sort(),
		[datesWithEntries],
	);

	const currentIndex = currentDateStr
		? sortedDates.indexOf(currentDateStr)
		: -1;

	const hasPrevious = currentIndex > 0;
	const hasNext = currentIndex < sortedDates.length - 1 && currentIndex !== -1;

	return (
		<>
			{children}
			{currentEntry && (
				<TimeEntryDrawer
					isOpen={isDrawerOpen}
					onClose={closeDrawer}
					userName={userName}
					userEmail={userEmail}
					date={currentEntry.date}
					entries={currentEntry.entries}
					totalHours={currentEntry.totalHours}
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

// Export a hook to open drawer (will be used via context in the future, but for now we'll pass it as prop)
export type OpenDrawerFunction = (dateStr: string) => void;
