package com.treehole.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.treehole.entity.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RedisRealtimeService {

    private static final String BOTTLE_POOL_KEY = "treehole:bottle:pool";
    private static final String MESSAGE_RANK_KEY = "treehole:rank:messages";
    private static final String TAG_RANK_KEY = "treehole:rank:tags";
    private static final String ONLINE_USERS_KEY = "treehole:online:users";
    private static final long ONLINE_TTL_SECONDS = 90;

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public void addBottleToPool(Long bottleId) {
        if (bottleId != null) redisTemplate.opsForSet().add(BOTTLE_POOL_KEY, bottleId.toString());
    }

    public void removeBottleFromPool(Long bottleId) {
        if (bottleId != null) redisTemplate.opsForSet().remove(BOTTLE_POOL_KEY, bottleId.toString());
    }

    public Set<String> sampleBottleIds(int count) {
        return redisTemplate.opsForSet().distinctRandomMembers(BOTTLE_POOL_KEY, count);
    }

    public Map<String, Integer> updateReaction(String type, Long targetId, String userId, String emoji, String dbSnapshotJson) {
        String usersKey = "treehole:react:" + type + ":" + targetId + ":users";
        String countsKey = "treehole:react:" + type + ":" + targetId + ":counts";
        seedReactionCountsIfEmpty(countsKey, dbSnapshotJson);

        Object oldEmojiObj = redisTemplate.opsForHash().get(usersKey, userId);
        String oldEmoji = oldEmojiObj != null ? oldEmojiObj.toString() : null;

        if (oldEmoji != null) {
            redisTemplate.opsForHash().increment(countsKey, oldEmoji, -1);
            Object count = redisTemplate.opsForHash().get(countsKey, oldEmoji);
            if (count == null || Long.parseLong(count.toString()) <= 0) {
                redisTemplate.opsForHash().delete(countsKey, oldEmoji);
            }
        }

        if (emoji.equals(oldEmoji)) {
            redisTemplate.opsForHash().delete(usersKey, userId);
        } else {
            redisTemplate.opsForHash().put(usersKey, userId, emoji);
            redisTemplate.opsForHash().increment(countsKey, emoji, 1);
        }

        return readReactionCounts(countsKey);
    }

    public String toReactionJson(Map<String, Integer> reactionCounts) {
        try {
            return objectMapper.writeValueAsString(reactionCounts);
        } catch (Exception e) {
            return "{}";
        }
    }

    public void incrementMessageRank(Long messageId, double score) {
        if (messageId == null) return;
        Double newScore = redisTemplate.opsForZSet().incrementScore(MESSAGE_RANK_KEY, messageId.toString(), score);
        if (newScore != null && newScore <= 0) redisTemplate.opsForZSet().remove(MESSAGE_RANK_KEY, messageId.toString());
    }

    public void removeMessageRank(Long messageId) {
        if (messageId != null) redisTemplate.opsForZSet().remove(MESSAGE_RANK_KEY, messageId.toString());
    }

    public void incrementTagRank(String tagName, double score) {
        if (tagName == null || tagName.isBlank()) return;
        Double newScore = redisTemplate.opsForZSet().incrementScore(TAG_RANK_KEY, tagName, score);
        if (newScore != null && newScore <= 0) redisTemplate.opsForZSet().remove(TAG_RANK_KEY, tagName);
    }

    public List<Tag> mergeTagRank(List<Tag> dbTags, int limit) {
        Set<String> rankedNames = redisTemplate.opsForZSet().reverseRange(TAG_RANK_KEY, 0, Math.max(0, limit - 1));
        if (rankedNames == null || rankedNames.isEmpty()) return dbTags;

        Map<String, Tag> byName = new HashMap<>();
        for (Tag tag : dbTags) byName.put(tag.getName(), tag);

        return rankedNames.stream()
                .map(name -> {
                    Tag tag = byName.getOrDefault(name, new Tag());
                    tag.setName(name);
                    Double score = redisTemplate.opsForZSet().score(TAG_RANK_KEY, name);
                    tag.setUsageCount(score == null ? 0 : score.intValue());
                    return tag;
                })
                .limit(limit)
                .toList();
    }

    public void markUserOnline(String userId) {
        if (userId == null || userId.isBlank()) return;
        redisTemplate.opsForZSet().add(ONLINE_USERS_KEY, userId, Instant.now().getEpochSecond());
        pruneOfflineUsers();
    }

    public void markUserOffline(String userId) {
        if (userId == null || userId.isBlank()) return;
        redisTemplate.opsForZSet().remove(ONLINE_USERS_KEY, userId);
    }

    public long countOnlineUsers() {
        pruneOfflineUsers();
        Long count = redisTemplate.opsForZSet().zCard(ONLINE_USERS_KEY);
        return count == null ? 0 : count;
    }

    private void pruneOfflineUsers() {
        long cutoff = Instant.now().getEpochSecond() - ONLINE_TTL_SECONDS;
        redisTemplate.opsForZSet().removeRangeByScore(ONLINE_USERS_KEY, 0, cutoff);
    }

    private void seedReactionCountsIfEmpty(String countsKey, String dbSnapshotJson) {
        Long size = redisTemplate.opsForHash().size(countsKey);
        if (size != null && size > 0) return;
        if (dbSnapshotJson == null || dbSnapshotJson.isBlank()) return;

        try {
            Map<String, Integer> snapshot = objectMapper.readValue(dbSnapshotJson, new TypeReference<>() {});
            snapshot.forEach((emoji, count) -> {
                if (count != null && count > 0) redisTemplate.opsForHash().put(countsKey, emoji, count.toString());
            });
        } catch (Exception ignored) {
        }
    }

    private Map<String, Integer> readReactionCounts(String countsKey) {
        Map<Object, Object> raw = redisTemplate.opsForHash().entries(countsKey);
        Map<String, Integer> counts = new HashMap<>();
        raw.forEach((emoji, count) -> {
            int value = Integer.parseInt(count.toString());
            if (value > 0) counts.put(emoji.toString(), value);
        });
        return counts;
    }
}
