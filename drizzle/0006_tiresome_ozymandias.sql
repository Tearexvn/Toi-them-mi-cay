ALTER TABLE `noodle_players` ADD `robotConfessionCount` int unsigned DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `noodle_players` ADD `robotEaterUnlocked` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `noodle_players` ADD `robotIconExpiresAt` bigint unsigned;