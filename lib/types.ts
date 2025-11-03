// Shared types that can be used in both server and client code
export interface CachedTimeEntry {
	entry_id: number;
	spent_date: string;
	user_id: number;
	user_name: string;
	project_id: number;
	project_name: string;
	client_id: number;
	client_name: string;
	task_id: number;
	task_name: string;
	notes: string | null;
	hours: number;
	billable: number;
	overtime: number;
}
