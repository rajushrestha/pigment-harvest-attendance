import {
	getDaysInMonth,
	isWeekend,
	formatDate,
	getMonthYear,
} from "@/lib/utils";
import { fetchUsers, type HarvestTimeEntry } from "@/lib/harvest";
import {
	fetchTimeEntries as fetchTimeEntriesWithCache,
	type TimeEntryWithOvertime,
} from "@/lib/timeEntriesCache";
import { Suspense } from "react";
import { MonthSelector } from "@/components/MonthSelector";
import { AttendanceTableWithExport } from "@/components/AttendanceTableWithExport";
import { RefetchToggle } from "@/components/RefetchToggle";
import { HolidaySelector } from "@/components/HolidaySelector";
import { RefetchRedirectHandler } from "@/components/RefetchRedirectHandler";
import { getHolidaysForRange } from "@/lib/actions/holidays";
import { getCacheInfo, getAllUserVisibility } from "@/lib/db";
import { getAuthenticatedEmail } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";

interface TimeEntryGroup {
	date: string;
	entries: TimeEntryWithOvertime[];
	totalHours: number;
	totalOvertime: number;
}

interface UserAttendance {
	userId: number;
	userName: string;
	email: string;
	dailyEntries: Map<string, TimeEntryGroup>;
}

function groupTimeEntriesByUserAndDate(
	timeEntries: TimeEntryWithOvertime[],
): Map<number, UserAttendance> {
	const userMap = new Map<number, UserAttendance>();

	for (const entry of timeEntries) {
		const userId = entry.user.id;

		if (!userMap.has(userId)) {
			userMap.set(userId, {
				userId,
				userName: entry.user.name,
				email: "", // Will be populated from users list
				dailyEntries: new Map(),
			});
		}

		const userAttendance = userMap.get(userId);
		if (!userAttendance) return userMap;

		const date = entry.spent_date;

		if (!userAttendance.dailyEntries.has(date)) {
			userAttendance.dailyEntries.set(date, {
				date,
				entries: [],
				totalHours: 0,
				totalOvertime: 0,
			});
		}

		const dayGroup = userAttendance.dailyEntries.get(date);
		if (dayGroup) {
			dayGroup.entries.push(entry);
			dayGroup.totalHours += entry.hours;
			dayGroup.totalOvertime += entry.overtime;
		}
	}

	return userMap;
}

