package com.treehole.common;

import lombok.Getter;

/**
 * 树洞项目统一错误码体系
 * 命名规范：模块_描述
 */
@Getter
public enum ErrorCode {

    // --- 基础状态 (0, 4xx, 5xx) ---
    SUCCESS(0, "操作成功"),
    PARAM_ERROR(400, "请求参数异常"),
    UNAUTHORIZED(401, "身份认证失效，请重新进入"),
    FORBIDDEN(403, "权限不足，操作被拒绝"),
    NOT_FOUND(404, "资源不存在"),
    SYSTEM_ERROR(500, "树洞服务器开小差了，请稍后再试"),

    // --- 业务逻辑错误 (1000+) ---
    // 身份类
    IDENTITY_NOT_FOUND(1001, "未识别到有效的树洞身份"),
    IDENTITY_BANNED(1002, "由于违反社区规则，你的 IP 已被封禁"),
    IDENTITY_RECOVERY_INVALID(1003, "恢复码无效或已失效"),
    
    // 内容类
    CONTENT_EMPTY(2001, "内容不能为空"),
    CONTENT_TOO_LONG(2002, "内容超出了树洞的承载范围"),
    CONTENT_SENSITIVE(2003, "内容包含敏感词，请修改后再发"),
    
    // 互动类
    ALREADY_REACTED(3001, "你已经对此产生过回响了"),
    BOTTLE_NOT_FOUND(3002, "这个瓶子已经漂向深海，找不到了"),
    BOTTLE_PICK_LIMIT(3003, "今日打捞次数已达上限");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
