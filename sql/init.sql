-- ======================================================
-- 赛博树洞 (Treehole) - 全平台通用初始化脚本
-- 兼容性: MySQL 8.0+, MariaDB 11.0+
-- ======================================================

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. 管理员配置表 (新增)
DROP TABLE IF EXISTS `admin_config`;

CREATE TABLE `admin_config` (
    `config_key` VARCHAR(50) PRIMARY KEY,
    `config_value` TEXT NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 预设管理员密码
INSERT INTO
    `admin_config` (`config_key`, `config_value`)
VALUES ('admin_password', 'admin123');

-- 2. 黑名单表 (新增)
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
    `is_deleted` TINYINT DEFAULT 0,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_message` (`message_id`),
    INDEX `idx_user` (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 导入历史评论数据
INSERT INTO
    `comment` (
        `id`,
        `message_id`,
        `content`,
        `create_time`
    )
VALUES (
        1,
        4,
        'h',
        '2026-04-27 15:02:22'
    ),
    (
        2,
        3,
        '柔柔弱弱',
        '2026-04-28 01:22:54'
    ),
    (
        3,
        6,
        'aaa',
        '2026-04-28 01:23:08'
    ),
    (
        4,
        10,
        '增加bgm',
        '2026-04-28 03:40:43'
    ),
    (
        5,
        10,
        '增加 # ，tag',
        '2026-04-28 03:43:14'
    ),
    (
        6,
        10,
        '增加 发泄 功能',
        '2026-04-28 03:44:50'
    ),
    (
        7,
        10,
        '增加评论 ‘评论’ 评论',
        '2026-04-28 03:45:32'
    ),
    (
        8,
        10,
        '增加 刷新页面 后，显示评论数量。而非手动点击',
        '2026-04-28 03:46:41'
    ),
    (
        9,
        10,
        '增加用户 个性化，选择默认是否展开评论',
        '2026-04-28 03:47:31'
    );

-- 6. 离线心事胶囊表
DROP TABLE IF EXISTS `capsule`;

CREATE TABLE `capsule` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `content` TEXT NOT NULL,
    `release_time` DATETIME COMMENT '预定发射时间',
    `is_synced` TINYINT DEFAULT 0,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user` (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 7. 漂流瓶系统
DROP TABLE IF EXISTS `drift_bottle`;

CREATE TABLE `drift_bottle` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL COMMENT '投放者ID',
    `author_alias` VARCHAR(50) DEFAULT '匿名用户',
    `theme` VARCHAR(50) DEFAULT 'default',
    `content` TEXT NOT NULL,
    `state` INT DEFAULT 0 COMMENT '状态: 0=漂流中, 1=被捞起, 2=已归还',
    `picker_id` VARCHAR(36) COMMENT '捞取者ID',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_user` (`user_id`),
    INDEX `idx_picker` (`picker_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- 8. 标签系统
DROP TABLE IF EXISTS `tag`;

CREATE TABLE `tag` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) UNIQUE NOT NULL,
    `usage_count` INT DEFAULT 1,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

DROP TABLE IF EXISTS `message_tag`;

CREATE TABLE `message_tag` (
    `message_id` BIGINT NOT NULL,
    `tag_id` BIGINT NOT NULL,
    PRIMARY KEY (`message_id`, `tag_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;