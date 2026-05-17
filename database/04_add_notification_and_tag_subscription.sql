SET @notification_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'notification'
);

SET @migration_sql := IF(
    @notification_exists = 0,
    'CREATE TABLE `notification` (
        `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
        `recipient_id` VARCHAR(36) NOT NULL,
        `actor_id` VARCHAR(36) DEFAULT NULL,
        `type` VARCHAR(40) NOT NULL,
        `target_type` VARCHAR(30) NOT NULL,
        `message_id` BIGINT DEFAULT NULL,
        `comment_id` BIGINT DEFAULT NULL,
        `parent_comment_id` BIGINT DEFAULT NULL,
        `tag_id` BIGINT DEFAULT NULL,
        `tag_name` VARCHAR(50) DEFAULT NULL,
        `title` VARCHAR(80) NOT NULL,
        `summary` VARCHAR(200) DEFAULT NULL,
        `is_read` TINYINT DEFAULT 0,
        `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX `idx_notification_recipient_read_time` (`recipient_id`, `is_read`, `create_time`),
        INDEX `idx_notification_recipient_time` (`recipient_id`, `create_time`),
        INDEX `idx_notification_message` (`message_id`),
        INDEX `idx_notification_comment` (`comment_id`),
        INDEX `idx_notification_tag_window` (`recipient_id`, `type`, `tag_id`, `create_time`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4',
    'SELECT ''notification already exists'' AS migration_status'
);

PREPARE migration_stmt FROM @migration_sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @tag_subscription_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tag_subscription'
);

SET @migration_sql := IF(
    @tag_subscription_exists = 0,
    'CREATE TABLE `tag_subscription` (
        `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
        `user_id` VARCHAR(36) NOT NULL,
        `tag_id` BIGINT NOT NULL,
        `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY `uk_tag_subscription_user_tag` (`user_id`, `tag_id`),
        INDEX `idx_tag_subscription_tag` (`tag_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4',
    'SELECT ''tag_subscription already exists'' AS migration_status'
);

PREPARE migration_stmt FROM @migration_sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;
