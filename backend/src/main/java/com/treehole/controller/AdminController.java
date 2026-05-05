package com.treehole.controller;

import com.treehole.common.Result;
import com.treehole.entity.Blacklist;
import com.treehole.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/login")
    public Result<String> login(@RequestBody Map<String, String> body) {
        return Result.success(adminService.login(body.get("password")));
    }

    @PostMapping("/resetPassword")
    public Result<Void> resetPassword(@RequestBody Map<String, String> body) {
        adminService.resetPassword(body.get("oldPassword"), body.get("newPassword"));
        return Result.success(null);
    }

    @DeleteMapping("/message/{id}")
    public Result<Void> deleteMessage(@PathVariable Long id) {
        adminService.deleteMessage(id);
        return Result.success(null);
    }

    @DeleteMapping("/comment/{id}")
    public Result<Void> deleteComment(@PathVariable Long id) {
        adminService.deleteComment(id);
        return Result.success(null);
    }

    @PostMapping("/ban")
    public Result<Void> banIP(@RequestBody Map<String, String> body) {
        adminService.banIP(body.get("ip"), body.get("reason"));
        return Result.success(null);
    }

    @DeleteMapping("/unban")
    public Result<Void> unbanIP(@RequestParam String ip) {
        adminService.unbanIP(ip);
        return Result.success(null);
    }

    @GetMapping("/blacklist")
    public Result<List<Blacklist>> listBlacklist() {
        return Result.success(adminService.listBlacklist());
    }
}
