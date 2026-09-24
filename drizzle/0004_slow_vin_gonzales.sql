ALTER TABLE `content_automation` ADD `catalogSyncEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `content_automation` ADD `catalogSyncTaskUid` varchar(65);--> statement-breakpoint
ALTER TABLE `content_automation` ADD `catalogLastRunAt` timestamp;--> statement-breakpoint
ALTER TABLE `content_automation` ADD `catalogLastStatus` varchar(255) DEFAULT 'Provider not configured' NOT NULL;