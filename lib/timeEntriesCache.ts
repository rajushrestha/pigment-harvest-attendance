import {
	getCachedTimeEntries,
	storeTimeEntries,
	clearCacheForDateRange,
	getCacheInfo,
} from "./db";
import type { CachedTimeEntry } from "./types";
import {
	fetchTimeEntries as fetchTimeEntriesFromAPI,
	type HarvestTimeEntry,
} from "./harvest";

export interface TimeEntryWithOvertime extends HarvestTimeEntry {
	overtime: number;
}

export async function fetchTimeEntries(
	from: string,
	to: string,
	forceRefresh: boolean = false,
): Promise<TimeEntryWithOvertime[]> {
	// Clear cache if forcing refresh
	if (forceRefresh) {
		console.log(`Force refreshing cache for ${from} to ${to}`);
		await clearCacheForDateRange(from, to);
	} else {
		// Check if we have cached data for this exact date range
		const cacheInfo = await getCacheInfo(from, to);
		if (cacheInfo.exists) {
			console.log(
				`Using cached data for ${from} to ${to} (${cacheInfo.entryCount} entries, cached at ${cacheInfo.cachedAt ? new Date(cacheInfo.cachedAt).toISOString() : "unknown"})`,
			);

			const cachedEntries = await getCachedTimeEntries(from, to);
			if (cachedEntries) {
				// Convert cached entries back to HarvestTimeEntry format with overtime
				return cachedEntries.map((entry) => ({
					id: entry.entry_id,
					spent_date: entry.spent_date,
					user: {
						id: entry.user_id,
						name: entry.user_name,
					},
					project: {
						id: entry.project_id,
						name: entry.project_name,
					},
					client: {
						id: entry.client_id,
						name: entry.client_name,
					},
					task: {
						id: entry.task_id,
						name: entry.task_name,
					},
					notes: entry.notes || "",
					hours: entry.hours,
					billable: entry.billable === 1,
					overtime: entry.overtime === 1 ? entry.hours : 0,
				}));
			}
		}
	}

	// Fetch from API
	console.log(`Fetching from Harvest API for ${from} to ${to}`);
	const entries = await fetchTimeEntriesFromAPI(from, to);

	// Store in cache
	console.log(`Caching ${entries.length} entries for ${from} to ${to}`);
	await storeTimeEntries(entries, from, to);

	// Return with overtime = 0 for new entries
	return entries.map((entry) => ({
		...entry,
		overtime: 0,
	}));
}
