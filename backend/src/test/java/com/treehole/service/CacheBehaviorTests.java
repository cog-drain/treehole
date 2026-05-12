package com.treehole.service;

import com.treehole.dto.GraphDataDTO;
import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

@SpringJUnitConfig(classes = CacheBehaviorTests.TestConfig.class)
class CacheBehaviorTests {

    @Configuration
    @EnableCaching
    static class TestConfig {
        @Bean
        CacheManager cacheManager() {
            return new ConcurrentMapCacheManager(
                    "graphData",
                    "messagePage",
                    "messageTagPage",
                    "trendingTags",
                    "commentList"
            );
        }

        @Bean
        CacheInvalidationService cacheInvalidationService() {
            return new CacheInvalidationService();
        }

        @Bean
        DummyGraphService dummyGraphService() {
            return new DummyGraphService();
        }
    }

    @Service
    static class DummyGraphService {
        private final AtomicInteger calls = new AtomicInteger();

        @Cacheable(cacheNames = "graphData", key = "'latest'")
        public GraphDataDTO getGraphData() {
            calls.incrementAndGet();
            return new GraphDataDTO(
                    List.of(new GraphDataDTO.Node(1L, "cached", "calm", "paper", "anon")),
                    List.of()
            );
        }

        int getCalls() {
            return calls.get();
        }
    }

    @jakarta.annotation.Resource
    private CacheManager cacheManager;

    @jakarta.annotation.Resource
    private CacheInvalidationService cacheInvalidationService;

    @jakarta.annotation.Resource
    private DummyGraphService dummyGraphService;

    @Test
    void graphDataShouldBeCached() {
        GraphDataDTO first = dummyGraphService.getGraphData();
        GraphDataDTO second = dummyGraphService.getGraphData();

        assertNotNull(first);
        assertNotNull(second);
        assertEquals(1, dummyGraphService.getCalls());
    }

    @Test
    void cacheInvalidationShouldClearRelatedCaches() {
        Cache messagePage = cacheManager.getCache("messagePage");
        Cache commentList = cacheManager.getCache("commentList");
        assertNotNull(messagePage);
        assertNotNull(commentList);

        messagePage.put("page-key", "value");
        commentList.put("comment-key", "value");

        cacheInvalidationService.evictCommentAndMessageListCaches();

        assertNull(messagePage.get("page-key"));
        assertNull(commentList.get("comment-key"));
    }
}
