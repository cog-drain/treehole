package com.treehole.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.treehole.entity.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Profile("!demo")
@RequiredArgsConstructor
public class RedisRealtimeService implements RealtimeService {

    private static final String BOTTLE_POOL_KEY = "treehole:bottle:pool";
    private static final String MESSAGE_RANK_KEY = "treehole:rank:messages";
    private static final String TAG_RANK_KEY = "treehole:rank:tags";
    private static final String ONLINE_USERS_KEY = "treehole:online:users";
    private static final String MODULE_ACTIVE_KEY_PREFIX = "treehole:active:module:";
    private static final String ACTION_RANK_KEY = "treehole:activity:actions";
    private static final long ONLINE_TTL_SECONDS = 90;
    private static final List<String> TRACKED_MODULES = List.of("feed", "graph", "shop", "comments", "unknown");

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public boolean tryAcquireRateLimit(String key, Duration ttl) {
        Boolean allowed = redisTemplate.opsForValue().setIfAbsent(key, "1", ttl);
        return !Boolean.FALSE.equals(allowed);
    }

    @Override
    public void addBottleToPool(Long bottleId) {
        if (bottleId != null) redisTemplate.opsForSet().add(BOTTLE_POOL_KEY, bottleId.toString());
    }

    @Override
    public void removeBottleFromPool(Long bottleId) {
        if (bottleId != null) redisTemplate.opsForSet().remove(BOTTLE_POOL_KEY, bottleId.toString());
    }

    @Override
    public Set<String> sampleBottleIds(int count) {
        return redisTemplate.opsForSet().distinctRandomMembers(BOTTLE_POOL_KEY, count);
    }

    @Override
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

    @Override
    public String toReactionJson(Map<String, Integer> reactionCounts) {
        try {
            return objectMapper.writeValueAsString(reactionCounts);
        } catch (Exception e) {
            return "{}";
        }
    }

    @Override
    public void incrementMessageRank(Long messageId, double score) {
        if (messageId == null) return;
        Double newScore = redisTemplate.opsForZSet().incrementScore(MESSAGE_RANK_KEY, messageId.toString(), score);
        if (newScore != null && newScore <= 0) redisTemplate.opsForZSet().remove(MESSAGE_RANK_KEY, messageId.toString());
    }

    @Override
    public void removeMessageRank(Long messageId) {
        if (messageId != null) redisTemplate.opsForZSet().remove(MESSAGE_RANK_KEY, messageId.toString());
    }

    @Override
    public void incrementTagRank(String tagName, double score) {
        if (tagName == null || tagName.isBlank()) return;
        Double newScore = redisTemplate.opsForZSet().incrementScore(TAG_RANK_KEY, tagName, score);
        if (newScore != null && newScore <= 0) redisTemplate.opsForZSet().remove(TAG_RANK_KEY, tagName);
    }

