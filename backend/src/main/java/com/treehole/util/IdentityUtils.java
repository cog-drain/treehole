package com.treehole.util;

import java.util.Objects;

/**
 * 赛博身份生成工具：实现贴内身份隔离 (Thread-Scoped Identity)
 */
public class IdentityUtils {
    
    private static final String[] ADJECTIVES = {
        "路过的", "潜水的", "吃瓜的", "发呆的", "路跑的", "忧郁的", "勇敢的", "神秘的", "优雅的", "狂野的",
        "沉思的", "迷路的", "熬夜的", "心碎的", "闪耀的", "慵懒的", "热血的", "透明的", "寂寞的", "温柔的"
    };
    
    private static final String[] ANIMALS = {
        "柴犬", "水豚", "熊猫", "考拉", "企鹅", "仓鼠", "猫咪", "小鹿", "海獭", "兔子",
        "狐狸", "浣熊", "松鼠", "小象", "海豚", "猫头鹰", "树懒", "刺猬", "小熊", "锦鲤"
    };

    /**
     * 根据用户身份ID和帖子ID生成该贴内的唯一马甲
     */
    public static String generateThreadAlias(String userId, Long messageId, String threadOwnerId) {
        // 1. 判定是否为洞主
        if (Objects.equals(userId, threadOwnerId)) {
            return "洞主";
        }
        
        // 2. 否则生成动态马甲：使用 Identity + MessageID 的联合哈希确保贴内固定，跨贴变动
        int seed = (userId + "@thread_" + messageId).hashCode();
        int adjIndex = Math.abs(seed % ADJECTIVES.length);
        int animalIndex = Math.abs((seed / ADJECTIVES.length) % ANIMALS.length);
        
        return ADJECTIVES[adjIndex] + ANIMALS[animalIndex];
    }
}
