package com.treehole.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("admin_config")
public class AdminConfig {
    @TableId
    private String configKey;
    private String configValue;
}
