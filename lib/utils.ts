import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utility functions
export function formatDate(date: Date): string {
	// Format date in local timezone to avoid UTC conversion issues
	// Use local date components to ensure consistent YYYY-MM-DD format
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
	// Parse date in local timezone to avoid UTC conversion issues
	// Date string format: YYYY-MM-DD
	const [year, month, day] = dateStr.split("-").map(Number);
	return new Date(year, month - 1, day);
}

export function isWeekend(date: Date): boolean {
	const day = date.getDay();
	return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

export function getMonthYear(date: Date): { month: number; year: number } {
	return {
		month: date.getMonth(),
		year: date.getFullYear(),
	};
}

export function getDaysInMonth(year: number, month: number): Date[] {
	const days: Date[] = [];
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);

	for (let day = 1; day <= lastDay.getDate(); day++) {
		days.push(new Date(year, month, day));
	}

	return days;
}
