package com.treehole.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.treehole.common.BusinessException;
import com.treehole.common.ErrorCode;
import com.treehole.dto.NotificationDTO;
import com.treehole.dto.NotificationTargetType;
import com.treehole.dto.NotificationType;
import com.treehole.entity.Comment;
import com.treehole.entity.Message;
import com.treehole.entity.Notification;
import com.treehole.mapper.CommentMapper;
import com.treehole.mapper.MessageMapper;
import com.treehole.mapper.NotificationMapper;
import com.treehole.mapper.TagMapper;
import com.treehole.service.NotificationService;
import com.treehole.websocket.WebSocketServer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl extends ServiceImpl<NotificationMapper, Notification> implements NotificationService {

    private static final int SUMMARY_LIMIT = 120;
    private static final String OBSERVER_USER_ID = "observer_ai";
    private static final String CONFESSOR_USER_ID = "confessor_ai";
    private static final String MESSAGE_TYPE_CONFESSION = "confession";

    private final MessageMapper messageMapper;
    private final CommentMapper commentMapper;
    private final TagMapper tagMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public NotificationDTO create(Notification notification) {
        if (notification == null || isBlank(notification.getRecipientId())) return null;
        if (!isBlank(notification.getActorId()) && notification.getActorId().equals(notification.getRecipientId())) return null;
        if (isAutomatedActor(notification.getActorId())) return null;
        if (!targetExists(notification)) return null;

        notification.setSummary(trimSummary(notification.getSummary()));
        notification.setRead(false);
        notification.setCreateTime(LocalDateTime.now());
        this.save(notification);
        NotificationDTO dto = toDTO(notification);
        pushCreatedEvent(notification.getRecipientId(), dto);
        return dto;
    }

    @Override
    public NotificationDTO createForMessageCommented(Message message, Comment comment, String actorId) {
        if (message == null || comment == null) return null;
        Notification notification = baseNotification(
                message.getUserId(),
                actorId,
                NotificationType.MESSAGE_COMMENTED,
                NotificationTargetType.COMMENT,
                message.getId(),
                comment.getId(),
                null,
                "你的留言收到了新评论",
                comment.getContent()
        );
        return create(notification);
    }

    @Override
    public NotificationDTO createForMessageLiked(Message message, String actorId) {
        if (message == null) return null;
        Notification notification = baseNotification(
                message.getUserId(),
                actorId,
                NotificationType.MESSAGE_LIKED,
                NotificationTargetType.MESSAGE,
                message.getId(),
                null,
                null,
                "你的留言收到了新的共鸣",
                message.getContent()
        );
        return create(notification);
    }

    @Override
    public NotificationDTO createForCommentReplied(Message message, Comment parentComment, Comment reply, String actorId) {
        if (message == null || parentComment == null || reply == null) return null;
        Notification notification = baseNotification(
                parentComment.getUserId(),
                actorId,
                NotificationType.COMMENT_REPLIED,
                NotificationTargetType.COMMENT,
                message.getId(),
                reply.getId(),
                parentComment.getId(),
                "你的评论收到了回复",
                reply.getContent()
        );
        return create(notification);
    }

    @Override
    public NotificationDTO createForCommentLiked(Message message, Comment comment, String actorId) {
        if (message == null || comment == null) return null;
        Notification notification = baseNotification(
                comment.getUserId(),
                actorId,
                NotificationType.COMMENT_LIKED,
                NotificationTargetType.COMMENT,
                message.getId(),
                comment.getId(),
                comment.getParentId(),
                "你的评论收到了新的回响",
                comment.getContent()
        );
        return create(notification);
    }

    @Override
    public NotificationDTO createForConfessionWitnessed(Message message, String actorId) {
        if (message == null || !MESSAGE_TYPE_CONFESSION.equals(message.getMessageType())) return null;
        if (message.getExpiresAt() != null && !message.getExpiresAt().isAfter(LocalDateTime.now())) return null;
        Notification notification = baseNotification(
                message.getUserId(),
                actorId,
                NotificationType.CONFESSION_WITNESSED,
                NotificationTargetType.CONFESSION,
                message.getId(),
                null,
                null,
                "你的告解被见证了",
                "有人为这段告解点亮了一支蜡烛"
        );
        return create(notification);
    }

    @Override
    public IPage<NotificationDTO> pageByRecipient(String recipientId, int pageNum, int pageSize, boolean unreadOnly) {
        requireIdentity(recipientId);
        Page<Notification> page = new Page<>(Math.max(1, pageNum), Math.min(Math.max(1, pageSize), 100));
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getRecipientId, recipientId);
        if (unreadOnly) wrapper.eq(Notification::getRead, false);
        wrapper.orderByDesc(Notification::getCreateTime).orderByDesc(Notification::getId);
        return this.page(page, wrapper).convert(this::toDTO);
    }

    @Override
    public long countUnread(String recipientId) {
        requireIdentity(recipientId);
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getRecipientId, recipientId).eq(Notification::getRead, false);
        return this.count(wrapper);
    }

    @Override
    public void markRead(String recipientId, Long notificationId) {
        requireIdentity(recipientId);
        if (notificationId == null) throw new BusinessException(ErrorCode.PARAM_ERROR, "通知 ID 不能为空");
        boolean updated = this.update(new LambdaUpdateWrapper<Notification>()
                .eq(Notification::getId, notificationId)
                .eq(Notification::getRecipientId, recipientId)
                .set(Notification::getRead, true));
        if (!updated) throw new BusinessException(ErrorCode.NOT_FOUND, "通知不存在");
    }

    @Override
    public void markAllRead(String recipientId) {
        requireIdentity(recipientId);
        this.update(new LambdaUpdateWrapper<Notification>()
                .eq(Notification::getRecipientId, recipientId)
                .eq(Notification::getRead, false)
                .set(Notification::getRead, true));
    }

    private Notification baseNotification(
            String recipientId,
            String actorId,
            NotificationType type,
            NotificationTargetType targetType,
            Long messageId,
            Long commentId,
            Long parentCommentId,
            String title,
            String summary
    ) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setActorId(actorId);
        notification.setType(type.name());
        notification.setTargetType(targetType.name());
        notification.setMessageId(messageId);
        notification.setCommentId(commentId);
        notification.setParentCommentId(parentCommentId);
        notification.setTitle(title);
        notification.setSummary(summary);
        return notification;
    }

    private boolean targetExists(Notification notification) {
        Long messageId = notification.getMessageId();
        if (messageId != null && messageMapper.selectById(messageId) == null) return false;
        Long commentId = notification.getCommentId();
        if (commentId != null && commentMapper.selectById(commentId) == null) return false;
        Long parentCommentId = notification.getParentCommentId();
        if (parentCommentId != null && commentMapper.selectById(parentCommentId) == null) return false;
        if (NotificationTargetType.TAG.name().equals(notification.getTargetType())) {
            return notification.getTagId() != null && tagMapper.selectById(notification.getTagId()) != null;
        }
        return true;
    }

    private void pushCreatedEvent(String recipientId, NotificationDTO dto) {
        try {
            WebSocketServer.sendToUser(recipientId, Map.of("type", "NOTIFICATION_CREATED", "data", dto));
        } catch (Exception e) {
            log.warn("Notification WebSocket push failed: {}", e.getMessage());
        }
    }

    private NotificationDTO toDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setType(NotificationType.valueOf(notification.getType()));
        dto.setTargetType(NotificationTargetType.valueOf(notification.getTargetType()));
        dto.setMessageId(notification.getMessageId());
        dto.setCommentId(notification.getCommentId());
        dto.setParentCommentId(notification.getParentCommentId());
        dto.setTagId(notification.getTagId());
        dto.setTagName(notification.getTagName());
        dto.setTitle(notification.getTitle());
        dto.setSummary(notification.getSummary());
        dto.setRead(Boolean.TRUE.equals(notification.getRead()));
        dto.setCreateTime(notification.getCreateTime());
        return dto;
    }

    private String trimSummary(String summary) {
        if (summary == null) return null;
        String normalized = summary.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= SUMMARY_LIMIT) return normalized;
        return normalized.substring(0, SUMMARY_LIMIT) + "...";
    }

    private boolean isAutomatedActor(String actorId) {
        return OBSERVER_USER_ID.equals(actorId) || CONFESSOR_USER_ID.equals(actorId);
    }

    private void requireIdentity(String userId) {
        if (isBlank(userId)) throw new BusinessException(ErrorCode.UNAUTHORIZED, "身份标识不能为空");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
