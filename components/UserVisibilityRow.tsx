"use client";

import { useState, useEffect, useCallback } from "react";
import {
	getAllUserVisibilityAction,
	updateUserVisibilityAction,
} from "@/lib/actions/user-visibility";
import { isSuperAdmin } from "@/lib/allowed-emails";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface User {
	id: number;
	name: string;
	email: string;
}

interface UserVisibilityButtonProps {
	users: User[];
	currentUserEmail?: string | null;
	onVisibilityChange?: () => void;
}

export function UserVisibilityButton({
	users,
	currentUserEmail,
	onVisibilityChange,
}: UserVisibilityButtonProps) {
	const isSuperAdminUser = currentUserEmail
		? isSuperAdmin(currentUserEmail)
		: false;
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [visibilityMap, setVisibilityMap] = useState<Map<string, boolean>>(
		new Map(),
	);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

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
				// Reload page to update visible users
				if (typeof window !== "undefined") {
					window.location.reload();
				}
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

	if (!isSuperAdminUser) return null;

	return (
		<>
			<Button
				type="button"
				onClick={() => setIsDialogOpen(true)}
				variant="outline"
			>
				Show/Hide Users
				{!isLoading && (
					<span className="text-xs opacity-75 ml-2">
						({visibleCount}/{totalCount} visible)
					</span>
				)}
			</Button>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
					<DialogHeader>
						<DialogTitle>Show/Hide Users</DialogTitle>
						<DialogDescription>
							Toggle visibility for users in the attendance table
						</DialogDescription>
					</DialogHeader>

					<div className="flex-1 overflow-y-auto p-6">
						{isLoading ? (
							<div className="text-center py-8 text-muted-foreground">
								<Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
								Loading...
							</div>
						) : (
							<div className="space-y-2">
								{users.map((user) => {
									const normalizedEmail = user.email.toLowerCase().trim();
									const isVisible = visibilityMap.get(normalizedEmail) ?? true;
									return (
										<div
											key={user.id}
											className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer border"
										>
											<Checkbox
												id={`user-${user.id}`}
												checked={isVisible}
												onCheckedChange={() => handleToggle(user.email)}
											/>
											<label
												htmlFor={`user-${user.id}`}
												className="flex-1 min-w-0 cursor-pointer"
											>
												<div className="text-sm font-medium">{user.name}</div>
												<div className="text-xs text-muted-foreground">
													{user.email}
												</div>
											</label>
											<div
												className={`px-2 py-1 rounded text-xs font-medium ${
													isVisible
														? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
														: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
												}`}
											>
												{isVisible ? "Visible" : "Hidden"}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>

					<DialogFooter>
						<Button
							type="button"
							onClick={() => setIsDialogOpen(false)}
							disabled={isSaving}
							variant="outline"
						>
							Cancel
						</Button>
						<Button type="button" onClick={handleSave} disabled={isSaving}>
							{isSaving ? (
								<>
									<Loader2 className="animate-spin h-4 w-4 mr-2" />
									Saving...
								</>
							) : (
								"Save Changes"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
