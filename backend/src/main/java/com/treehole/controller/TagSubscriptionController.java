package com.treehole.controller;

import com.treehole.common.Result;
import com.treehole.dto.TagSubscriptionDTO;
import com.treehole.service.TagSubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "标签订阅模块", description = "管理话题订阅与标签新内容提醒")
@RestController
@RequestMapping("/api/tag-subscriptions")
@RequiredArgsConstructor
public class TagSubscriptionController {

    private final TagSubscriptionService tagSubscriptionService;

    @Operation(summary = "获取当前身份的标签订阅")
    @GetMapping
    public Result<List<TagSubscriptionDTO>> list(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return Result.success(tagSubscriptionService.listByUser(extractUserId(userId, authorization)));
    }

    @Operation(summary = "订阅标签")
    @PostMapping("/{tagId}")
    public Result<TagSubscriptionDTO> subscribe(
            @PathVariable Long tagId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return Result.success(tagSubscriptionService.subscribe(extractUserId(userId, authorization), tagId));
    }

    @Operation(summary = "取消订阅标签")
    @DeleteMapping("/{tagId}")
    public Result<Void> unsubscribe(
            @PathVariable Long tagId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        tagSubscriptionService.unsubscribe(extractUserId(userId, authorization), tagId);
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
