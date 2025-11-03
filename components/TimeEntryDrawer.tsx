"use client";

import { type TimeEntryWithOvertime } from "@/lib/timeEntriesCache";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toggleOvertimeAction } from "@/lib/actions/overtime";
import { useRouter } from "next/navigation";

interface TimeEntryDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	userName: string;
	userEmail: string;
	date: Date;
	entries: TimeEntryWithOvertime[];
	totalHours: number;
	onPrevious?: () => void;
	onNext?: () => void;
	hasPrevious?: boolean;
	hasNext?: boolean;
	dateRangeStart: string;
	dateRangeEnd: string;
}

export function TimeEntryDrawer({
	isOpen,
	onClose,
	userName,
	userEmail,
	date,
	entries,
	totalHours,
	onPrevious,
	onNext,
	hasPrevious = false,
	hasNext = false,
	dateRangeStart,
	dateRangeEnd,
}: TimeEntryDrawerProps) {
	const router = useRouter();
	const [updatingEntryId, setUpdatingEntryId] = useState<number | null>(null);
	const [localEntries, setLocalEntries] = useState<TimeEntryWithOvertime[]>(entries);

	// Sync local entries when entries prop changes
	useEffect(() => {
		setLocalEntries(entries);
	}, [entries]);
	// Handle escape key and arrow keys
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isOpen) return;

			if (e.key === "Escape") {
				onClose();
			} else if (e.key === "ArrowLeft" && onPrevious && hasPrevious) {
				onPrevious();
			} else if (e.key === "ArrowRight" && onNext && hasNext) {
				onNext();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose, onPrevious, onNext, hasPrevious, hasNext]);

	const handleToggleOvertime = async (entryId: number, currentOvertime: number) => {
		setUpdatingEntryId(entryId);
		try {
			const newOvertime = currentOvertime > 0 ? 0 : 1;
			const result = await toggleOvertimeAction(entryId, dateRangeStart, dateRangeEnd, newOvertime);

			if (result.success) {
				// Update local state
				setLocalEntries(prev => prev.map(entry =>
					entry.id === entryId
						? { ...entry, overtime: newOvertime > 0 ? entry.hours : 0 }
						: entry
				));
				// Refresh the page to update the table
				router.refresh();
			} else {
				console.error("Failed to toggle overtime:", result.error);
			}
		} catch (error) {
			console.error("Error toggling overtime:", error);
		} finally {
			setUpdatingEntryId(null);
		}
	};

	if (!isOpen) return null;

	const drawerContent = (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/50 z-40 transition-opacity"
				onClick={onClose}
			/>
			{/* Drawer */}
			<div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-zinc-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0">
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
						<div className="flex-1">
							<h2 className="text-2xl font-bold text-black dark:text-zinc-50">
								Time Entries
							</h2>
							<div className="mt-2 space-y-1">
								<div className="flex flex-row gap-2 items-center">
									<p className="text-sm font-medium text-black dark:text-zinc-50">
										{userName}
									</p>
									<p className="text-xs text-zinc-600 dark:text-zinc-400 lowercase">
										({userEmail})
									</p>
								</div>
								<p className="text-sm text-zinc-600 dark:text-zinc-400">
									{date.toLocaleDateString("en-US", {
										weekday: "long",
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
								{totalHours > 0 && (
									<p className="text-sm font-semibold text-green-700 dark:text-green-400">
										Total: {totalHours.toFixed(1)} hours
									</p>
								)}
							</div>
						</div>
						<div className="flex items-center gap-2">
							{/* Navigation arrows */}
							{(onPrevious || onNext) && (
								<div className="flex items-center gap-2 mr-4">
									<button
										type="button"
										onClick={onPrevious}
										disabled={!hasPrevious}
										className={`p-2 rounded-lg transition-colors ${
											hasPrevious
												? "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-zinc-50"
												: "text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
										}`}
										aria-label="Previous date"
									>
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 19l-7-7 7-7"
											/>
										</svg>
									</button>
									<button
										type="button"
										onClick={onNext}
										disabled={!hasNext}
										className={`p-2 rounded-lg transition-colors ${
											hasNext
												? "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-black dark:text-zinc-50"
												: "text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
										}`}
										aria-label="Next date"
									>
										<svg
											className="w-6 h-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</button>
								</div>
							)}
							{/* Close button */}
							<button
								type="button"
								onClick={onClose}
								className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
								aria-label="Close drawer"
							>
								<svg
									className="w-6 h-6 text-black dark:text-zinc-50"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					</div>

					{/* Content */}
					<div className="flex-1 overflow-y-auto p-6">
						{entries.length === 0 ? (
							<div className="flex flex-col items-center justify-center h-full text-center">
								<div className="text-zinc-400 dark:text-zinc-600 mb-2">
									<svg
										className="w-16 h-16 mx-auto"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
									No time entries for this date
								</p>
								<p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
									Use navigation arrows to view other dates
								</p>
							</div>
						) : (
							<div className="space-y-4">
								{localEntries.map((entry) => {
									const isOvertime = entry.overtime > 0;
									const isUpdating = updatingEntryId === entry.id;

									return (
										<div
											key={entry.id}
											className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800"
										>
											<div className="flex items-start justify-between mb-3">
												<div className="flex-1">
													<h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-1">
														{entry.project.name}
													</h3>
													<div className="flex flex-row flex-wrap gap-6 text-sm">
														<div className="text-zinc-600 dark:text-zinc-400">
															<span className="font-medium">Client:</span>{" "}
															{entry.client.name}
														</div>
														<div className="text-zinc-600 dark:text-zinc-400">
															<span className="font-medium">Task:</span>{" "}
															{entry.task.name}
														</div>
														<div className="text-zinc-600 dark:text-zinc-400">
															<span className="font-medium">Hours:</span>{" "}
															{entry.hours.toFixed(1)}h
															{entry.billable && (
																<span className="ml-2 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
																	Billable
																</span>
															)}
														</div>
													</div>
												</div>
												<div className="flex items-center gap-2 ml-4">
													<label className="flex items-center gap-2 cursor-pointer">
														<input
															type="checkbox"
															checked={isOvertime}
															onChange={() => handleToggleOvertime(entry.id, entry.overtime)}
															disabled={isUpdating}
															className="w-4 h-4 text-orange-600 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 rounded focus:ring-orange-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
														/>
														<span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
															{isUpdating ? "Updating..." : "Overtime"}
														</span>
													</label>
												</div>
											</div>
											{entry.notes && (
												<div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
													<p className="text-sm text-zinc-600 dark:text-zinc-400 italic">
														{entry.notes}
													</p>
												</div>
											)}
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);

	// Render drawer using portal to document.body to avoid hydration issues
	return typeof window !== "undefined"
		? createPortal(drawerContent, document.body)
		: null;
}
