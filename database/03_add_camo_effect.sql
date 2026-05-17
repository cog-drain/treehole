SET @column_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'message'
      AND COLUMN_NAME = 'camo_effect'
);

SET @migration_sql := IF(
    @column_exists = 0,
    'ALTER TABLE `message` ADD COLUMN `camo_effect` TINYINT(1) DEFAULT 0 AFTER `message_type`',
    'SELECT ''message.camo_effect already exists'' AS migration_status'
);

PREPARE migration_stmt FROM @migration_sql;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;
