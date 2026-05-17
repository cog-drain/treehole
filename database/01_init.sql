-- ======================================================
-- 赛博树洞 (Treehole) - 全平台通用初始化脚本
-- 兼容性: MySQL 8.0+, MariaDB 11.0+
-- ======================================================
SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. 管理员配置表
DROP TABLE IF EXISTS `admin_config`;

CREATE TABLE `admin_config` (
    `config_key` VARCHAR(50) PRIMARY KEY,
    `config_value` TEXT NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO
    `admin_config` (`config_key`, `config_value`)
VALUES ('admin_password', 'admin123');

-- 2. 黑名单表
DROP TABLE IF EXISTS `blacklist`;

CREATE TABLE `blacklist` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `ip` VARCHAR(50) NOT NULL UNIQUE,
    `reason` VARCHAR(255),
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 3. 用户身份表
DROP TABLE IF EXISTS `user`;

CREATE TABLE `user` (
    `id` VARCHAR(36) PRIMARY KEY COMMENT 'UUID 身份标识',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '首次降临时间'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 4. 留言表
DROP TABLE IF EXISTS `message`;

CREATE TABLE `message` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(36) DEFAULT 'legacy-origin' COMMENT '绑定匿名身份',
    `author_alias` VARCHAR(50) DEFAULT '匿名用户',
    `content` TEXT NOT NULL,
    `mood` VARCHAR(20),
    `image_url` VARCHAR(500),
    `audio_url` VARCHAR(500),
    `theme` VARCHAR(50) DEFAULT 'default',
    `message_type` VARCHAR(20) DEFAULT 'normal',
    `camo_effect` TINYINT(1) DEFAULT 0,
    `expires_at` DATETIME DEFAULT NULL,
    `likes` INT DEFAULT 0,
    `comment_count` INT DEFAULT 0,
    `ip_address` VARCHAR(50),
    `reactions` JSON DEFAULT NULL COMMENT '动态表情统计 JSON',
    `is_deleted` TINYINT DEFAULT 0,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_create_time` (`create_time`),
    INDEX `idx_message_type_expires` (`message_type`, `expires_at`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 5. 评论表
DROP TABLE IF EXISTS `comment`;

CREATE TABLE `comment` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `message_id` BIGINT NOT NULL,
    `user_id` VARCHAR(36) DEFAULT 'legacy-origin' COMMENT '绑定匿名身份',
    `author_alias` VARCHAR(50) DEFAULT '匿名用户',
    `content` TEXT NOT NULL,
    `image_url` VARCHAR(500),
    `parent_id` BIGINT DEFAULT NULL,
    `ip_address` VARCHAR(50),
    `reactions` JSON DEFAULT NULL COMMENT '动态表情统计 JSON',
    `is_deleted` TINYINT DEFAULT 0,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_message` (`message_id`),
    INDEX `idx_user` (`user_id`),
    INDEX `idx_resonance` (`user_id`, `message_id`, `is_deleted`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 6. 标签相关表
DROP TABLE IF EXISTS `tag`;

CREATE TABLE `tag` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `usage_count` INT DEFAULT 0,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

DROP TABLE IF EXISTS `message_tag`;

CREATE TABLE `message_tag` (
    `message_id` BIGINT NOT NULL,
    `tag_id` BIGINT NOT NULL,
    PRIMARY KEY (`message_id`, `tag_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 7. 告解见证表
DROP TABLE IF EXISTS `confession_witness`;

CREATE TABLE `confession_witness` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `message_id` BIGINT NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_confession_witness_user` (`message_id`, `user_id`),
    INDEX `idx_confession_witness_message` (`message_id`),
    INDEX `idx_confession_witness_user` (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 8. 站内通知表
DROP TABLE IF EXISTS `notification`;

CREATE TABLE `notification` (
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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 9. 标签订阅表
DROP TABLE IF EXISTS `tag_subscription`;

CREATE TABLE `tag_subscription` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `tag_id` BIGINT NOT NULL,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_tag_subscription_user_tag` (`user_id`, `tag_id`),
    INDEX `idx_tag_subscription_tag` (`tag_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 10. 漂流瓶表 (补全)
DROP TABLE IF EXISTS `drift_bottle`;

CREATE TABLE `drift_bottle` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `author_alias` VARCHAR(50),
    `theme` VARCHAR(50),
    `content` TEXT NOT NULL,
    `state` TINYINT DEFAULT 0 COMMENT '0: 漂流中, 1: 被捞起, 2: 已归还',
    `picker_id` VARCHAR(36),
    `last_picker_id` VARCHAR(36),
    `reply_content` TEXT,
    `reply_author_alias` VARCHAR(50),
    `reply_time` DATETIME,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
