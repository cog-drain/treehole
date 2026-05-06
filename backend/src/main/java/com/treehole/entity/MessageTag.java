package com.treehole.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 留言与标签关联表实体类
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@TableName("message_tag")
public class MessageTag {

    /** 留言ID */
    @TableId
    private Long messageId;

    /** 标签ID */
    private Long tagId;
}
