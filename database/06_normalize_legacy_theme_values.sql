UPDATE `message`
SET `theme` = 'default'
WHERE (`theme` IS NULL OR `theme` = '' OR `theme` NOT IN ('default', 'dawn', 'sakura', 'spring'));
