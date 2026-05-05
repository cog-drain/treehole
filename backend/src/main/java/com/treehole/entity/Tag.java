package com.treehole.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 话题标签实体类
 */
@Data
@TableName("tag")
public class Tag {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 标签名(不含#) */
    private String name;

    /** 使用次数 */
    private Integer usageCount;

    /** 创建时间 */
    private LocalDateTime createTime;
}
