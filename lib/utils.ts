export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);

  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return days;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

export function formatDate(date: Date): string {
	// Format date in local timezone to avoid timezone offset issues
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
	// Parse date string (YYYY-MM-DD) as local date, not UTC
	const [year, month, day] = dateStr.split('-').map(Number);
	return new Date(year, month - 1, day);
}

export function getMonthYear(date: Date): { month: number; year: number } {
  return {
    month: date.getMonth(),
    year: date.getFullYear(),
  };
}
