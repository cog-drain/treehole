package com.treehole.controller;

import com.treehole.common.Result;
import com.treehole.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 用户 Controller：负责身份备份与还原
 */
@Tag(name = "用户模块", description = "处理本地身份的备份密钥生成与跨设备身份恢复")
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "获取身份备份密钥", description = "生成一串加密密钥，用于在其他浏览器或设备找回当前身份")
    @GetMapping("/backup")
    public Result<String> backup(@RequestHeader(value = "X-User-Id") String userId) {
        return Result.success(userService.generateRecoveryKey(userId));
    }

    @Operation(summary = "还原身份", description = "通过备份密钥找回之前的树洞身份")
    @PostMapping("/restore")
    public Result<String> restore(@RequestBody Map<String, String> body) {
        String recoveryKey = body.get("recoveryKey");
        return Result.success(userService.restoreUserId(recoveryKey));
    }
}
