package com.treehole.service;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.treehole.dto.NotificationType;
import com.treehole.dto.TagSubscriptionDTO;
import com.treehole.entity.Message;
import com.treehole.entity.MessageTag;
import com.treehole.entity.Notification;
import com.treehole.entity.Tag;
import com.treehole.entity.TagSubscription;
import com.treehole.mapper.MessageTagMapper;
import com.treehole.mapper.NotificationMapper;
import com.treehole.mapper.TagMapper;
import com.treehole.mapper.TagSubscriptionMapper;
import com.treehole.service.impl.TagSubscriptionServiceImpl;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TagSubscriptionServiceImplTests {

    private TagSubscriptionMapper tagSubscriptionMapper;
    private TagMapper tagMapper;
    private MessageTagMapper messageTagMapper;
    private NotificationMapper notificationMapper;
    private NotificationService notificationService;
    private TagSubscriptionServiceImpl service;

    @BeforeEach
    void setUp() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), TagSubscription.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), Notification.class);
        tagSubscriptionMapper = mock(TagSubscriptionMapper.class);
        tagMapper = mock(TagMapper.class);
        messageTagMapper = mock(MessageTagMapper.class);
        notificationMapper = mock(NotificationMapper.class);
        notificationService = mock(NotificationService.class);
        service = new TagSubscriptionServiceImpl(tagMapper, messageTagMapper, notificationMapper, notificationService);
        ReflectionTestUtils.setField(service, "baseMapper", tagSubscriptionMapper);
    }

    @Test
    void subscribeShouldBeIdempotentWhenSubscriptionExists() {
        Tag tag = tag(3L, "夜晚");
        TagSubscription existing = subscription(9L, "user-a", 3L);
        when(tagMapper.selectById(3L)).thenReturn(tag);
        when(tagSubscriptionMapper.selectOne(any(Wrapper.class))).thenReturn(existing);

        TagSubscriptionDTO dto = service.subscribe("user-a", 3L);

        assertNotNull(dto);
        assertEquals(3L, dto.getTagId());
        assertEquals("夜晚", dto.getTagName());
        verify(tagSubscriptionMapper, never()).insert(any(TagSubscription.class));
    }

    @Test
    void notifySubscribersShouldCreateTagNotificationForNewWindow() {
        Message message = message(10L, "author");
        Tag tag = tag(3L, "夜晚");
        when(messageTagMapper.selectList(any(Wrapper.class))).thenReturn(List.of(new MessageTag(10L, 3L)));
        when(tagMapper.selectById(3L)).thenReturn(tag);
        when(tagSubscriptionMapper.selectList(any(Wrapper.class))).thenReturn(List.of(subscription(1L, "subscriber", 3L)));
        when(notificationMapper.selectOne(any(Wrapper.class))).thenReturn(null);

        service.notifySubscribersForMessage(message);

        verify(notificationService).create(any(Notification.class));
    }

    @Test
    void notifySubscribersShouldAggregateWithinWindow() {
        Message message = message(10L, "author");
        Tag tag = tag(3L, "夜晚");
        Notification existing = new Notification();
        existing.setId(99L);
        existing.setType(NotificationType.TAG_NEW_MESSAGES.name());
        existing.setSummary("#夜晚 新增 2 条留言");
        existing.setCreateTime(LocalDateTime.now());
        when(messageTagMapper.selectList(any(Wrapper.class))).thenReturn(List.of(new MessageTag(10L, 3L)));
        when(tagMapper.selectById(3L)).thenReturn(tag);
        when(tagSubscriptionMapper.selectList(any(Wrapper.class))).thenReturn(List.of(subscription(1L, "subscriber", 3L)));
        when(notificationMapper.selectOne(any(Wrapper.class))).thenReturn(existing);

        service.notifySubscribersForMessage(message);

        verify(notificationMapper).update(eq(null), any(Wrapper.class));
        verify(notificationService, never()).create(any(Notification.class));
    }

    private Message message(Long id, String userId) {
        Message message = new Message();
        message.setId(id);
        message.setUserId(userId);
        return message;
    }

    private Tag tag(Long id, String name) {
        Tag tag = new Tag();
        tag.setId(id);
        tag.setName(name);
        tag.setUsageCount(4);
        return tag;
    }

    private TagSubscription subscription(Long id, String userId, Long tagId) {
        TagSubscription subscription = new TagSubscription();
        subscription.setId(id);
        subscription.setUserId(userId);
        subscription.setTagId(tagId);
        subscription.setCreateTime(LocalDateTime.now());
        return subscription;
    }
}
