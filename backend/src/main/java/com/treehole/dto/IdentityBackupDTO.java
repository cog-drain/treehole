package com.treehole.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 身份恢复信息
 */
@Data
@AllArgsConstructor
public class IdentityBackupDTO {
    private String userId;
    private String recoveryKey;
    private String displayName;
}
