"use server";

import {
  addHoliday,
  getAllHolidays,
  getHolidaysForDateRange,
  removeHoliday,
  toggleHoliday as toggleHolidayInDb,
} from "@/lib/db";

export async function getHolidays() {
	return await getAllHolidays();
}

export async function getHolidaysForRange(from: string, to: string) {
	return await getHolidaysForDateRange(from, to);
}

export async function addHolidayAction(date: string, name?: string) {
	try {
		await addHoliday(date, name);
		return { success: true };
	} catch (error) {
		console.error("Error adding holiday:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function removeHolidayAction(date: string) {
	try {
		await removeHoliday(date);
		return { success: true };
	} catch (error) {
		console.error("Error removing holiday:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function toggleHolidayAction(
	date: string,
	name?: string,
): Promise<{ success: boolean; isHoliday?: boolean; error?: string }> {
	try {
		const isHoliday = await toggleHolidayInDb(date, name);
		return { success: true, isHoliday };
	} catch (error) {
		console.error("Error toggling holiday:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
