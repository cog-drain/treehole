package com.treehole.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.treehole.common.BusinessException;
import com.treehole.entity.User;
import com.treehole.mapper.UserMapper;
import com.treehole.service.UserService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 用户 Service 实现类
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private static final String KEY_PREFIX = "treehole-";

    @Override
    public String generateRecoveryKey(String userId) {
        // 确保用户存在或记录存在
        User user = this.getById(userId);
        if (user == null) {
            user = new User(userId, LocalDateTime.now());
            this.save(user);
        }
        return KEY_PREFIX + userId;
    }

    @Override
    public String restoreUserId(String recoveryKey) {
        if (recoveryKey == null || !recoveryKey.startsWith(KEY_PREFIX)) {
            throw new BusinessException(400, "无效的恢复密钥格式");
        }
        
        String userId = recoveryKey.substring(KEY_PREFIX.length());
        User user = this.getById(userId);
        
        if (user == null) {
            throw new BusinessException(404, "找不到该密钥对应的存在迹象");
        }
        
        return user.getId();
    }
}
