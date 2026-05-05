package com.treehole.controller;

import com.treehole.common.Result;
import com.treehole.entity.Comment;
import com.treehole.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 评论 Controller (支持 Local Identity)
 */
@RestController
@RequestMapping("/api/comment")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public Result<Map<String, Object>> publish(@RequestBody Comment comment,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            jakarta.servlet.http.HttpServletRequest request) {
        comment.setIpAddress(request.getRemoteAddr());
        String finalUserId = extractUserId(userId, authorization);
        return Result.success(commentService.publish(comment, finalUserId));
    }

    @GetMapping("/list/{messageId}")
    public Result<List<Comment>> listByMessageId(@PathVariable Long messageId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        return Result.success(commentService.listByMessageId(messageId, finalUserId));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        commentService.deleteWithToken(id, finalUserId);
        return Result.success();
    }

    @PostMapping("/react/{id}")
    public Result<Void> react(@PathVariable Long id, @RequestParam String emoji) {
        commentService.react(id, emoji);
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
