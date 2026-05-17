SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

INSERT IGNORE INTO `user` (`id`, `created_at`)
VALUES ('legacy-backup-20260428', '2026-04-27 00:00:00');

DROP TEMPORARY TABLE IF EXISTS `legacy_message_source`;
CREATE TEMPORARY TABLE `legacy_message_source` (
    `old_id` BIGINT PRIMARY KEY,
    `content` TEXT NOT NULL,
    `author_alias` VARCHAR(50) DEFAULT '匿名用户',
    `likes` INT DEFAULT 0,
    `image_url` VARCHAR(500) DEFAULT NULL,
    `mood` VARCHAR(20) DEFAULT NULL,
    `theme` VARCHAR(50) DEFAULT 'default',
    `create_time` DATETIME NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO `legacy_message_source`
(`old_id`, `content`, `author_alias`, `likes`, `image_url`, `mood`, `theme`, `create_time`)
VALUES
(2, '111', 'a', 0, NULL, NULL, 'default', '2026-04-27 15:00:41'),
(3, '落泪', '匿名用户', 1, NULL, '难过', 'default', '2026-04-27 15:01:01'),
(4, '你谁', '匿名用户', 10, NULL, '愤怒', 'default', '2026-04-27 15:01:43'),
(5, '1', 'zx', 7, NULL, '平静', 'default', '2026-04-27 15:16:58'),
(6, '你好，开心', '小民', 2, NULL, '开心', 'default', '2026-04-28 01:22:31'),
(7, '气死我了', '匿名用户', 4, NULL, '愤怒', 'default', '2026-04-28 01:34:28'),
(8, '什么时候成为富豪', '(๑• . •๑)', 1, NULL, NULL, 'default', '2026-04-28 02:51:05'),
(9, '1100 1111', 'char', 0, NULL, '平静', 'default', '2026-04-28 03:33:49'),
(10, 'to do:\n1.粘贴 图片 \n2.md格式\n3.缘分树洞弹窗适配移动端', 'dev', 0, NULL, '迷茫', 'default', '2026-04-28 03:38:06'),
(11, '气死我了', '戴同学', 0, NULL, NULL, 'default', '2026-04-28 03:45:34');

INSERT INTO `message`
(`user_id`, `content`, `author_alias`, `likes`, `image_url`, `mood`, `theme`, `message_type`, `camo_effect`, `create_time`, `is_deleted`)
SELECT
    'legacy-backup-20260428',
    source.`content`,
    source.`author_alias`,
    source.`likes`,
    source.`image_url`,
    source.`mood`,
    source.`theme`,
    'normal',
    0,
    source.`create_time`,
    0
FROM `legacy_message_source` source
WHERE NOT EXISTS (
    SELECT 1
    FROM `message` existing
    WHERE existing.`user_id` = 'legacy-backup-20260428'
      AND existing.`content` = source.`content`
      AND existing.`author_alias` = source.`author_alias`
      AND existing.`create_time` = source.`create_time`
);

DROP TEMPORARY TABLE IF EXISTS `legacy_message_map`;
CREATE TEMPORARY TABLE `legacy_message_map` (
    `old_id` BIGINT PRIMARY KEY,
    `new_id` BIGINT NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO `legacy_message_map` (`old_id`, `new_id`)
SELECT source.`old_id`, MIN(message.`id`) AS `new_id`
FROM `legacy_message_source` source
JOIN `message` message
  ON message.`user_id` = 'legacy-backup-20260428'
 AND message.`content` = source.`content`
 AND message.`author_alias` = source.`author_alias`
 AND message.`create_time` = source.`create_time`
GROUP BY source.`old_id`;

DROP TEMPORARY TABLE IF EXISTS `legacy_comment_source`;
CREATE TEMPORARY TABLE `legacy_comment_source` (
    `old_id` BIGINT PRIMARY KEY,
    `old_message_id` BIGINT NOT NULL,
    `content` TEXT NOT NULL,
    `create_time` DATETIME NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO `legacy_comment_source`
(`old_id`, `old_message_id`, `content`, `create_time`)
VALUES
(1, 4, 'h', '2026-04-27 15:02:22'),
(2, 3, '柔柔弱弱', '2026-04-28 01:22:54'),
(3, 6, 'aaa', '2026-04-28 01:23:08'),
(4, 10, '增加bgm', '2026-04-28 03:40:43'),
(5, 10, '增加 # ，tag', '2026-04-28 03:43:14'),
(6, 10, '增加 发泄 功能', '2026-04-28 03:44:50'),
(7, 10, '增加评论 ‘评论’ 评论', '2026-04-28 03:45:32'),
(8, 10, '增加 刷新页面 后，显示评论数量。而非手动点击', '2026-04-28 03:46:41'),
(9, 10, '增加用户 个性化，选择默认是否展开评论', '2026-04-28 03:47:31');

INSERT INTO `comment`
(`message_id`, `user_id`, `author_alias`, `content`, `create_time`, `is_deleted`)
SELECT
    map.`new_id`,
    'legacy-backup-20260428',
    '历史评论',
    source.`content`,
    source.`create_time`,
    0
FROM `legacy_comment_source` source
JOIN `legacy_message_map` map
  ON map.`old_id` = source.`old_message_id`
WHERE NOT EXISTS (
    SELECT 1
    FROM `comment` existing
    WHERE existing.`message_id` = map.`new_id`
      AND existing.`user_id` = 'legacy-backup-20260428'
      AND existing.`content` = source.`content`
      AND existing.`create_time` = source.`create_time`
);

UPDATE `message` message
JOIN `legacy_message_map` map
  ON map.`new_id` = message.`id`
SET message.`comment_count` = (
    SELECT COUNT(*)
    FROM `comment` comment
    WHERE comment.`message_id` = message.`id`
      AND comment.`is_deleted` = 0
);

SET FOREIGN_KEY_CHECKS = 1;
