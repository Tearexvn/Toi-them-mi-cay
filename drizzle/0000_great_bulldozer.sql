CREATE TABLE `noodle_players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`displayName` varchar(48) NOT NULL,
	`nameKey` varchar(96) NOT NULL,
	`loginTokenHash` varchar(64) NOT NULL,
	`totalClicks` int unsigned NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `noodle_players_id` PRIMARY KEY(`id`),
	CONSTRAINT `noodle_players_nameKey_unique` UNIQUE(`nameKey`),
	CONSTRAINT `noodle_players_loginTokenHash_unique` UNIQUE(`loginTokenHash`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
