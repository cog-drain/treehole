package com.treehole.common;

import lombok.Data;
import java.io.Serializable;

/**
 * 统一返回结果封装类 (大厂标准化版本)
 */
@Data
public class Result<T> implements Serializable {

    private Integer code;
    private String msg;
    private T data;

    private Result() {}

    /**
     * 成功返回 (无数据)
     */
    public static <T> Result<T> success() {
        return success(null);
    }

    /**
     * 成功返回 (带数据)
     */
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(ErrorCode.SUCCESS.getCode());
        result.setMsg(ErrorCode.SUCCESS.getMessage());
        result.setData(data);
        return result;
    }

    /**
     * 错误返回 (基于 ErrorCode 枚举)
     */
    public static <T> Result<T> error(ErrorCode errorCode) {
        Result<T> result = new Result<>();
        result.setCode(errorCode.getCode());
        result.setMsg(errorCode.getMessage());
        return result;
    }

    /**
     * 错误返回 (基于 ErrorCode 枚举 + 自定义描述)
     */
    public static <T> Result<T> error(ErrorCode errorCode, String customMsg) {
        Result<T> result = new Result<>();
        result.setCode(errorCode.getCode());
        result.setMsg(customMsg);
        return result;
    }

    /**
     * 极简错误返回 (默认系统错误)
     */
    public static <T> Result<T> error(String msg) {
        return error(ErrorCode.SYSTEM_ERROR, msg);
    }

    /**
     * 全自定义错误返回 (兼容旧版)
     */
    public static <T> Result<T> error(Integer code, String msg) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMsg(msg);
        return result;
    }
}