export default async function AttendancePage({
	searchParams,
}: {
	searchParams: Promise<{
		month?: string;
		year?: string;
		refetch?: string;
	}>;
}) {
	// Check authentication
	const email = await getAuthenticatedEmail();
	if (!email) {
		redirect("/welcome");
	}

	// Handle async searchParams (Next.js 16 compatibility)
	const resolvedSearchParams = await searchParams;

	const today = new Date();
	const selectedMonth = resolvedSearchParams.month
		? parseInt(resolvedSearchParams.month)
		: today.getMonth();
	const selectedYear = resolvedSearchParams.year
		? parseInt(resolvedSearchParams.year)
		: today.getFullYear();
	const forceRefresh = resolvedSearchParams.refetch === "true";

	// Validate month and year
	const validMonth =
		Number.isNaN(selectedMonth) || selectedMonth < 0 || selectedMonth > 11
			? today.getMonth()
			: selectedMonth;
	const validYear =
		Number.isNaN(selectedYear) || selectedYear < 2000 || selectedYear > 2100
			? today.getFullYear()
			: selectedYear;

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

	const { month, year } = getMonthYear(new Date(validYear, validMonth, 1));
	const daysInMonth = getDaysInMonth(year, month);
	const monthStart = formatDate(daysInMonth[0]);
	const monthEnd = formatDate(daysInMonth[daysInMonth.length - 1]);

	// Load holidays for this month
	const holidayDates = await getHolidaysForRange(monthStart, monthEnd);
	const holidaysSet = new Set(holidayDates);

	// Debug: Log the date range being requested
	console.log(
		`Fetching time entries for ${monthNames[month]} ${year}: ${monthStart} to ${monthEnd}`,
	);

	// Fetch data from Harvest API (with caching)
	let users: Awaited<ReturnType<typeof fetchUsers>>;
	let timeEntries: Awaited<ReturnType<typeof fetchTimeEntriesWithCache>>;
	try {
		[users, timeEntries] = await Promise.all([
			fetchUsers(),
			fetchTimeEntriesWithCache(monthStart, monthEnd, forceRefresh),
		]);
		console.log(`Fetched ${timeEntries.length} time entries`);
	} catch (error: unknown) {
		return (
			<div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center w-full ">
				<h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
					Error Loading Attendance Data
				</h1>
				<p className="text-zinc-600 dark:text-zinc-400 mb-4">
					{error instanceof Error ? error.message : "An unknown error occurred"}
				</p>
				<p className="text-sm text-zinc-500 dark:text-zinc-500">
					Please check that your Harvest API credentials (HARVEST_ACCOUNT_ID and
					HARVEST_ACCESS_TOKEN) are set correctly in your environment variables.
				</p>
			</div>
		);
	}

	// Create a map of user IDs to user details
	const userMap = new Map(
		users.map((user) => [
			user.id,
			{ name: `${user.first_name} ${user.last_name}`, email: user.email },
		]),
	);

	// Group time entries by user and date
	const userAttendanceMap = groupTimeEntriesByUserAndDate(timeEntries);

	// Add user email information
	for (const [userId, attendance] of userAttendanceMap.entries()) {
		const user = userMap.get(userId);
		if (user) {
			attendance.email = user.email;
		}
	}

	// Get cache info after fetching (shows latest cache time)
	const cacheInfo = await getCacheInfo(monthStart, monthEnd);

	// Get all active users (including those without entries)
	const allActiveUsers = users.filter((user) => user.is_active);

	// Get user visibility settings
	const userVisibilityMap = await getAllUserVisibility();

	// Filter users by visibility
	const filteredUsers = allActiveUsers.filter((user) => {
		// Check if user is visible (default to true if not set)
		// Normalize email to lowercase for lookup (matching database storage)
		const normalizedEmail = user.email.toLowerCase().trim();
		const isVisible = userVisibilityMap.get(normalizedEmail) ?? true;
		if (!isVisible) {
			return false;
		}

		return true;
	});

	const allUsers = filteredUsers.map((user) => {
		const attendance = userAttendanceMap.get(user.id);
		return {
			id: user.id,
			name: `${user.first_name} ${user.last_name}`,
			email: user.email,
			attendance: attendance || {
				userId: user.id,
				userName: `${user.first_name} ${user.last_name}`,
				email: user.email,
				dailyEntries: new Map<string, TimeEntryGroup>(),
			},
		};
	});

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-black p-4 md:p-8">
			{forceRefresh && <RefetchRedirectHandler />}
			<div className="mb-6">
				<div className="flex items-start justify-between mb-4">
					<div>
						<h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-2">
							Monthly Attendance Sheet
						</h1>
						<p className="text-lg text-zinc-600 dark:text-zinc-400">
							{monthNames[month]} {year}
						</p>
					</div>
					<div className="flex items-center gap-4">
						<Suspense
							fallback={
								<div className="text-zinc-600 dark:text-zinc-400">
									Loading...
								</div>
							}
						>
							<RefetchToggle cachedAt={cacheInfo.cachedAt} />
						</Suspense>
						<LogoutButton />
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-4">
					<Suspense
						fallback={
							<div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
						}
					>
						<MonthSelector />
					</Suspense>
					<Suspense
						fallback={
							<div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
						}
					>
						<HolidaySelector
							month={month}
							year={year}
							initialHolidays={holidayDates}
						/>
					</Suspense>
				</div>
			</div>

			<AttendanceTableWithExport
				allUsers={allUsers}
				allUsersForVisibility={allActiveUsers.map((user) => ({
					id: user.id,
					name: `${user.first_name} ${user.last_name}`,
					email: user.email,
				}))}
				daysInMonth={daysInMonth}
				holidaysSet={holidaysSet}
				month={monthNames[month]}
				year={year}
				dateRangeStart={monthStart}
				dateRangeEnd={monthEnd}
			/>
		</div>
	);
}
