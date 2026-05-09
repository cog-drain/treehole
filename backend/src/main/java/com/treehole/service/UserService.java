package com.treehole.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.treehole.dto.IdentityBackupDTO;
import com.treehole.entity.User;



public interface UserService extends IService<User> {
    /** 生成恢复密钥 */
    IdentityBackupDTO generateRecoveryKey(String userId, String displayName);
    
    /** 通过恢复密钥还原身份 */
    IdentityBackupDTO restoreUserId(String recoveryKey);
}
