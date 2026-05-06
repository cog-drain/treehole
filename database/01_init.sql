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
    `likes` INT DEFAULT 0,
    `comment_count` INT DEFAULT 0,
    `ip_address` VARCHAR(50),
    `reactions` JSON DEFAULT NULL COMMENT '动态表情统计 JSON',
    `is_deleted` TINYINT DEFAULT 0,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_create_time` (`create_time`)
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
    INDEX `idx_user` (`user_id`)
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

-- 7. 漂流瓶表 (补全)
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
