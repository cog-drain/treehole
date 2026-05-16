package com.treehole.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.treehole.common.BusinessException;
import com.treehole.common.ErrorCode;
import com.treehole.dto.NotificationTargetType;
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
import com.treehole.service.NotificationService;
import com.treehole.service.TagSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagSubscriptionServiceImpl extends ServiceImpl<TagSubscriptionMapper, TagSubscription> implements TagSubscriptionService {

    private static final int AGGREGATION_WINDOW_MINUTES = 30;
    private static final Pattern COUNT_PATTERN = Pattern.compile("新增 (\\d+) 条");

    private final TagMapper tagMapper;
    private final MessageTagMapper messageTagMapper;
    private final NotificationMapper notificationMapper;
    private final NotificationService notificationService;

    @Override
    public List<TagSubscriptionDTO> listByUser(String userId) {
        requireIdentity(userId);
        List<TagSubscription> subscriptions = this.list(new LambdaQueryWrapper<TagSubscription>()
                .eq(TagSubscription::getUserId, userId)
                .orderByDesc(TagSubscription::getCreateTime));
        if (subscriptions.isEmpty()) return List.of();

        Map<Long, Tag> tags = tagMapper.selectBatchIds(subscriptions.stream().map(TagSubscription::getTagId).toList())
                .stream()
                .collect(Collectors.toMap(Tag::getId, tag -> tag));

        return subscriptions.stream()
                .map(subscription -> toDTO(subscription, tags.get(subscription.getTagId())))
                .filter(Objects::nonNull)
                .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TagSubscriptionDTO subscribe(String userId, Long tagId) {
        requireIdentity(userId);
        Tag tag = getExistingTag(tagId);

        TagSubscription existing = this.baseMapper.selectOne(new LambdaQueryWrapper<TagSubscription>()
                .eq(TagSubscription::getUserId, userId)
                .eq(TagSubscription::getTagId, tagId));
        if (existing != null) return toDTO(existing, tag);

        TagSubscription subscription = new TagSubscription();
        subscription.setUserId(userId);
        subscription.setTagId(tagId);
        subscription.setCreateTime(LocalDateTime.now());
        try {
            this.save(subscription);
        } catch (DuplicateKeyException ignored) {
            subscription = this.baseMapper.selectOne(new LambdaQueryWrapper<TagSubscription>()
                    .eq(TagSubscription::getUserId, userId)
                    .eq(TagSubscription::getTagId, tagId));
        }
        return toDTO(subscription, tag);
    }

    @Override
    public void unsubscribe(String userId, Long tagId) {
        requireIdentity(userId);
        if (tagId == null) throw new BusinessException(ErrorCode.PARAM_ERROR, "标签 ID 不能为空");
        this.remove(new LambdaQueryWrapper<TagSubscription>()
                .eq(TagSubscription::getUserId, userId)
                .eq(TagSubscription::getTagId, tagId));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void notifySubscribersForMessage(Message message) {
        if (message == null || message.getId() == null) return;
        List<MessageTag> messageTags = messageTagMapper.selectList(new LambdaQueryWrapper<MessageTag>()
                .eq(MessageTag::getMessageId, message.getId()));
        if (messageTags.isEmpty()) return;

        for (MessageTag messageTag : messageTags) {
            Tag tag = tagMapper.selectById(messageTag.getTagId());
            if (tag == null) continue;
            List<TagSubscription> subscriptions = this.list(new LambdaQueryWrapper<TagSubscription>()
                    .eq(TagSubscription::getTagId, tag.getId()));
            for (TagSubscription subscription : subscriptions) {
                if (subscription.getUserId().equals(message.getUserId())) continue;
                createOrAggregateNotification(subscription.getUserId(), tag, message);
            }
        }
    }

    private void createOrAggregateNotification(String recipientId, Tag tag, Message message) {
        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(AGGREGATION_WINDOW_MINUTES);
        Notification existing = notificationMapper.selectOne(new LambdaQueryWrapper<Notification>()
                .eq(Notification::getRecipientId, recipientId)
                .eq(Notification::getType, NotificationType.TAG_NEW_MESSAGES.name())
                .eq(Notification::getTagId, tag.getId())
                .ge(Notification::getCreateTime, windowStart)
                .orderByDesc(Notification::getCreateTime)
                .last("LIMIT 1"));

        if (existing != null) {
            int count = extractCount(existing.getSummary()) + 1;
            notificationMapper.update(null, new LambdaUpdateWrapper<Notification>()
                    .eq(Notification::getId, existing.getId())
                    .set(Notification::getMessageId, message.getId())
                    .set(Notification::getSummary, summary(tag.getName(), count))
                    .set(Notification::getCreateTime, LocalDateTime.now())
                    .set(Notification::getRead, false));
            return;
        }

        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setActorId(message.getUserId());
        notification.setType(NotificationType.TAG_NEW_MESSAGES.name());
        notification.setTargetType(NotificationTargetType.TAG.name());
        notification.setMessageId(message.getId());
        notification.setTagId(tag.getId());
        notification.setTagName(tag.getName());
        notification.setTitle("你订阅的话题有新留言");
        notification.setSummary(summary(tag.getName(), 1));
        notificationService.create(notification);
    }

    private String summary(String tagName, int count) {
        return "#" + tagName + " 新增 " + count + " 条留言";
    }

    private int extractCount(String summary) {
        if (summary == null) return 0;
        Matcher matcher = COUNT_PATTERN.matcher(summary);
        if (!matcher.find()) return 0;
        return Integer.parseInt(matcher.group(1));
    }

    private Tag getExistingTag(Long tagId) {
        if (tagId == null) throw new BusinessException(ErrorCode.PARAM_ERROR, "标签 ID 不能为空");
        Tag tag = tagMapper.selectById(tagId);
        if (tag == null) throw new BusinessException(ErrorCode.NOT_FOUND, "标签不存在");
        return tag;
    }

    private TagSubscriptionDTO toDTO(TagSubscription subscription, Tag tag) {
        if (subscription == null || tag == null) return null;
        TagSubscriptionDTO dto = new TagSubscriptionDTO();
        dto.setId(subscription.getId());
        dto.setTagId(subscription.getTagId());
        dto.setTagName(tag.getName());
        dto.setUsageCount(tag.getUsageCount());
        dto.setCreateTime(subscription.getCreateTime());
        return dto;
    }

    private void requireIdentity(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "身份标识不能为空");
        }
    }
}
