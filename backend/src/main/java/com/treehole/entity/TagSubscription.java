package com.treehole.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("tag_subscription")
public class TagSubscription {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("user_id")
    private String userId;

    @TableField("tag_id")
    private Long tagId;

    @TableField("create_time")
    private LocalDateTime createTime;
}
