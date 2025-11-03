"use server";

import {
	getAllUserVisibility,
	setMultipleUserVisibility,
	type UserVisibility,
} from "@/lib/db";

export async function getAllUserVisibilityAction(): Promise<Map<string, boolean>> {
	return await getAllUserVisibility();
}

export async function updateUserVisibilityAction(
	visibilities: Array<{ email: string; isVisible: boolean }>,
): Promise<{ success: boolean; error?: string }> {
	try {
		await setMultipleUserVisibility(visibilities);
		return { success: true };
	} catch (error) {
		console.error("Error updating user visibility:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
