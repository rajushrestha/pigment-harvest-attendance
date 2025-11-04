"use client";

import { useRef, useEffect, useState } from "react";
import { AttendanceTable } from "./AttendanceTable";
import { ExportButtons } from "./ExportButtons";
import type { TimeEntryWithOvertime } from "@/lib/timeEntriesCache";

interface AttendanceTableWithExportProps {
	allUsers: Array<{
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
	}>;
	allUsersForVisibility: Array<{
		id: number;
		name: string;
		email: string;
	}>;
	daysInMonth: Date[];
	holidaysSet: Set<string>;
	month: string;
	year: number;
	dateRangeStart: string;
	dateRangeEnd: string;
	currentUserEmail?: string | null;
}

export function AttendanceTableWithExport({
	allUsers,
	allUsersForVisibility,
	daysInMonth,
	holidaysSet,
	month,
	year,
	dateRangeStart,
	dateRangeEnd,
	currentUserEmail,
}: AttendanceTableWithExportProps) {
	const tableWrapperRef = useRef<{
		tableRef: React.RefObject<HTMLDivElement>;
		legendRef: React.RefObject<HTMLDivElement>;
	} | null>(null);
	const [refsReady, setRefsReady] = useState(false);

	// Check if refs are available after component mounts
	useEffect(() => {
		const checkRefs = () => {
			if (
				tableWrapperRef.current?.tableRef.current &&
				tableWrapperRef.current?.legendRef.current
			) {
				setRefsReady(true);
			}
		};

		// Check immediately
		checkRefs();

		// Also check after a short delay to ensure DOM is ready
		const timeout = setTimeout(checkRefs, 100);

		return () => clearTimeout(timeout);
	}, [allUsers, daysInMonth]);

		return (
		<AttendanceTable
			ref={tableWrapperRef}
			allUsers={allUsers}
			allUsersForVisibility={allUsersForVisibility}
			daysInMonth={daysInMonth}
			holidaysSet={holidaysSet}
			dateRangeStart={dateRangeStart}
			dateRangeEnd={dateRangeEnd}
			currentUserEmail={currentUserEmail}
			exportButtons={
				refsReady &&
				tableWrapperRef.current && (
					<ExportButtons
						tableRef={tableWrapperRef.current.tableRef}
						legendRef={tableWrapperRef.current.legendRef}
						month={month}
						year={year}
					/>
				)
			}
		/>
	);
}
