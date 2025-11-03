CREATE TABLE `holidays` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`name` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `holidays_date_unique` ON `holidays` (`date`);--> statement-breakpoint
CREATE INDEX `idx_holiday_date` ON `holidays` (`date`);--> statement-breakpoint
CREATE TABLE `time_entries_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_id` integer NOT NULL,
	`spent_date` text NOT NULL,
	`user_id` integer NOT NULL,
	`user_name` text NOT NULL,
	`project_id` integer NOT NULL,
	`project_name` text NOT NULL,
	`client_id` integer NOT NULL,
	`client_name` text NOT NULL,
	`task_id` integer NOT NULL,
	`task_name` text NOT NULL,
	`notes` text,
	`hours` real NOT NULL,
	`billable` integer NOT NULL,
	`date_range_start` text NOT NULL,
	`date_range_end` text NOT NULL,
	`cached_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_entry_date_range` ON `time_entries_cache` (`entry_id`,`date_range_start`,`date_range_end`);--> statement-breakpoint
CREATE INDEX `idx_spent_date` ON `time_entries_cache` (`spent_date`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `time_entries_cache` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_date_range` ON `time_entries_cache` (`date_range_start`,`date_range_end`);--> statement-breakpoint
CREATE INDEX `idx_cached_at` ON `time_entries_cache` (`cached_at`);