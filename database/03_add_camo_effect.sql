ALTER TABLE `message`
    ADD COLUMN IF NOT EXISTS `camo_effect` TINYINT(1) DEFAULT 0 AFTER `message_type`;