    @Override
    public List<Tag> mergeTagRank(List<Tag> dbTags, int limit) {
        long resultLimit = limit <= 0 ? Long.MAX_VALUE : limit;
        Set<String> rankedNames = redisTemplate.opsForZSet().reverseRange(TAG_RANK_KEY, 0, -1);
        if (rankedNames == null || rankedNames.isEmpty()) return dbTags;

        Map<String, Tag> byName = new HashMap<>();
        for (Tag tag : dbTags) byName.put(tag.getName(), tag);

        if (limit > 0) {
            for (String name : rankedNames) {
                byName.computeIfAbsent(name, ignored -> {
                    Tag tag = new Tag();
                    tag.setName(name);
                    tag.setUsageCount(redisTagScore(name));
                    return tag;
                });
            }
        }

        return byName.values().stream()
                .sorted(Comparator
                        .comparingInt((Tag tag) -> Math.max(tag.getUsageCount() == null ? 0 : tag.getUsageCount(), redisTagScore(tag.getName())))
                        .reversed()
                        .thenComparing(Tag::getCreateTime, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Tag::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(resultLimit)
                .toList();
    }

    private int redisTagScore(String name) {
        Double score = redisTemplate.opsForZSet().score(TAG_RANK_KEY, name);
        return score == null ? 0 : score.intValue();
    }

    @Override
    public void markUserOnline(String userId, String sessionId) {
        String member = sessionMember(userId, sessionId);
        if (member == null) return;
        redisTemplate.opsForZSet().add(ONLINE_USERS_KEY, member, Instant.now().getEpochSecond());
        pruneOfflineUsers();
    }

    @Override
    public void markUserModuleActive(String userId, String sessionId, String module) {
        String member = sessionMember(userId, sessionId);
        if (member == null) return;
        String normalizedModule = normalizeModule(module);
        redisTemplate.opsForZSet().add(moduleKey(normalizedModule), member, Instant.now().getEpochSecond());
        pruneOfflineUsers();
    }

    @Override
    public void recordAction(String action) {
        String normalizedAction = normalizeToken(action, null);
        if (normalizedAction == null) return;
        redisTemplate.opsForZSet().incrementScore(ACTION_RANK_KEY, normalizedAction, 1);
    }

    @Override
    public Map<String, Long> countActiveModules() {
        pruneOfflineUsers();
        Map<String, Long> counts = new LinkedHashMap<>();
        for (String module : TRACKED_MODULES) {
            counts.put(module, countDistinctUsers(moduleKey(module)));
        }
        return counts;
    }

    @Override
    public Map<String, Long> topActions(int limit) {
        Set<String> actions = redisTemplate.opsForZSet().reverseRange(ACTION_RANK_KEY, 0, Math.max(0, limit - 1));
        if (actions == null || actions.isEmpty()) return Collections.emptyMap();

        Map<String, Long> result = new LinkedHashMap<>();
        for (String action : actions) {
            Double score = redisTemplate.opsForZSet().score(ACTION_RANK_KEY, action);
            result.put(action, score == null ? 0L : score.longValue());
        }
        return result;
    }

    @Override
    public void markUserOffline(String userId, String sessionId) {
        String member = sessionMember(userId, sessionId);
        if (member == null) return;
        redisTemplate.opsForZSet().remove(ONLINE_USERS_KEY, member);
        for (String module : TRACKED_MODULES) {
            redisTemplate.opsForZSet().remove(moduleKey(module), member);
        }
    }

    @Override
    public long countOnlineUsers() {
        pruneOfflineUsers();
        Set<String> members = redisTemplate.opsForZSet().range(ONLINE_USERS_KEY, 0, -1);
        return countDistinctUsers(members);
    }

    private long countDistinctUsers(String key) {
        Set<String> members = redisTemplate.opsForZSet().range(key, 0, -1);
        return countDistinctUsers(members);
    }

    private long countDistinctUsers(Set<String> members) {
        if (members == null || members.isEmpty()) return 0;
        return members.stream()
                .map(this::extractUserId)
                .filter(userId -> userId != null && !userId.isBlank())
                .collect(Collectors.toSet())
                .size();
    }

    private void pruneOfflineUsers() {
        long cutoff = Instant.now().getEpochSecond() - ONLINE_TTL_SECONDS;
        redisTemplate.opsForZSet().removeRangeByScore(ONLINE_USERS_KEY, 0, cutoff);
        for (String module : TRACKED_MODULES) {
            redisTemplate.opsForZSet().removeRangeByScore(moduleKey(module), 0, cutoff);
        }
    }

    private String sessionMember(String userId, String sessionId) {
        if (userId == null || userId.isBlank() || sessionId == null || sessionId.isBlank()) return null;
        return userId + ":" + sessionId;
    }

    private String extractUserId(String member) {
        if (member == null || member.isBlank()) return null;
        int splitIndex = member.lastIndexOf(':');
        return splitIndex <= 0 ? member : member.substring(0, splitIndex);
    }

    private String moduleKey(String module) {
        return MODULE_ACTIVE_KEY_PREFIX + module;
    }

    private String normalizeModule(String module) {
        String normalized = normalizeToken(module, "unknown");
        return TRACKED_MODULES.contains(normalized) ? normalized : "unknown";
    }

    private String normalizeToken(String value, String fallback) {
        if (value == null || value.isBlank()) return fallback;
        String normalized = value.trim().toLowerCase();
        boolean safe = normalized.matches("[a-z0-9_-]+");
        return safe ? normalized : fallback;
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
