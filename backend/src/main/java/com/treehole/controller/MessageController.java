package com.treehole.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.treehole.common.Result;
import com.treehole.entity.Message;
import com.treehole.service.MessageService;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * 留言 Controller (支持 Local Identity)
 */
@Tag(name = "留言模块", description = "处理树洞留言的发布、查询、删除及互动")
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * 发布留言
     */
    @Operation(summary = "发布新留言", description = "支持匿名发布，通过 Header 传递身份标识")
    @PostMapping
    public Result<Map<String, Object>> publish(@RequestBody Message message, 
                                               @RequestHeader(value = "X-User-Id", required = false) String userId,
                                               @RequestHeader(value = "Authorization", required = false) String authorization,
                                               HttpServletRequest request) {
        message.setIpAddress(request.getRemoteAddr());
        String finalUserId = extractUserId(userId, authorization);
        return Result.success(messageService.publish(message, finalUserId));
    }

    /**
     * 分页查询留言列表 (支持标签过滤)
     */
    @Operation(summary = "获取留言列表", description = "支持分页及标签过滤查询")
    @GetMapping
    public Result<IPage<Message>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String tag,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        if (tag != null && !tag.isBlank()) {
            return Result.success(messageService.listByTag(tag, pageNum, pageSize, finalUserId));
        }
        return Result.success(messageService.listByPage(pageNum, pageSize, finalUserId));
    }

    @Operation(summary = "删除留言", description = "仅留言持有者或管理员可删除")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id,
                               @RequestHeader(value = "X-User-Id", required = false) String userId,
                               @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        messageService.deleteWithComments(id, finalUserId);
        return Result.success();
    }

    @Operation(summary = "留言点赞")
    @PutMapping("/{id}/like")
    public Result<Void> like(@PathVariable Long id) {
        messageService.like(id);
        return Result.success();
    }

    @Operation(summary = "留言回响", description = "发送 Emoji 回响")
    @PostMapping("/{id}/reactions")
    public Result<Void> react(@PathVariable Long id, @RequestParam String emoji,
                              @RequestHeader(value = "X-User-Id", required = false) String userId,
                              @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        messageService.react(id, emoji, finalUserId);
        return Result.success();
    }


    /**
     * 提取身份标识：优先认 X-User-Id，兼容 Authorization
     */
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
