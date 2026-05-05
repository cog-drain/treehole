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
 * 树洞留言实体类
 */
@Data
@TableName("message")
public class Message {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 绑定匿名身份 (Local Identity) */
    @TableField("user_id")
    @JsonIgnore
    private String userId;

    /** 留言内容 */
    private String content;

    /** 匿名昵称 */
    private String authorAlias;

    /** 点赞数 */
    private Integer likes;

    /** 评论数 */
    private Integer commentCount;

    /** 附图URL（可选） */
    private String imageUrl;

    /** 语音URL（可选） */
    private String audioUrl;

    /** 心情（开心/难过/愤怒/平静/迷茫） */
    private String mood;

    /** 信纸皮肤 */
    private String theme;

    @TableLogic
    private Integer isDeleted;

    private String ipAddress;

    /** 动态表情统计 (JSON字符串存储，如 {"❤️":2, "🔥":1}) */
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
