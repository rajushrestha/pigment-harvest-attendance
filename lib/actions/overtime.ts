"use server";

import { toggleOvertime } from "@/lib/db";

export async function toggleOvertimeAction(
	entryId: number,
	dateRangeStart: string,
	dateRangeEnd: string,
	overtime: number,
): Promise<{ success: boolean; error?: string }> {
	try {
		await toggleOvertime(entryId, dateRangeStart, dateRangeEnd, overtime);
		return { success: true };
	} catch (error) {
		console.error("Error toggling overtime:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
