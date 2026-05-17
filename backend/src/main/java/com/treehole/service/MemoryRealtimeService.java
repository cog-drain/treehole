package com.treehole.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.treehole.entity.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@Profile("demo")
@RequiredArgsConstructor
public class MemoryRealtimeService implements RealtimeService {

    private static final long ONLINE_TTL_SECONDS = 90;
    private static final List<String> TRACKED_MODULES = List.of("feed", "graph", "shop", "comments", "unknown");

    private final ObjectMapper objectMapper;
    private final Map<String, Long> rateLimitExpires = new ConcurrentHashMap<>();
    private final Set<String> bottlePool = ConcurrentHashMap.newKeySet();
    private final Map<String, Map<String, String>> reactionUsers = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Integer>> reactionCounts = new ConcurrentHashMap<>();
    private final Map<String, Double> messageRanks = new ConcurrentHashMap<>();
    private final Map<String, Double> tagRanks = new ConcurrentHashMap<>();
    private final Map<String, Long> onlineUsers = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Long>> moduleActiveUsers = new ConcurrentHashMap<>();
    private final Map<String, Double> actionRanks = new ConcurrentHashMap<>();

    @Override
    public boolean tryAcquireRateLimit(String key, Duration ttl) {
        long now = Instant.now().toEpochMilli();
        long expiresAt = now + ttl.toMillis();
        Long existing = rateLimitExpires.compute(key, (ignored, current) -> {
            if (current == null || current <= now) return expiresAt;
            return current;
        });
        return existing != null && existing == expiresAt;
    }

    @Override
    public void addBottleToPool(Long bottleId) {
        if (bottleId != null) bottlePool.add(bottleId.toString());
    }

    @Override
    public void removeBottleFromPool(Long bottleId) {
        if (bottleId != null) bottlePool.remove(bottleId.toString());
    }

    @Override
    public Set<String> sampleBottleIds(int count) {
        if (count <= 0 || bottlePool.isEmpty()) return Collections.emptySet();
        List<String> candidates = new ArrayList<>(bottlePool);
        Collections.shuffle(candidates);
        return candidates.stream().limit(count).collect(Collectors.toSet());
    }

