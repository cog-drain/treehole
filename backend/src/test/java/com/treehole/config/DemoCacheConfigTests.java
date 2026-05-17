package com.treehole.config;

import org.junit.jupiter.api.Test;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class DemoCacheConfigTests {

    @Test
    void demoCacheManagerShouldProvideApplicationCachesWithoutRedis() {
        CacheManager cacheManager = new DemoCacheConfig().cacheManager();

        Cache messagePage = cacheManager.getCache("messagePage");
        Cache graphData = cacheManager.getCache("graphData");

        assertNotNull(messagePage);
        assertNotNull(graphData);
    }
}
