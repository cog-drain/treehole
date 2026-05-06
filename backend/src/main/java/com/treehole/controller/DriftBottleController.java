package com.treehole.controller;

import com.treehole.common.Result;
import com.treehole.entity.DriftBottle;
import com.treehole.service.DriftBottleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 漂流瓶 Controller (支持 Local Identity)
 */
@Tag(name = "漂流瓶模块", description = "处理漂流瓶的投放、捞取与匿名回复")
@RestController
@RequestMapping("/api/bottles")
@RequiredArgsConstructor
public class DriftBottleController {

    private final DriftBottleService bottleService;

    @Operation(summary = "投掷漂流瓶", description = "将你的心情封装在瓶子中投入大海")
    @PostMapping
    public Result<Void> throwBottle(@RequestBody DriftBottle bottle, 
                                    @RequestHeader(value = "X-User-Id", required = false) String userId,
                                    @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        bottleService.throwBottle(bottle, finalUserId);
        return Result.success();
    }

    @Operation(summary = "获取我的瓶子", description = "查看你曾经投向大海的所有瓶子")
    @GetMapping("/my")
    public Result<java.util.List<DriftBottle>> getMyBottles(@RequestHeader(value = "X-User-Id", required = false) String userId,
                                                           @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        return Result.success(bottleService.getMyBottles(finalUserId));
    }

    @Operation(summary = "打捞漂流瓶", description = "从大海中随机打捞一个陌生人的心声")
    @GetMapping("/pick")
    public Result<DriftBottle> pickBottle(@RequestHeader(value = "X-User-Id", required = false) String userId,
                                          @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        return Result.success(bottleService.pickBottle(finalUserId));
    }

    @Operation(summary = "回复漂流瓶", description = "对打捞到的瓶子给予温柔的回应")
    @PostMapping("/{id}/replies")
    public Result<Void> replyBottle(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        bottleService.replyBottle(id, body.get("content"), body.get("replyAuthorAlias"), finalUserId);
        return Result.success();
    }

    /**
     * 将瓶子扔回大海 (放弃持有)
     */
    @Operation(summary = "归还漂流瓶", description = "看过之后若无共鸣，请将其归还大海")
    @DeleteMapping("/{id}")
    public Result<Void> returnBottle(@PathVariable Long id, 
                                     @RequestHeader(value = "X-User-Id", required = false) String userId,
                                     @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        bottleService.returnBottle(id, finalUserId);
        return Result.success();
    }

    private String extractUserId(String userIdHeader, String authHeader) {
        if (userIdHeader != null && !userIdHeader.isBlank()) {
            return userIdHeader.trim();
        }
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        return authHeader;
    }
}
