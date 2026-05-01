package com.treehole.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.treehole.entity.User;



public interface UserService extends IService<User> {
    /** 生成恢复密钥 */
    String generateRecoveryKey(String userId);
    
    /** 通过恢复密钥还原身份 */
    String restoreUserId(String recoveryKey);
}
