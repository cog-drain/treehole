package com.treehole.common;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

/**
 * Token 工具类 —— 用于生成和校验 Ownership Token
 */
public final class TokenUtil {

    private TokenUtil() {}

    /**
     * 生成一个随机的 UUID 令牌
     */
    public static String generateToken() {
        return UUID.randomUUID().toString();
    }

    /**
     * 对原始令牌进行 SHA-256 哈希，返回 64 位十六进制字符串
     */
    public static String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(64);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is guaranteed to be available in every JVM
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
