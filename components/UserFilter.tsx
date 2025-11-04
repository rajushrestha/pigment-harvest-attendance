"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
	useState,
	useCallback,
	useMemo,
	useEffect,
} from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";

interface User {
	id: number;
	name: string;
	email: string;
}

interface UserFilterProps {
	users: User[];
}

export function UserFilter({ users }: UserFilterProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const selectedEmails = useMemo(() => {
		const emailsParam = searchParams.get("emails");
		return emailsParam ? emailsParam.split(",").filter(Boolean) : [];
	}, [searchParams]);

	// Initialize state: if no emails selected, select all users
	const initialSelected = useMemo(() => {
		return selectedEmails.length > 0
			? new Set(selectedEmails)
			: new Set(users.map((u) => u.email));
	}, [selectedEmails, users]);

	const [selected, setSelected] = useState<Set<string>>(initialSelected);
	const [isOpen, setIsOpen] = useState(false);

	// Sync state when URL params change (e.g., browser back/forward)
	useEffect(() => {
		setSelected(initialSelected);
	}, [initialSelected]);

	const updateURL = useCallback(
		(emails: Set<string>) => {
			const params = new URLSearchParams(searchParams.toString());
			if (emails.size === 0 || emails.size === users.length) {
				params.delete("emails");
			} else {
				params.set("emails", Array.from(emails).join(","));
			}
			router.push(`?${params.toString()}`, { scroll: false });
		},
		[searchParams, router, users.length],
	);

	const toggleUser = (email: string) => {
		const newSelected = new Set(selected);
		if (newSelected.has(email)) {
			newSelected.delete(email);
		} else {
			newSelected.add(email);
		}
		setSelected(newSelected);
		updateURL(newSelected);
	};

	const selectAll = () => {
		const allEmails = new Set(users.map((u) => u.email));
		setSelected(allEmails);
		updateURL(allEmails);
	};

	const deselectAll = () => {
		setSelected(new Set());
		updateURL(new Set());
	};

	const displayText =
		selected.size === 0
			? "No users selected"
			: selected.size === users.length
				? "All users"
				: `${selected.size} user${selected.size !== 1 ? "s" : ""} selected`;

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className="w-[200px] justify-between"
					size="sm"
				>
					<span className="truncate">{displayText}</span>
					<ChevronDown className="h-4 w-4 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-0" align="start">
				<div className="p-2 border-b flex gap-2">
					<Button
						type="button"
						onClick={selectAll}
						variant="default"
						size="sm"
						className="h-7 text-xs"
					>
						Select All
					</Button>
					<Button
						type="button"
						onClick={deselectAll}
						variant="secondary"
						size="sm"
						className="h-7 text-xs"
					>
						Deselect All
					</Button>
				</div>
				<div className="p-2 space-y-1 max-h-96 overflow-y-auto">
					{users.map((user) => (
						<label
							key={user.id}
							className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer"
						>
							<Checkbox
								checked={selected.has(user.email)}
								onCheckedChange={() => toggleUser(user.email)}
							/>
							<div className="flex-1 min-w-0">
								<div className="text-sm font-medium truncate">
									{user.name}
								</div>
								<div className="text-xs text-muted-foreground truncate">
									{user.email}
								</div>
							</div>
						</label>
					))}
				</div>
			</PopoverContent>
		</Popover>
	);
}
