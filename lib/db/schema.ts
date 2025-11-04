import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const timeEntriesCache = sqliteTable("time_entries_cache", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	entryId: integer("entry_id").notNull(),
	spentDate: text("spent_date").notNull(),
	userId: integer("user_id").notNull(),
	userName: text("user_name").notNull(),
	projectId: integer("project_id").notNull(),
	projectName: text("project_name").notNull(),
	clientId: integer("client_id").notNull(),
	clientName: text("client_name").notNull(),
	taskId: integer("task_id").notNull(),
	taskName: text("task_name").notNull(),
	notes: text("notes"),
	hours: real("hours").notNull(),
	billable: integer("billable").notNull(),
	overtime: integer("overtime").notNull().default(0),
	dateRangeStart: text("date_range_start").notNull(),
	dateRangeEnd: text("date_range_end").notNull(),
	cachedAt: integer("cached_at").notNull(),
}, (table) => ([
	uniqueIndex("unique_entry_date_range").on(
		table.entryId,
		table.dateRangeStart,
		table.dateRangeEnd,
	),
	index("idx_spent_date").on(table.spentDate),
	index("idx_user_id").on(table.userId),
	index("idx_date_range").on(table.dateRangeStart, table.dateRangeEnd),
	index("idx_cached_at").on(table.cachedAt),
]));

export const holidays = sqliteTable("holidays", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	date: text("date").notNull().unique(),
	name: text("name"),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
}, (table) => ([
	index("idx_holiday_date").on(table.date),
]));

export const userVisibility = sqliteTable("user_visibility", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	userEmail: text("user_email").notNull().unique(),
	isVisible: integer("is_visible").notNull().default(1),
	updatedAt: integer("updated_at").notNull(),
}, (table) => ([
	index("idx_user_visibility_email").on(table.userEmail),
]));

export type TimeEntryCache = typeof timeEntriesCache.$inferSelect;
export type NewTimeEntryCache = typeof timeEntriesCache.$inferInsert;
export type Holiday = typeof holidays.$inferSelect;
export type NewHoliday = typeof holidays.$inferInsert;
export type UserVisibility = typeof userVisibility.$inferSelect;
export type NewUserVisibility = typeof userVisibility.$inferInsert;
