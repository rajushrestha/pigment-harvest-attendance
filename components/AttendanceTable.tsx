"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { UserRow } from "./UserRow";
import { UserVisibilityRow } from "./UserVisibilityRow";
import { Legend } from "./Legend";
import { formatDate, isWeekend } from "@/lib/utils";
import type { HarvestTimeEntry } from "@/lib/harvest";

interface AttendanceTableProps {
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
					entries: any[];
					totalHours: number;
					totalOvertime?: number;
				}
			>;
		};
	}>;
	daysInMonth: Date[];
	holidaysSet: Set<string>;
	dateRangeStart: string;
	dateRangeEnd: string;
	exportButtons?: React.ReactNode;
}

export const AttendanceTable = forwardRef<
	{
		tableRef: React.RefObject<HTMLDivElement>;
		legendRef: React.RefObject<HTMLDivElement>;
	},
	AttendanceTableProps
>(
	(
		{
			allUsers,
			allUsersForVisibility,
			daysInMonth,
			holidaysSet,
			dateRangeStart,
			dateRangeEnd,
			exportButtons,
		},
		ref,
	) => {
		const [filters, setFilters] = useState({
			holiday: false,
			weekend: false,
			worked: false,
			absent: false,
			overtime: false,
		});

		const tableRef = useRef<HTMLDivElement>(null);
		const legendRef = useRef<HTMLDivElement>(null);

		useImperativeHandle(ref, () => ({
			tableRef,
			legendRef,
		}));

		return (
			<>
				<div className="overflow-x-auto" ref={tableRef}>
					<table className="w-full border-collapse">
						<thead>
							<tr className="bg-zinc-100 dark:bg-zinc-800">
								<th className="border border-zinc-300 dark:border-zinc-700 p-3 text-left font-semibold text-black dark:text-zinc-50 sticky left-0 bg-zinc-100 dark:bg-zinc-800 z-10 min-w-[200px]">
									Name
								</th>
								{daysInMonth.map((day) => {
									const dayStr = formatDate(day);
									const isWeekendDay = isWeekend(day);
									const isHoliday = holidaysSet.has(dayStr);
									return (
										<th
											key={dayStr}
											className={`border border-zinc-300 dark:border-zinc-700 p-2 text-center font-semibold text-sm ${
												isHoliday
													? "bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 border-purple-400 dark:border-purple-600"
													: isWeekendDay
														? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
														: "text-black dark:text-zinc-50"
											}`}
											style={{ minWidth: "80px" }}
										>
											<div>{day.getDate()}</div>
											<div className="text-xs font-normal opacity-70">
												{day.toLocaleDateString("en-US", {
													weekday: "short",
												})}
											</div>
										</th>
									);
								})}
								{/* Separator Column */}
								<th className="border-l-2 border-l-zinc-400 dark:border-l-zinc-600 bg-zinc-100 dark:bg-zinc-800 min-w-[20px] p-0"></th>
								<th className="border border-zinc-300 dark:border-zinc-700 p-2 text-center font-semibold text-sm text-black dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 min-w-[85px]">
									Days
								</th>
								<th className="border border-zinc-300 dark:border-zinc-700 p-2 text-center font-semibold text-sm text-black dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 min-w-[75px]">
									OT
								</th>
								<th className="border border-zinc-300 dark:border-zinc-700 p-2 text-center font-semibold text-sm text-black dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 min-w-[85px]">
									Hours
								</th>
								<th className="border border-zinc-300 dark:border-zinc-700 p-2 text-center font-semibold text-sm text-black dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 min-w-[95px]">
									Present %
								</th>
							</tr>
						</thead>
						<tbody>
							{allUsers.map((user) => (
								<UserRow
									key={user.id}
									user={user}
									daysInMonth={daysInMonth}
									holidays={holidaysSet}
									dateRangeStart={dateRangeStart}
									dateRangeEnd={dateRangeEnd}
									filters={filters}
								/>
							))}
							<UserVisibilityRow
								users={allUsersForVisibility}
								daysInMonth={daysInMonth}
								onVisibilityChange={() => {
									// Trigger a page refresh to update visible users
									window.location.reload();
								}}
							/>
						</tbody>
					</table>
				</div>

				<div ref={legendRef}>
					<Legend onFilterChange={setFilters} exportButtons={exportButtons} />
				</div>
			</>
		);
	},
);

AttendanceTable.displayName = "AttendanceTable";
