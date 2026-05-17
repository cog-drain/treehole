package com.treehole.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.treehole.common.Result;
import com.treehole.dto.NotificationDTO;
import com.treehole.dto.UnreadCountDTO;
import com.treehole.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "通知模块", description = "处理站内通知列表、未读数和已读状态")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "获取通知列表")
    @GetMapping
    public Result<IPage<NotificationDTO>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        return Result.success(notificationService.pageByRecipient(finalUserId, pageNum, pageSize, unreadOnly));
    }

    @Operation(summary = "获取未读通知数")
    @GetMapping("/unread-count")
    public Result<UnreadCountDTO> unreadCount(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        return Result.success(new UnreadCountDTO(notificationService.countUnread(finalUserId)));
    }

    @Operation(summary = "标记单条通知已读")
    @PutMapping("/{id}/read")
    public Result<Void> markRead(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        notificationService.markRead(finalUserId, id);
        return Result.success();
    }

    @Operation(summary = "标记全部通知已读")
    @PutMapping("/read-all")
    public Result<Void> markAllRead(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        notificationService.markAllRead(finalUserId);
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
