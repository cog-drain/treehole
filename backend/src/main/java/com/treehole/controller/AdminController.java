package com.treehole.controller;

import com.treehole.common.Result;
import com.treehole.entity.Blacklist;
import com.treehole.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 管理员 Controller
 */
@Tag(name = "管理模块", description = "系统后台管理功能，包括认证、黑名单控制等")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @Operation(summary = "管理员登录", description = "验证密码并获取后台管理令牌")
    @PostMapping("/auth")
    public Result<String> login(@RequestBody Map<String, String> body) {
        return Result.success(adminService.login(body.get("password")));
    }

    @Operation(summary = "重置密码", description = "修改后台管理密码")
    @PutMapping("/password")
    public Result<Void> resetPassword(@RequestBody Map<String, String> body) {
        adminService.resetPassword(body.get("oldPassword"), body.get("newPassword"));
        return Result.success(null);
    }

    @Operation(summary = "强制删除留言", description = "管理员无视权限强制移除违规留言")
    @DeleteMapping("/messages/{id}")
    public Result<Void> deleteMessage(@PathVariable Long id) {
        adminService.deleteMessage(id);
        return Result.success(null);
    }

    @Operation(summary = "强制删除评论", description = "管理员无视权限强制移除违规评论")
    @DeleteMapping("/comments/{id}")
    public Result<Void> deleteComment(@PathVariable Long id) {
        adminService.deleteComment(id);
        return Result.success(null);
    }

    /**
     * 加入黑名单 (封禁 IP)
     */
    @PostMapping("/blacklist")
    public Result<Void> banIP(@RequestBody Map<String, String> body) {
        adminService.banIP(body.get("ip"), body.get("reason"));
        return Result.success(null);
    }

    /**
     * 移出黑名单 (解封 IP)
     */
    @DeleteMapping("/blacklist")
    public Result<Void> unbanIP(@RequestParam String ip) {
        adminService.unbanIP(ip);
        return Result.success(null);
    }

    /**
     * 获取黑名单列表
     */
    @Operation(summary = "获取黑名单", description = "列出所有被封禁的 IP 及其原因")
    @GetMapping("/blacklist")
    public Result<List<Blacklist>> listBlacklist() {
        return Result.success(adminService.listBlacklist());
    }
}
