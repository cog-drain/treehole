package com.treehole.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import org.springframework.cache.CacheManager;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@Profile("!demo")
@Slf4j
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory, ObjectMapper objectMapper) {
        ObjectMapper cacheObjectMapper = objectMapper.copy();
        cacheObjectMapper.activateDefaultTyping(
                BasicPolymorphicTypeValidator.builder().allowIfSubType(Object.class).build(),
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.WRAPPER_ARRAY
        );

        GenericJackson2JsonRedisSerializer serializer =
                new GenericJackson2JsonRedisSerializer(cacheObjectMapper);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .disableCachingNullValues()
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer))
                .computePrefixWith(cacheName -> "treehole::" + cacheName + "::")
                .entryTtl(Duration.ofMinutes(5));

        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        cacheConfigs.put("messagePage", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigs.put("messageTagPage", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigs.put("trendingTags", defaultConfig.entryTtl(Duration.ofMinutes(10)));
        cacheConfigs.put("graphData", defaultConfig.entryTtl(Duration.ofMinutes(10)));
        cacheConfigs.put("commentList", defaultConfig.entryTtl(Duration.ofMinutes(5)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .transactionAware()
                .build();
    }

    @Bean
    public CacheErrorHandler cacheErrorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, org.springframework.cache.Cache cache, Object key) {
                log.warn("Cache get failed, falling back to source. cache={}, key={}, error={}",
                        cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, org.springframework.cache.Cache cache, Object key, Object value) {
                log.warn("Cache put failed. cache={}, key={}, error={}",
                        cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, org.springframework.cache.Cache cache, Object key) {
                log.warn("Cache evict failed. cache={}, key={}, error={}",
                        cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, org.springframework.cache.Cache cache) {
                log.warn("Cache clear failed. cache={}, error={}", cache.getName(), exception.getMessage());
            }
        };
    }
}
