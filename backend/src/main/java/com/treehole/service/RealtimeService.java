package com.treehole.service;

import com.treehole.entity.Tag;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Set;

public interface RealtimeService {

    boolean tryAcquireRateLimit(String key, Duration ttl);

    void addBottleToPool(Long bottleId);

    void removeBottleFromPool(Long bottleId);

    Set<String> sampleBottleIds(int count);

    Map<String, Integer> updateReaction(String type, Long targetId, String userId, String emoji, String dbSnapshotJson);

    String toReactionJson(Map<String, Integer> reactionCounts);

    void incrementMessageRank(Long messageId, double score);

    void removeMessageRank(Long messageId);

    void incrementTagRank(String tagName, double score);

    List<Tag> mergeTagRank(List<Tag> dbTags, int limit);

    void markUserOnline(String userId, String sessionId);

    void markUserModuleActive(String userId, String sessionId, String module);

    void recordAction(String action);

    Map<String, Long> countActiveModules();

    Map<String, Long> topActions(int limit);

    void markUserOffline(String userId, String sessionId);

    long countOnlineUsers();
}
