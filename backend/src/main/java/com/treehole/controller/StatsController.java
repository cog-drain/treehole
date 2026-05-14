package com.treehole.controller;

import com.treehole.common.Result;
import com.treehole.service.RedisRealtimeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "统计模块", description = "提供实时在线、活跃度等轻量统计数据")
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final RedisRealtimeService redisRealtimeService;

    @Operation(summary = "当前在线人数", description = "基于 Redis ZSet 统计最近活跃的 WebSocket 用户")
    @GetMapping("/online")
    public Result<Map<String, Object>> online() {
        return Result.success(Map.of(
                "online", redisRealtimeService.countOnlineUsers(),
                "modules", redisRealtimeService.countActiveModules()
        ));
    }

    @Operation(summary = "实时行为热度", description = "基于 Redis ZSet 返回前端关键行为聚合排行")
    @GetMapping("/activity")
    public Result<Map<String, Long>> activity() {
        return Result.success(redisRealtimeService.topActions(10));
    }
}
