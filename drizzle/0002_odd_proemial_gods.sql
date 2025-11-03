CREATE TABLE `user_visibility` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_email` text NOT NULL,
	`is_visible` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_visibility_user_email_unique` ON `user_visibility` (`user_email`);--> statement-breakpoint
CREATE INDEX `idx_user_visibility_email` ON `user_visibility` (`user_email`);