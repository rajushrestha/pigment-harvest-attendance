import { eq, and, sql, gte, lte, inArray } from "drizzle-orm";
import { getDatabase, timeEntriesCache, holidays, userVisibility, type Holiday, type UserVisibility } from "./db/index";
import type { HarvestTimeEntry } from "./harvest";

export interface CachedTimeEntry {
	entry_id: number;
	spent_date: string;
	user_id: number;
	user_name: string;
	project_id: number;
	project_name: string;
	client_id: number;
	client_name: string;
	task_id: number;
	task_name: string;
	notes: string | null;
	hours: number;
	billable: number;
	overtime: number;
}

export async function storeTimeEntries(
	entries: HarvestTimeEntry[],
	dateRangeStart: string,
	dateRangeEnd: string,
): Promise<void> {
	const db = getDatabase();
	const cachedAt = Date.now();

	const values = entries.map((entry) => ({
		entryId: entry.id,
		spentDate: entry.spent_date,
		userId: entry.user.id,
		userName: entry.user.name,
		projectId: entry.project.id,
		projectName: entry.project.name,
		clientId: entry.client.id,
		clientName: entry.client.name,
		taskId: entry.task.id,
		taskName: entry.task.name,
		notes: entry.notes || null,
		hours: entry.hours,
		billable: entry.billable ? 1 : 0,
		overtime: 0, // Default to 0, will be updated via toggle
		dateRangeStart,
		dateRangeEnd,
		cachedAt,
	}));

	// Use transaction to delete existing entries first, then insert
	await db.transaction(async (tx) => {
		// Delete existing entries for this date range
		await tx
			.delete(timeEntriesCache)
			.where(
				and(
					eq(timeEntriesCache.dateRangeStart, dateRangeStart),
					eq(timeEntriesCache.dateRangeEnd, dateRangeEnd),
				),
			);

		// Insert all new entries
		if (values.length > 0) {
			await tx.insert(timeEntriesCache).values(values);
		}
	});
}

export async function getCachedTimeEntries(
	dateRangeStart: string,
	dateRangeEnd: string,
): Promise<CachedTimeEntry[] | null> {
	const db = getDatabase();

	const results = await db
		.select({
			entry_id: timeEntriesCache.entryId,
			spent_date: timeEntriesCache.spentDate,
			user_id: timeEntriesCache.userId,
			user_name: timeEntriesCache.userName,
			project_id: timeEntriesCache.projectId,
			project_name: timeEntriesCache.projectName,
			client_id: timeEntriesCache.clientId,
			client_name: timeEntriesCache.clientName,
			task_id: timeEntriesCache.taskId,
			task_name: timeEntriesCache.taskName,
			notes: timeEntriesCache.notes,
			hours: timeEntriesCache.hours,
			billable: timeEntriesCache.billable,
			overtime: timeEntriesCache.overtime,
		})
		.from(timeEntriesCache)
		.where(
			and(
				eq(timeEntriesCache.dateRangeStart, dateRangeStart),
				eq(timeEntriesCache.dateRangeEnd, dateRangeEnd),
			),
		)
		.orderBy(timeEntriesCache.spentDate, timeEntriesCache.entryId);

	if (results.length === 0) {
		return null;
	}

	return results.map((row) => ({
		entry_id: row.entry_id,
		spent_date: row.spent_date,
		user_id: row.user_id,
		user_name: row.user_name,
		project_id: row.project_id,
		project_name: row.project_name,
		client_id: row.client_id,
		client_name: row.client_name,
		task_id: row.task_id,
		task_name: row.task_name,
		notes: row.notes,
		hours: row.hours,
		billable: row.billable,
		overtime: row.overtime,
	}));
}

export async function clearCacheForDateRange(
	dateRangeStart: string,
	dateRangeEnd: string,
): Promise<void> {
	const db = getDatabase();
	await db
		.delete(timeEntriesCache)
		.where(
			and(
				eq(timeEntriesCache.dateRangeStart, dateRangeStart),
				eq(timeEntriesCache.dateRangeEnd, dateRangeEnd),
			),
		);
}

export async function getCacheInfo(
	dateRangeStart: string,
	dateRangeEnd: string,
): Promise<{
	exists: boolean;
	cachedAt: number | null;
	entryCount: number;
}> {
	const db = getDatabase();

	const result = await db
		.select({
			count: sql<number>`count(*)`.as("count"),
			cachedAt: sql<number>`max(${timeEntriesCache.cachedAt})`.as("cached_at"),
		})
		.from(timeEntriesCache)
		.where(
			and(
				eq(timeEntriesCache.dateRangeStart, dateRangeStart),
				eq(timeEntriesCache.dateRangeEnd, dateRangeEnd),
			),
		);

	const row = result[0];
	return {
		exists: (row?.count ?? 0) > 0,
		cachedAt: row?.cachedAt ?? null,
		entryCount: row?.count ?? 0,
	};
}

