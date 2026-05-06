package com.treehole.common;

import lombok.Getter;

/**
 * 自定义业务异常 (支持 ErrorCode)
 */
@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    /**
     * 基于完整错误码构造
     */
    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    /**
     * 基于错误码 + 自定义描述构造
     */
    public BusinessException(ErrorCode errorCode, String customMsg) {
        super(customMsg);
        this.errorCode = errorCode;
    }
}
