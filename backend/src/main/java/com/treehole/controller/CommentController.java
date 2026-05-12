package com.treehole.controller;

import com.treehole.common.Result;
import com.treehole.entity.Comment;
import com.treehole.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 评论 Controller
 */
@Tag(name = "评论模块", description = "处理留言下的回复与评论互动")
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "发表评论", description = "支持对留言或其他评论进行回复")
    @PostMapping
    public Result<Map<String, Object>> publish(@RequestBody Comment comment,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            jakarta.servlet.http.HttpServletRequest request) {
        comment.setIpAddress(request.getRemoteAddr());
        String finalUserId = extractUserId(userId, authorization);
        return Result.success(commentService.publish(comment, finalUserId));
    }

    @Operation(summary = "获取评论列表", description = "获取指定留言下的所有评论树")
    @GetMapping
    public Result<List<Comment>> listByMessageId(@RequestParam Long messageId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        return Result.success(commentService.listByMessageId(messageId, finalUserId));
    }

    @Operation(summary = "删除评论", description = "仅评论持有者或管理员可删除")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        commentService.deleteWithToken(id, finalUserId);
        return Result.success();
    }

    @Operation(summary = "评论回响", description = "发送 Emoji 回响")
    @PostMapping("/{id}/reactions")
    public Result<Void> react(@PathVariable Long id, @RequestParam String emoji,
                              @RequestHeader(value = "X-User-Id", required = false) String userId,
                              @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        commentService.react(id, emoji, finalUserId);
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
