CREATE TABLE `analytics_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recordedOn` varchar(10) NOT NULL,
	`sessions` int NOT NULL DEFAULT 0,
	`organicSessions` int NOT NULL DEFAULT 0,
	`orders` int NOT NULL DEFAULT 0,
	`revenue` decimal(12,2) NOT NULL DEFAULT '0',
	`contentViews` int NOT NULL DEFAULT 0,
	`indexedPages` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatbot_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`anonymousId` varchar(100),
	`topic` varchar(80),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatbot_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chatbot_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`eventIds` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatbot_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`excerpt` text NOT NULL,
	`body` text NOT NULL,
	`sourceSummary` text NOT NULL,
	`imageKey` varchar(32) NOT NULL DEFAULT 'hero',
	`seoTitle` varchar(255) NOT NULL,
	`metaDescription` varchar(320) NOT NULL,
	`keywords` json NOT NULL,
	`faq` json NOT NULL,
	`relatedEventIds` json NOT NULL,
	`status` enum('DRAFT','SCHEDULED','PUBLISHED','ARCHIVED','NEEDS_REVIEW') NOT NULL DEFAULT 'DRAFT',
	`isDemo` boolean NOT NULL DEFAULT true,
	`publishedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `content_articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `content_automation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT false,
	`autoPublish` boolean NOT NULL DEFAULT true,
	`cronExpression` varchar(100) NOT NULL DEFAULT '0 0 14 * * *',
	`scheduleCronTaskUid` varchar(65),
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`lastStatus` varchar(80) NOT NULL DEFAULT 'Not scheduled',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `content_automation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`status` enum('ACTIVE','UNSUBSCRIBED') NOT NULL DEFAULT 'ACTIVE',
	`source` varchar(80) NOT NULL DEFAULT 'homepage',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` enum('Concerts','Sports','Theater','Comedy','Festivals','Experiences') NOT NULL,
	`artist` varchar(255) NOT NULL,
	`startsAt` timestamp NOT NULL,
	`venue` varchar(255) NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(2) NOT NULL,
	`description` text NOT NULL,
	`imageKey` varchar(32) NOT NULL,
	`isVeloraPick` boolean NOT NULL DEFAULT false,
	`isTrending` boolean NOT NULL DEFAULT false,
	`isPublished` boolean NOT NULL DEFAULT true,
	`isDemo` boolean NOT NULL DEFAULT true,
	`status` enum('DRAFT','PUBLISHED','UNPUBLISHED','CANCELLED') NOT NULL DEFAULT 'PUBLISHED',
	`deliveryMethod` varchar(100) NOT NULL DEFAULT 'Digital delivery',
	`externalSource` varchar(255),
	`terms` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`source` varchar(255) NOT NULL,
	`purchaseDate` timestamp,
	`acquisitionCost` decimal(10,2) NOT NULL,
	`purchaseFees` decimal(10,2) NOT NULL DEFAULT '0',
	`section` varchar(80) NOT NULL,
	`row` varchar(80) NOT NULL,
	`seat` varchar(120) NOT NULL,
	`quantity` int NOT NULL,
	`comparableMarketPrice` decimal(10,2),
	`sellingPrice` decimal(10,2),
	`serviceFee` decimal(10,2) NOT NULL DEFAULT '0',
	`taxes` decimal(10,2) NOT NULL DEFAULT '0',
	`desiredMargin` decimal(10,2) NOT NULL DEFAULT '0',
	`label` varchar(64),
	`transferMethod` varchar(100) NOT NULL DEFAULT 'Digital delivery',
	`ticketStatus` enum('AVAILABLE','RESERVED','SOLD','PENDING TRANSFER','DELIVERED','CANCELLED') NOT NULL DEFAULT 'AVAILABLE',
	`transferStatus` enum('NOT_READY','READY','PENDING','COMPLETED','FAILED') NOT NULL DEFAULT 'NOT_READY',
	`pricingReviewRequired` boolean NOT NULL DEFAULT false,
	`isDemo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(40) NOT NULL,
	`userId` int,
	`email` varchar(320) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`eventId` int NOT NULL,
	`inventoryId` int NOT NULL,
	`quantity` int NOT NULL,
	`ticketSubtotal` decimal(10,2) NOT NULL,
	`serviceFee` decimal(10,2) NOT NULL,
	`taxes` decimal(10,2) NOT NULL,
	`total` decimal(10,2) NOT NULL,
	`paymentStatus` enum('PENDING','PAID','FAILED','REFUNDED','DEMO_PAID') NOT NULL DEFAULT 'PENDING',
	`deliveryStatus` enum('PENDING','PROCESSING','DELIVERED','DEMO_READY','CANCELLED') NOT NULL DEFAULT 'PENDING',
	`isDemo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_number_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `saved_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `saved_events_user_event_unique` UNIQUE(`userId`,`eventId`)
);
--> statement-breakpoint
CREATE TABLE `seo_opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyword` varchar(255) NOT NULL,
	`intent` varchar(100) NOT NULL,
	`targetType` varchar(80) NOT NULL,
	`targetSlug` varchar(180) NOT NULL,
	`status` enum('NEW','IN_PROGRESS','PUBLISHED','MONITORING') NOT NULL DEFAULT 'NEW',
	`source` varchar(100) NOT NULL DEFAULT 'Catalog-derived',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seo_opportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` varchar(255) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `chatbot_conversations_user_idx` ON `chatbot_conversations` (`userId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `chatbot_messages_conversation_idx` ON `chatbot_messages` (`conversationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `content_articles_status_published_idx` ON `content_articles` (`status`,`publishedAt`);--> statement-breakpoint
CREATE INDEX `events_city_category_idx` ON `events` (`city`,`category`);--> statement-breakpoint
CREATE INDEX `inventory_event_status_idx` ON `inventory` (`eventId`,`ticketStatus`);--> statement-breakpoint
CREATE INDEX `orders_user_created_idx` ON `orders` (`userId`,`createdAt`);