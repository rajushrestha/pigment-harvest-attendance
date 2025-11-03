"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
	getAllUserVisibilityAction,
	updateUserVisibilityAction,
} from "@/lib/actions/user-visibility";

interface User {
	id: number;
	name: string;
	email: string;
}

interface UserVisibilityRowProps {
	users: User[];
	daysInMonth: Date[];
	onVisibilityChange?: () => void;
}

export function UserVisibilityRow({
	users,
	daysInMonth,
	onVisibilityChange,
}: UserVisibilityRowProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [visibilityMap, setVisibilityMap] = useState<Map<string, boolean>>(
		new Map(),
	);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [mounted, setMounted] = useState(false);

	const loadVisibility = useCallback(async () => {
		setIsLoading(true);
		try {
			const visibilities = await getAllUserVisibilityAction();
			setVisibilityMap(visibilities);
		} catch (error) {
			console.error("Error loading visibility:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		setMounted(true);
		loadVisibility();
	}, [loadVisibility]);

	const handleToggle = (email: string) => {
		const newMap = new Map(visibilityMap);
		const normalizedEmail = email.toLowerCase().trim();
		const current = newMap.get(normalizedEmail) ?? true; // Default to visible
		newMap.set(normalizedEmail, !current);
		setVisibilityMap(newMap);
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const visibilities = Array.from(visibilityMap.entries()).map(
				([email, isVisible]) => ({
					email: email.toLowerCase().trim(),
					isVisible,
				}),
			);

			// Also include users that aren't in the map yet (default to visible)
			for (const user of users) {
				const normalizedEmail = user.email.toLowerCase().trim();
				if (!visibilityMap.has(normalizedEmail)) {
					visibilities.push({ email: normalizedEmail, isVisible: true });
				}
			}

			const result = await updateUserVisibilityAction(visibilities);
			if (result.success) {
				setIsDialogOpen(false);
				onVisibilityChange?.();
			}
		} catch (error) {
			console.error("Error saving visibility:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const visibleCount = users.filter((user) => {
		const normalizedEmail = user.email.toLowerCase().trim();
		const isVisible = visibilityMap.get(normalizedEmail) ?? true; // Default to visible
		return isVisible;
	}).length;
	const totalCount = users.length;

	return (
		<>
			<tr className="bg-zinc-50 dark:bg-zinc-800/50 border-t-2 border-zinc-400 dark:border-zinc-600">
				<td className="border border-zinc-300 dark:border-zinc-700 p-3 sticky left-0 bg-zinc-50 dark:bg-zinc-800/50 z-10">
					<button
						type="button"
						onClick={() => setIsDialogOpen(true)}
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex flex-col items-center"
					>
						Show/Hide Users
						{!isLoading && (
							<span className="text-xs opacity-75">
								({visibleCount}/{totalCount} visible)
							</span>
						)}
					</button>
				</td>
				{/* Empty cells for date columns */}
				{daysInMonth.map((day) => (
					<td
						key={formatDate(day)}
						className="border border-zinc-300 dark:border-zinc-700 p-2 bg-zinc-50 dark:bg-zinc-800/50"
					></td>
				))}
				{/* Separator */}
				<td className="border-l-2 border-l-zinc-400 dark:border-l-zinc-600 bg-zinc-50 dark:bg-zinc-800/50 p-0"></td>
				{/* Empty cells for total columns */}
				<td className="border border-zinc-300 dark:border-zinc-700 p-2 bg-zinc-50 dark:bg-zinc-800/50"></td>
				<td className="border border-zinc-300 dark:border-zinc-700 p-2 bg-zinc-50 dark:bg-zinc-800/50"></td>
				<td className="border border-zinc-300 dark:border-zinc-700 p-2 bg-zinc-50 dark:bg-zinc-800/50"></td>
				<td className="border border-zinc-300 dark:border-zinc-700 p-2 bg-zinc-50 dark:bg-zinc-800/50"></td>
			</tr>

			{mounted &&
				isDialogOpen &&
				createPortal(
					<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
						<div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
							<div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
								<h2 className="text-xl font-bold text-black dark:text-zinc-50">
									Show/Hide Users
								</h2>
								<p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
									Toggle visibility for users in the attendance table
								</p>
							</div>

							<div className="p-6 overflow-y-auto flex-1">
								{isLoading ? (
									<div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
										Loading...
									</div>
								) : (
									<div className="space-y-2">
										{users.map((user) => {
											const normalizedEmail = user.email.toLowerCase().trim();
											const isVisible =
												visibilityMap.get(normalizedEmail) ?? true;
											return (
												<label
													key={user.id}
													className="flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700"
												>
													<input
														type="checkbox"
														checked={isVisible}
														onChange={() => handleToggle(user.email)}
														className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
													/>
													<div className="flex-1 min-w-0">
														<div className="text-sm font-medium text-black dark:text-zinc-50">
															{user.name}
														</div>
														<div className="text-xs text-zinc-600 dark:text-zinc-400">
															{user.email}
														</div>
													</div>
													<div
														className={`px-2 py-1 rounded text-xs font-medium ${
															isVisible
																? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
																: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
														}`}
													>
														{isVisible ? "Visible" : "Hidden"}
													</div>
												</label>
											);
										})}
									</div>
								)}
							</div>

							<div className="p-6 border-t border-zinc-200 dark:border-zinc-700 flex gap-3 justify-end">
								<button
									type="button"
									onClick={() => setIsDialogOpen(false)}
									disabled={isSaving}
									className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={handleSave}
									disabled={isSaving}
									className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
								>
									{isSaving ? (
										<>
											<svg
												className="animate-spin h-4 w-4"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												aria-label="Loading"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
											Saving...
										</>
									) : (
										"Save Changes"
									)}
								</button>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}

function formatDate(date: Date): string {
	return date.toISOString().split("T")[0];
}
