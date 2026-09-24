ALTER TABLE `events` ADD `verificationStatus` enum('VERIFIED','VERIFICATION PENDING','UNVERIFIED') DEFAULT 'UNVERIFIED' NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD `officialSourceUrl` varchar(500);--> statement-breakpoint
ALTER TABLE `events` ADD `address` varchar(255);--> statement-breakpoint
ALTER TABLE `inventory` ADD `verificationStatus` enum('VERIFIED','VERIFICATION PENDING','UNVERIFIED') DEFAULT 'UNVERIFIED' NOT NULL;--> statement-breakpoint
ALTER TABLE `inventory` ADD `ticketUrl` varchar(500);