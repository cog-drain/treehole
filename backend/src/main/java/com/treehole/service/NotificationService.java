package com.treehole.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.treehole.dto.NotificationDTO;
import com.treehole.entity.Comment;
import com.treehole.entity.Message;
import com.treehole.entity.Notification;

public interface NotificationService extends IService<Notification> {

    NotificationDTO create(Notification notification);

    NotificationDTO createForMessageCommented(Message message, Comment comment, String actorId);

    NotificationDTO createForMessageLiked(Message message, String actorId);

    NotificationDTO createForCommentReplied(Message message, Comment parentComment, Comment reply, String actorId);

    NotificationDTO createForCommentLiked(Message message, Comment comment, String actorId);

    NotificationDTO createForConfessionWitnessed(Message message, String actorId);

    IPage<NotificationDTO> pageByRecipient(String recipientId, int pageNum, int pageSize, boolean unreadOnly);

    long countUnread(String recipientId);

    void markRead(String recipientId, Long notificationId);

    void markAllRead(String recipientId);
}
