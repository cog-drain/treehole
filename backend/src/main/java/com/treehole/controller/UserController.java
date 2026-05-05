package com.treehole.controller;

import com.treehole.common.Result;
import com.treehole.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 用户 Controller：负责身份备份与还原
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 获取备份密钥
     */
    @GetMapping("/backup")
    public Result<String> backup(@RequestHeader(value = "X-User-Id") String userId) {
        return Result.success(userService.generateRecoveryKey(userId));
    }

    /**
     * 还原身份
     */
    @PostMapping("/restore")
    public Result<String> restore(@RequestBody Map<String, String> body) {
        String recoveryKey = body.get("recoveryKey");
        return Result.success(userService.restoreUserId(recoveryKey));
    }
}