export async function getAllHolidays(): Promise<Holiday[]> {
	const db = getDatabase();
	return await db.select().from(holidays).orderBy(holidays.date);
}

export async function getHolidaysForDateRange(
	dateRangeStart: string,
	dateRangeEnd: string,
): Promise<string[]> {
	const db = getDatabase();
	const results = await db
		.select({ date: holidays.date })
		.from(holidays)
		.where(
			and(
				gte(holidays.date, dateRangeStart),
				lte(holidays.date, dateRangeEnd),
			),
		)
		.orderBy(holidays.date);

	return results.map((row) => row.date);
}

export async function isHoliday(date: string): Promise<boolean> {
	const db = getDatabase();
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(holidays)
		.where(eq(holidays.date, date));

	return (result[0]?.count ?? 0) > 0;
}

export async function addHoliday(date: string, name?: string): Promise<void> {
	const db = getDatabase();
	const now = Date.now();

	// Check if holiday exists to preserve created_at
	const existing = await db
		.select({ createdAt: holidays.createdAt })
		.from(holidays)
		.where(eq(holidays.date, date))
		.limit(1);

	const createdAt = existing[0]?.createdAt ?? now;

	await db
		.insert(holidays)
		.values({
			date,
			name: name || null,
			createdAt,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: holidays.date,
			set: {
				name: name || null,
				updatedAt: now,
			},
		});
}

export async function removeHoliday(date: string): Promise<void> {
	const db = getDatabase();
	await db.delete(holidays).where(eq(holidays.date, date));
}

export async function toggleHoliday(
	date: string,
	name?: string,
): Promise<boolean> {
	const isCurrentlyHoliday = await isHoliday(date);

	if (isCurrentlyHoliday) {
		await removeHoliday(date);
		return false;
	} else {
		await addHoliday(date, name);
		return true;
	}
}

export async function toggleOvertime(
	entryId: number,
	dateRangeStart: string,
	dateRangeEnd: string,
	overtime: number,
): Promise<void> {
	const db = getDatabase();
	await db
		.update(timeEntriesCache)
		.set({ overtime })
		.where(
			and(
				eq(timeEntriesCache.entryId, entryId),
				eq(timeEntriesCache.dateRangeStart, dateRangeStart),
				eq(timeEntriesCache.dateRangeEnd, dateRangeEnd),
			),
		);
}

// User visibility functions
export async function getUserVisibility(userEmail: string): Promise<boolean> {
	const db = getDatabase();
	const result = await db
		.select({ isVisible: userVisibility.isVisible })
		.from(userVisibility)
		.where(eq(userVisibility.userEmail, userEmail.toLowerCase().trim()))
		.limit(1);

	// Default to visible if not found
	return result[0]?.isVisible === 1 ? true : true;
}

export async function getAllUserVisibility(): Promise<Map<string, boolean>> {
	const db = getDatabase();
	const results = await db.select().from(userVisibility);

	const visibilityMap = new Map<string, boolean>();
	for (const row of results) {
		visibilityMap.set(row.userEmail, row.isVisible === 1);
	}

	return visibilityMap;
}

export async function setUserVisibility(userEmail: string, isVisible: boolean): Promise<void> {
	const db = getDatabase();
	const now = Date.now();

	await db
		.insert(userVisibility)
		.values({
			userEmail: userEmail.toLowerCase().trim(),
			isVisible: isVisible ? 1 : 0,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: userVisibility.userEmail,
			set: {
				isVisible: isVisible ? 1 : 0,
				updatedAt: now,
			},
		});
}

export async function toggleUserVisibility(userEmail: string): Promise<boolean> {
	const currentVisibility = await getUserVisibility(userEmail);
	const newVisibility = !currentVisibility;
	await setUserVisibility(userEmail, newVisibility);
	return newVisibility;
}

export async function setMultipleUserVisibility(visibilities: Array<{ email: string; isVisible: boolean }>): Promise<void> {
	const db = getDatabase();
	const now = Date.now();

	await db.transaction(async (tx) => {
		for (const { email, isVisible } of visibilities) {
			await tx
				.insert(userVisibility)
				.values({
					userEmail: email.toLowerCase().trim(),
					isVisible: isVisible ? 1 : 0,
					updatedAt: now,
				})
				.onConflictDoUpdate({
					target: userVisibility.userEmail,
					set: {
						isVisible: isVisible ? 1 : 0,
						updatedAt: now,
					},
				});
		}
	});
}
