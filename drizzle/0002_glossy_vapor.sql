ALTER TABLE `noodle_players` ADD `experience` longtext NULL;--> statement-breakpoint
UPDATE `noodle_players` SET `experience` = CAST(`totalClicks` AS CHAR) WHERE `experience` IS NULL OR `experience` = '';--> statement-breakpoint
ALTER TABLE `noodle_players` MODIFY `experience` longtext NOT NULL;
