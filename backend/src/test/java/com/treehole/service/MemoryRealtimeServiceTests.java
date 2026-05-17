package com.treehole.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.treehole.entity.Tag;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MemoryRealtimeServiceTests {

    private final MemoryRealtimeService service = new MemoryRealtimeService(new ObjectMapper());

    @Test
    void rateLimitShouldExpireInMemory() throws InterruptedException {
        assertTrue(service.tryAcquireRateLimit("demo:key", Duration.ofMillis(20)));
        assertFalse(service.tryAcquireRateLimit("demo:key", Duration.ofMillis(20)));

        Thread.sleep(30);

        assertTrue(service.tryAcquireRateLimit("demo:key", Duration.ofMillis(20)));
    }

    @Test
    void reactionShouldSeedSnapshotAndToggleUserChoice() {
        Map<String, Integer> first = service.updateReaction("msg", 1L, "user-a", "heart", "{\"smile\":2}");

        assertEquals(2, first.get("smile"));
        assertEquals(1, first.get("heart"));

        Map<String, Integer> second = service.updateReaction("msg", 1L, "user-a", "heart", "{\"smile\":2}");

        assertEquals(2, second.get("smile"));
        assertFalse(second.containsKey("heart"));
    }

    @Test
    void onlineUsersAndActionRanksShouldUseDistinctUsers() {
        service.markUserOnline("user-a", "session-1");
        service.markUserOnline("user-a", "session-2");
        service.markUserModuleActive("user-a", "session-1", "feed");
        service.recordAction("compose");
        service.recordAction("compose");

        assertEquals(1, service.countOnlineUsers());
        assertEquals(1, service.countActiveModules().get("feed"));
        assertEquals(2, service.topActions(10).get("compose"));
    }

    @Test
    void tagRankShouldOverlayDatabaseTags() {
        Tag existing = new Tag();
        existing.setName("old");
        existing.setUsageCount(1);
        service.incrementTagRank("fresh", 3);

        List<Tag> ranked = service.mergeTagRank(List.of(existing), 10);

        assertEquals("fresh", ranked.get(0).getName());
        assertEquals(3, ranked.get(0).getUsageCount());
    }

    @Test
    void tagRankShouldReturnAllDatabaseTagsWhenLimitIsZero() {
        Tag low = new Tag();
        low.setName("low");
        low.setUsageCount(1);
        Tag high = new Tag();
        high.setName("high");
        high.setUsageCount(2);
        service.incrementTagRank("fresh", 5);

        List<Tag> ranked = service.mergeTagRank(List.of(low, high), 0);

        assertEquals(2, ranked.size());
        assertEquals("high", ranked.get(0).getName());
        assertEquals("low", ranked.get(1).getName());
    }
}
