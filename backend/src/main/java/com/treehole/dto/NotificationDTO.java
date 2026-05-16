package com.treehole.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private NotificationType type;
    private NotificationTargetType targetType;
    private Long messageId;
    private Long commentId;
    private Long parentCommentId;
    private Long tagId;
    private String tagName;
    private String title;
    private String summary;
    private Boolean read;
    private LocalDateTime createTime;
}
