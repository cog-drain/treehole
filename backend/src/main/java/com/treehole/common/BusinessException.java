package com.treehole.common;

import lombok.Getter;

/**
 * 自定义业务异常
 * <p>
 * 用于在 Service 层抛出可预期的业务错误（如权限不足、资源不存在等），
 * 由 {@link GlobalExceptionHandler} 统一捕获并返回友好响应。
 */
@Getter
public class BusinessException extends RuntimeException {

    /** HTTP 风格的状态码，例如 403、404 */
    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(String message) {
        this(500, message);
    }
}
