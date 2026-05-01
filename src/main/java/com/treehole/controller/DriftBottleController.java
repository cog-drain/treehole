package com.treehole.controller;

import com.treehole.common.Result;
import com.treehole.entity.DriftBottle;
import com.treehole.service.DriftBottleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 漂流瓶 Controller (支持 Local Identity)
 */
@RestController
@RequestMapping("/api/bottle")
@RequiredArgsConstructor
public class DriftBottleController {

    private final DriftBottleService bottleService;

    @PostMapping("/throw")
    public Result<Void> throwBottle(@RequestBody DriftBottle bottle, 
                                    @RequestHeader(value = "X-User-Id", required = false) String userId,
                                    @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        bottleService.throwBottle(bottle, finalUserId);
        return Result.success();
    }

    @GetMapping("/pick")
    public Result<DriftBottle> pickBottle(@RequestHeader(value = "X-User-Id", required = false) String userId,
                                          @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        return Result.success(bottleService.pickBottle(finalUserId));
    }

    @PostMapping("/reply/{id}")
    public Result<Void> replyBottle(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        bottleService.replyBottle(id, body.get("content"), finalUserId);
        return Result.success();
    }

    @PostMapping("/return/{id}")
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
