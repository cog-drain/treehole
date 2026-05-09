package com.treehole.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.treehole.common.BusinessException;
import com.treehole.common.ErrorCode;
import com.treehole.dto.IdentityBackupDTO;
import com.treehole.entity.User;
import com.treehole.mapper.UserMapper;
import com.treehole.service.UserService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 用户 Service 实现类
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private static final String KEY_PREFIX = "treehole-";

    @Override
    public IdentityBackupDTO generateRecoveryKey(String userId, String displayName) {
        // 确保用户存在或记录存在
        String normalized = normalizeDisplayName(displayName);
        User user = this.getById(userId);
        if (user == null) {
            user = new User(userId, normalized, newRecoveryToken(), LocalDateTime.now());
            this.save(user);
        } else {
            if (normalized != null && !normalized.equals(user.getDisplayName())) {
                user.setDisplayName(normalized);
            }
            user.setRecoveryToken(newRecoveryToken());
            this.updateById(user);
        }
        return new IdentityBackupDTO(user.getId(), user.getRecoveryToken(), user.getDisplayName());
    }

    @Override
    public IdentityBackupDTO restoreUserId(String recoveryKey) {
        if (recoveryKey == null || recoveryKey.isBlank()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "恢复码不能为空");
        }

        String normalized = recoveryKey.trim();
        User user = this.lambdaQuery().eq(User::getRecoveryToken, normalized).one();

        if (user == null && normalized.startsWith(KEY_PREFIX)) {
            String userId = normalized.substring(KEY_PREFIX.length());
            user = this.getById(userId);
            if (user != null && (user.getRecoveryToken() == null || user.getRecoveryToken().isBlank())) {
                user.setRecoveryToken(newRecoveryToken());
                this.updateById(user);
            } else {
                user = null;
            }
        }
        
        if (user == null) {
            throw new BusinessException(ErrorCode.IDENTITY_RECOVERY_INVALID, "恢复码无效、已失效，或已被新的恢复码替换");
        }

        return new IdentityBackupDTO(user.getId(), user.getRecoveryToken(), user.getDisplayName());
    }

    private String normalizeDisplayName(String displayName) {
        if (displayName == null || displayName.isBlank()) {
            return null;
        }
        return displayName.trim();
    }

    private String newRecoveryToken() {
        return KEY_PREFIX + UUID.randomUUID().toString().replace("-", "");
    }
}
