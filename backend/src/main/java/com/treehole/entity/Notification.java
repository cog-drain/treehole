package com.treehole.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("notification")
public class Notification {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("recipient_id")
    private String recipientId;

    @TableField("actor_id")
    private String actorId;

    private String type;

    @TableField("target_type")
    private String targetType;

    @TableField("message_id")
    private Long messageId;

    @TableField("comment_id")
    private Long commentId;

    @TableField("parent_comment_id")
    private Long parentCommentId;

    @TableField("tag_id")
    private Long tagId;

    @TableField("tag_name")
    private String tagName;

    private String title;

    private String summary;

    @TableField("is_read")
    private Boolean readStatus;

    @TableField("create_time")
    private LocalDateTime createTime;

    public Boolean getRead() {
        return readStatus;
    }

    public void setRead(Boolean read) {
        this.readStatus = read;
    }
}
