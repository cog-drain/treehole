package com.treehole.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.treehole.common.BusinessException;
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
import com.treehole.service.impl.NotificationServiceImpl;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class NotificationServiceImplTests {

    private NotificationMapper notificationMapper;
    private MessageMapper messageMapper;
    private CommentMapper commentMapper;
    private TagMapper tagMapper;
    private NotificationServiceImpl service;

    @BeforeEach
    void setUp() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), Notification.class);
        notificationMapper = mock(NotificationMapper.class);
        messageMapper = mock(MessageMapper.class);
        commentMapper = mock(CommentMapper.class);
        tagMapper = mock(TagMapper.class);
        service = new NotificationServiceImpl(messageMapper, commentMapper, tagMapper);
        ReflectionTestUtils.setField(service, "baseMapper", notificationMapper);
    }

    @Test
    void notificationSelectShouldAvoidReadKeywordAlias() {
        String selectSql = TableInfoHelper.getTableInfo(Notification.class).getAllSqlSelect();

        assertFalse(selectSql.contains(" AS read,"));
        assertTrue(selectSql.contains("is_read"));
    }

    @Test
    void createShouldPersistValidMessageCommentNotification() {
        Message message = message(10L, "owner");
        Comment comment = comment(20L, 10L, "actor", null);
        when(messageMapper.selectById(10L)).thenReturn(message);
        when(commentMapper.selectById(20L)).thenReturn(comment);
        when(notificationMapper.insert(any(Notification.class))).thenAnswer(invocation -> {
            Notification notification = invocation.getArgument(0);
            notification.setId(1L);
            return 1;
        });

        NotificationDTO dto = service.createForMessageCommented(message, comment, "actor");

        assertNotNull(dto);
        assertEquals(NotificationType.MESSAGE_COMMENTED, dto.getType());
        assertEquals(NotificationTargetType.COMMENT, dto.getTargetType());
        assertEquals(10L, dto.getMessageId());
        assertEquals(20L, dto.getCommentId());
        assertFalse(dto.getRead());
        verify(notificationMapper).insert(any(Notification.class));
    }

    @Test
    void createShouldFilterSelfAndAutomatedNotifications() {
        Message message = message(10L, "owner");
        when(messageMapper.selectById(10L)).thenReturn(message);

        assertNull(service.createForMessageLiked(message, "owner"));
        assertNull(service.createForMessageLiked(message, "observer_ai"));

        verify(notificationMapper, never()).insert(any(Notification.class));
    }

    @Test
    void pageAndUnreadOnlyShouldQueryRecipientTimeline() {
        Notification notification = notification(1L, "user-a", false);
        Page<Notification> page = new Page<>(1, 20);
        page.setRecords(List.of(notification));
        page.setTotal(1);
        when(notificationMapper.selectPage(any(Page.class), any(Wrapper.class))).thenReturn(page);

        IPage<NotificationDTO> result = service.pageByRecipient("user-a", 1, 20, true);

        assertEquals(1, result.getTotal());
        assertEquals(1, result.getRecords().size());
        assertEquals(1L, result.getRecords().get(0).getId());
        ArgumentCaptor<Wrapper<Notification>> wrapperCaptor = ArgumentCaptor.forClass(Wrapper.class);
        verify(notificationMapper).selectPage(any(Page.class), wrapperCaptor.capture());
        String sqlSegment = wrapperCaptor.getValue().getSqlSegment();
        assertTrue(sqlSegment.contains("recipient_id"));
        assertTrue(sqlSegment.contains("is_read"));
    }

    @Test
    void unreadCountAndReadUpdatesShouldBeScopedToRecipient() {
        when(notificationMapper.selectCount(any(Wrapper.class))).thenReturn(3L);
        when(notificationMapper.update(eq(null), any(Wrapper.class))).thenReturn(1);

        assertEquals(3L, service.countUnread("user-a"));
        service.markRead("user-a", 1L);
        service.markAllRead("user-a");

        verify(notificationMapper).selectCount(any(Wrapper.class));
        verify(notificationMapper, org.mockito.Mockito.times(2)).update(eq(null), any(Wrapper.class));
    }

    @Test
    void markReadShouldRejectNotificationsOutsideCurrentRecipient() {
        when(notificationMapper.update(eq(null), any(Wrapper.class))).thenReturn(0);

        assertThrows(BusinessException.class, () -> service.markRead("user-a", 99L));
    }

    private Message message(Long id, String userId) {
        Message message = new Message();
        message.setId(id);
        message.setUserId(userId);
        message.setContent("这是一段很短的内容");
        message.setMessageType("normal");
        return message;
    }

    private Comment comment(Long id, Long messageId, String userId, Long parentId) {
        Comment comment = new Comment();
        comment.setId(id);
        comment.setMessageId(messageId);
        comment.setUserId(userId);
        comment.setParentId(parentId);
        comment.setContent("收到一条评论");
        return comment;
    }

    private Notification notification(Long id, String recipientId, boolean read) {
        Notification notification = new Notification();
        notification.setId(id);
        notification.setRecipientId(recipientId);
        notification.setType(NotificationType.MESSAGE_LIKED.name());
        notification.setTargetType(NotificationTargetType.MESSAGE.name());
        notification.setMessageId(10L);
        notification.setTitle("你的留言收到了新的共鸣");
        notification.setSummary("摘要");
        notification.setRead(read);
        notification.setCreateTime(LocalDateTime.now());
        return notification;
    }
}
