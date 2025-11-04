"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { toggleOvertimeAction } from "@/lib/actions/overtime";
import type { TimeEntryWithOvertime } from "@/lib/timeEntriesCache";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
	const [localEntries, setLocalEntries] =
		useState<TimeEntryWithOvertime[]>(entries);

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

	const handleToggleOvertime = async (
		entryId: number,
		currentOvertime: number,
	) => {
		setUpdatingEntryId(entryId);
		try {
			const newOvertime = currentOvertime > 0 ? 0 : 1;
			const result = await toggleOvertimeAction(
				entryId,
				dateRangeStart,
				dateRangeEnd,
				newOvertime,
			);

			if (result.success) {
				// Update local state
				setLocalEntries((prev) =>
					prev.map((entry) =>
						entry.id === entryId
							? { ...entry, overtime: newOvertime > 0 ? entry.hours : 0 }
							: entry,
					),
				);
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

	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent
				side="right"
				className="w-full sm:max-w-xl flex flex-col p-0"
			>
				<SheetHeader className="px-6 py-4 border-b">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<SheetTitle>Time Entries</SheetTitle>
							<SheetDescription asChild>
								<div className="mt-2 space-y-1">
									<div className="flex flex-row gap-2 items-center">
										<span className="text-sm font-medium">{userName}</span>
										<span className="text-xs text-muted-foreground lowercase">
											({userEmail})
										</span>
									</div>
									<div className="text-sm">
										{date.toLocaleDateString("en-US", {
											weekday: "long",
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</div>
									{totalHours > 0 && (
										<div className="text-sm font-semibold text-green-700 dark:text-green-400">
											Total: {totalHours.toFixed(1)} hours
										</div>
									)}
								</div>
							</SheetDescription>
						</div>
						<div className="flex items-center gap-2">
							{/* Navigation arrows */}
							{(onPrevious || onNext) && (
								<div className="flex items-center gap-2 mr-4">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={onPrevious}
										disabled={!hasPrevious}
										aria-label="Previous date"
									>
										<ChevronLeft className="h-6 w-6" />
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={onNext}
										disabled={!hasNext}
										aria-label="Next date"
									>
										<ChevronRight className="h-6 w-6" />
									</Button>
								</div>
							)}
						</div>
					</div>
				</SheetHeader>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					{entries.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-center">
							<Clock className="w-16 h-16 text-muted-foreground mb-4" />
							<p className="text-lg font-medium text-muted-foreground">
								No time entries for this date
							</p>
							<p className="text-sm text-muted-foreground mt-1">
								Use navigation arrows to view other dates
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{localEntries.map((entry) => {
								const isOvertime = entry.overtime > 0;
								const isUpdating = updatingEntryId === entry.id;

								return (
									<Card key={entry.id}>
										<CardContent>
											<div className="flex items-start justify-between mb-3">
												<div className="flex-1">
													<h3 className="text-lg font-semibold mb-1">
														{entry.project.name}
													</h3>
													<div className="flex flex-col sm:flex-row flex-wrap gap-4 text-sm">
														<div className="text-muted-foreground">
															<span className="font-medium">Client:</span>{" "}
															{entry.client.name}
														</div>
														<div className="text-muted-foreground">
															<span className="font-medium">Task:</span>{" "}
															{entry.task.name}
														</div>
														<div className="text-muted-foreground">
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
													<label
														htmlFor={`overtime-${entry.id}`}
														className="flex items-center gap-2 cursor-pointer"
													>
														<Checkbox
															id={`overtime-${entry.id}`}
															checked={isOvertime}
															onCheckedChange={() =>
																handleToggleOvertime(entry.id, entry.overtime)
															}
															disabled={isUpdating}
														/>
														<span className="text-sm font-medium">
															{isUpdating ? (
																<span className="flex items-center gap-1">
																	<Loader2 className="animate-spin h-3 w-3" />
																	Updating...
																</span>
															) : (
																"Overtime"
															)}
														</span>
													</label>
												</div>
											</div>
											{entry.notes && (
												<div className="mt-3 pt-3 border-t">
													<p className="text-sm text-muted-foreground italic">
														{entry.notes}
													</p>
												</div>
											)}
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
