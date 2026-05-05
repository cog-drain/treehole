package com.treehole.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 评论实体类
 */
@Data
@TableName("comment")
public class Comment {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("message_id")
    private Long messageId;

    /** 绑定匿名身份 (Local Identity) */
    @TableField("user_id")
    @JsonIgnore
    private String userId;

    @TableField("author_alias")
    private String authorAlias;

    @TableField("content")
    private String content;

    @TableField("image_url")
    private String imageUrl;

    @TableField("parent_id")
    private Long parentId;

    @TableLogic
    private Integer isDeleted;

    @TableField("ip_address")
    private String ipAddress;

    /** 动态表情统计 (JSON字符串存储) */
    private String reactions;

    /** 创建时间 */
    private LocalDateTime createTime;

    /** 是否为当前用户发布的 (非持久化字段) */
    @TableField(exist = false)
    @com.fasterxml.jackson.annotation.JsonProperty("isOwner")
    private Boolean isOwner = false;

    /** 是否为同频者 (非持久化字段) */
    @TableField(exist = false)
    @com.fasterxml.jackson.annotation.JsonProperty("coFrequency")
    private Boolean coFrequency = false;
}
