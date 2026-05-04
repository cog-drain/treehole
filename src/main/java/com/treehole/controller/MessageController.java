package com.treehole.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.treehole.common.Result;
import com.treehole.entity.Message;
import com.treehole.service.MessageService;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * 留言 Controller (支持 Local Identity)
 */
@RestController
@RequestMapping("/api/message")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    /**
     * 发布留言
     * <p>
     * 使用 X-User-Id 请求头作为身份标识。
     */
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
     * 分页查询留言列表
     */
    @GetMapping("/list")
    public Result<IPage<Message>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        return Result.success(messageService.listByPage(pageNum, pageSize, finalUserId));
    }

    /**
     * 按标签分页查询留言列表
     */
    @GetMapping("/listByTag")
    public Result<IPage<Message>> listByTag(
            @RequestParam String tag,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        return Result.success(messageService.listByTag(tag, pageNum, pageSize, finalUserId));
    }

    @PutMapping("/like/{id}")
    public Result<Void> like(@PathVariable Long id) {
        messageService.like(id);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id,
                               @RequestHeader(value = "X-User-Id", required = false) String userId,
                               @RequestHeader(value = "Authorization", required = false) String authorization) {
        String finalUserId = extractUserId(userId, authorization);
        messageService.deleteWithComments(id, finalUserId);
        return Result.success();
    }

    @PostMapping("/react/{id}")
    public Result<Void> react(@PathVariable Long id, @RequestParam String emoji) {
        messageService.react(id, emoji);
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
