"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
	useState,
	useCallback,
	useMemo,
	useEffect,
	useRef,
	useId,
} from "react";

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
	const dropdownRef = useRef<HTMLDivElement>(null);
	const userSelectId = useId();

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

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

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
		<div className="inline-flex items-center" ref={dropdownRef}>
			<div className="relative ml-2">
				<button
					id={userSelectId}
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="px-4 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] text-left flex items-center justify-between"
				>
					<span className="truncate">{displayText}</span>
					<svg
						className={`w-4 h-4 transition-transform ${
							isOpen ? "rotate-180" : ""
						}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				{isOpen && (
					<div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
						<div className="p-2 border-b border-zinc-200 dark:border-zinc-700 flex gap-2 sticky top-0 bg-white dark:bg-zinc-800">
							<button
								type="button"
								onClick={selectAll}
								className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
							>
								Select All
							</button>
							<button
								type="button"
								onClick={deselectAll}
								className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
							>
								Deselect All
							</button>
						</div>
						<div className="p-2 space-y-1">
							{users.map((user) => (
								<label
									key={user.id}
									className="flex items-center gap-2 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded cursor-pointer"
								>
									<input
										type="checkbox"
										checked={selected.has(user.email)}
										onChange={() => toggleUser(user.email)}
										className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
									/>
									<div className="flex-1 min-w-0">
										<div className="text-sm font-medium text-black dark:text-zinc-50 truncate">
											{user.name}
										</div>
										<div className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
											{user.email}
										</div>
									</div>
								</label>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