    @Override
    public synchronized Map<String, Integer> updateReaction(String type, Long targetId, String userId, String emoji, String dbSnapshotJson) {
        String usersKey = reactionKey(type, targetId, "users");
        String countsKey = reactionKey(type, targetId, "counts");
        seedReactionCountsIfEmpty(countsKey, dbSnapshotJson);

        Map<String, String> users = reactionUsers.computeIfAbsent(usersKey, ignored -> new ConcurrentHashMap<>());
        Map<String, Integer> counts = reactionCounts.computeIfAbsent(countsKey, ignored -> new ConcurrentHashMap<>());
        String oldEmoji = users.get(userId);

        if (oldEmoji != null) {
            decrementReaction(counts, oldEmoji);
        }

        if (emoji.equals(oldEmoji)) {
            users.remove(userId);
        } else {
            users.put(userId, emoji);
            counts.merge(emoji, 1, Integer::sum);
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
        incrementRank(messageRanks, messageId.toString(), score);
    }

    @Override
    public void removeMessageRank(Long messageId) {
        if (messageId != null) messageRanks.remove(messageId.toString());
    }

    @Override
    public void incrementTagRank(String tagName, double score) {
        if (tagName == null || tagName.isBlank()) return;
        incrementRank(tagRanks, tagName, score);
    }

    @Override
    public List<Tag> mergeTagRank(List<Tag> dbTags, int limit) {
        if (tagRanks.isEmpty()) return dbTags;

        Map<String, Tag> byName = new HashMap<>();
        for (Tag tag : dbTags) byName.put(tag.getName(), tag);

        return tagRanks.entrySet().stream()
                .filter(entry -> entry.getValue() > 0)
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Tag tag = byName.getOrDefault(entry.getKey(), new Tag());
                    tag.setName(entry.getKey());
                    tag.setUsageCount(entry.getValue().intValue());
                    return tag;
                })
                .toList();
    }

    @Override
    public void markUserOnline(String userId, String sessionId) {
        String member = sessionMember(userId, sessionId);
        if (member == null) return;
        onlineUsers.put(member, Instant.now().getEpochSecond());
        pruneOfflineUsers();
    }

    @Override
    public void markUserModuleActive(String userId, String sessionId, String module) {
        String member = sessionMember(userId, sessionId);
        if (member == null) return;
        moduleActiveUsers.computeIfAbsent(normalizeModule(module), ignored -> new ConcurrentHashMap<>())
                .put(member, Instant.now().getEpochSecond());
        pruneOfflineUsers();
    }

    @Override
    public void recordAction(String action) {
        String normalizedAction = normalizeToken(action, null);
        if (normalizedAction != null) actionRanks.merge(normalizedAction, 1D, Double::sum);
    }

    @Override
    public Map<String, Long> countActiveModules() {
        pruneOfflineUsers();
        Map<String, Long> counts = new LinkedHashMap<>();
        for (String module : TRACKED_MODULES) {
            counts.put(module, countDistinctUsers(moduleActiveUsers.get(module)));
        }
        return counts;
    }

    @Override
    public Map<String, Long> topActions(int limit) {
        return actionRanks.entrySet().stream()
                .filter(entry -> entry.getValue() > 0)
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(limit)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().longValue(),
                        (left, right) -> left,
                        LinkedHashMap::new
                ));
    }

    @Override
    public void markUserOffline(String userId, String sessionId) {
        String member = sessionMember(userId, sessionId);
        if (member == null) return;
        onlineUsers.remove(member);
        moduleActiveUsers.values().forEach(users -> users.remove(member));
    }

    @Override
    public long countOnlineUsers() {
        pruneOfflineUsers();
        return countDistinctUsers(onlineUsers);
    }

    private String reactionKey(String type, Long targetId, String suffix) {
        return "treehole:react:" + type + ":" + targetId + ":" + suffix;
    }

    private void decrementReaction(Map<String, Integer> counts, String emoji) {
        counts.computeIfPresent(emoji, (ignored, value) -> value <= 1 ? null : value - 1);
    }

    private void incrementRank(Map<String, Double> ranks, String key, double score) {
        ranks.compute(key, (ignored, current) -> {
            double next = (current == null ? 0 : current) + score;
            return next <= 0 ? null : next;
        });
    }

    private void seedReactionCountsIfEmpty(String countsKey, String dbSnapshotJson) {
        Map<String, Integer> counts = reactionCounts.computeIfAbsent(countsKey, ignored -> new ConcurrentHashMap<>());
        if (!counts.isEmpty() || dbSnapshotJson == null || dbSnapshotJson.isBlank()) return;

        try {
            Map<String, Integer> snapshot = objectMapper.readValue(dbSnapshotJson, new TypeReference<>() {});
            snapshot.forEach((emoji, count) -> {
                if (count != null && count > 0) counts.put(emoji, count);
            });
        } catch (Exception ignored) {
        }
    }

    private Map<String, Integer> readReactionCounts(String countsKey) {
        Map<String, Integer> raw = reactionCounts.getOrDefault(countsKey, Map.of());
        Map<String, Integer> counts = new HashMap<>();
        raw.forEach((emoji, count) -> {
            if (count != null && count > 0) counts.put(emoji, count);
        });
        return counts;
    }

    private void pruneOfflineUsers() {
        long cutoff = Instant.now().getEpochSecond() - ONLINE_TTL_SECONDS;
        onlineUsers.entrySet().removeIf(entry -> entry.getValue() <= cutoff);
        moduleActiveUsers.values().forEach(users -> users.entrySet().removeIf(entry -> entry.getValue() <= cutoff));
        long now = Instant.now().toEpochMilli();
        rateLimitExpires.entrySet().removeIf(entry -> entry.getValue() <= now);
    }

    private String sessionMember(String userId, String sessionId) {
        if (userId == null || userId.isBlank() || sessionId == null || sessionId.isBlank()) return null;
        return userId + ":" + sessionId;
    }

    private long countDistinctUsers(Map<String, Long> members) {
        if (members == null || members.isEmpty()) return 0;
        return members.keySet().stream()
                .map(this::extractUserId)
                .filter(userId -> userId != null && !userId.isBlank())
                .collect(Collectors.toSet())
                .size();
    }

    private String extractUserId(String member) {
        if (member == null || member.isBlank()) return null;
        int splitIndex = member.lastIndexOf(':');
        return splitIndex <= 0 ? member : member.substring(0, splitIndex);
    }

    private String normalizeModule(String module) {
        String normalized = normalizeToken(module, "unknown");
        return TRACKED_MODULES.contains(normalized) ? normalized : "unknown";
    }

    private String normalizeToken(String value, String fallback) {
        if (value == null || value.isBlank()) return fallback;
        String normalized = value.trim().toLowerCase();
        return normalized.matches("[a-z0-9_-]+") ? normalized : fallback;
    }
}
