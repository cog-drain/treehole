package com.treehole.service;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

@Service
public class CacheInvalidationService {

    @Caching(evict = {
            @CacheEvict(cacheNames = "messagePage", allEntries = true),
            @CacheEvict(cacheNames = "messageTagPage", allEntries = true),
            @CacheEvict(cacheNames = "trendingTags", allEntries = true),
            @CacheEvict(cacheNames = "graphData", allEntries = true)
    })
    public void evictMessageStructureCaches() {
        // Annotation-driven cache eviction.
    }

    @Caching(evict = {
            @CacheEvict(cacheNames = "messagePage", allEntries = true),
            @CacheEvict(cacheNames = "messageTagPage", allEntries = true)
    })
    public void evictMessageListCaches() {
        // Annotation-driven cache eviction.
    }

    @CacheEvict(cacheNames = "commentList", allEntries = true)
    public void evictCommentCaches() {
        // Annotation-driven cache eviction.
    }

    @Caching(evict = {
            @CacheEvict(cacheNames = "commentList", allEntries = true),
            @CacheEvict(cacheNames = "messagePage", allEntries = true),
            @CacheEvict(cacheNames = "messageTagPage", allEntries = true)
    })
    public void evictCommentAndMessageListCaches() {
        // Annotation-driven cache eviction.
    }
}
