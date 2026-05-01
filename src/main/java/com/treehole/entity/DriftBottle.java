package com.treehole.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 漂流瓶实体类 (完整版)
 */
@Data
@TableName("drift_bottle")
public class DriftBottle {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 投放者ID */
    @TableField("user_id")
    @JsonIgnore
    private String userId;

    /** 投放者昵称 */
    @TableField("author_alias")
    private String authorAlias;

    /** 瓶子主题/样式 */
    private String theme;

    /** 内容 */
    private String content;

    /** 状态: 0=漂流中, 1=被捞起, 2=已归还 */
    private Integer state;

    /** 捞取者ID */
    @TableField("picker_id")
    @JsonIgnore
    private String pickerId;

    /** 投放时间 */
    private LocalDateTime createTime;
}
