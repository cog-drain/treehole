package com.treehole.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.treehole.common.BusinessException;
import com.treehole.common.ErrorCode;
import com.treehole.entity.Comment;
import com.treehole.entity.ConfessionWitness;
import com.treehole.entity.Message;
import com.treehole.mapper.CommentMapper;
import com.treehole.mapper.ConfessionWitnessMapper;
import com.treehole.mapper.MessageMapper;
import com.treehole.service.CacheInvalidationService;
import com.treehole.service.MessageService;
import com.treehole.service.NotificationService;
import com.treehole.service.RealtimeService;
import com.treehole.service.TagService;
import com.treehole.service.TagSubscriptionService;
import com.treehole.service.AIService;
import com.treehole.entity.Tag;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.treehole.websocket.WebSocketServer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.HashMap;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * 留言 Service 实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MessageServiceImpl extends ServiceImpl<MessageMapper, Message> implements MessageService {

    private final CommentMapper commentMapper;
    private final TagService tagService;
    private final AIService aiService;
    private final ObjectMapper objectMapper;
    private final CacheInvalidationService cacheInvalidationService;
    private final RealtimeService realtimeService;
    private final ConfessionWitnessMapper confessionWitnessMapper;
    private final NotificationService notificationService;
    private final TagSubscriptionService tagSubscriptionService;

    private static final String MESSAGE_TYPE_CONFESSION = "confession";
    private static final String MESSAGE_TYPE_NORMAL = "normal";
    private static final String CONFESSOR_USER_ID = "confessor_ai";

    @Override
    public Map<String, Object> publish(Message message, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "身份标识不能为空");
        }

        // 安全校验：字数与昵称长度限制
        if (message.getContent() == null || message.getContent().length() > 1000) {
            throw new BusinessException(ErrorCode.CONTENT_TOO_LONG, "内容超出了树洞的承载范围 (最多1000字)");
        }
        if (message.getAuthorAlias() != null && message.getAuthorAlias().length() > 20) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "昵称太长啦 (最多20字)");
        }

        // 发帖频率限流：同一用户 10 秒内只能发一条
        String rateKey = "treehole:rate:msg:id:" + userId;
        if (!realtimeService.tryAcquireRateLimit(rateKey, Duration.ofSeconds(10))) {
            throw new BusinessException(ErrorCode.FREQ_LIMIT, "发帖太频繁啦，请休息片刻 (10秒冷却)");
        }

        // IP 双重限流：同一 IP 10 秒内只能发一条 (防刷)
        if (message.getIpAddress() != null && !message.getIpAddress().isBlank()) {
            String ipRateKey = "treehole:rate:msg:ip:" + message.getIpAddress();
            if (!realtimeService.tryAcquireRateLimit(ipRateKey, Duration.ofSeconds(10))) {
                throw new BusinessException(ErrorCode.FREQ_LIMIT, "该 IP 发帖太频繁，请稍后再试");
            }
        }

        String messageType = normalizeMessageType(message.getMessageType());
        message.setMessageType(messageType);
        message.setUserId(userId);

        boolean confession = MESSAGE_TYPE_CONFESSION.equals(messageType);
        if (confession) {
            message.setExpiresAt(LocalDateTime.now().plusHours(24));
        } else {
            message.setExpiresAt(null);
        }

        // --- AI 语义自动化：生成自动标签 ---
        // 1. 生成语义标签
        List<String> aiTags = confession ? List.of() : aiService.generateTags(message.getContent());
        if (!confession && !aiTags.isEmpty()) {
            String tagString = String.join(" ", aiTags);
            String contentStr = message.getContent().trim();
            // 如果用户最后一段话已经是标签了，直接用空格拼接在同一行
            if (contentStr.matches("(?s).*#[^\\s]+$")) {
                message.setContent(contentStr + " " + tagString);
            } else {
                message.setContent(contentStr + "\n\n" + tagString);
            }
        }

        if (message.getLikes() == null) {
            message.setLikes(0);
        }
        if (message.getAuthorAlias() == null || message.getAuthorAlias().isBlank()) {
            message.setAuthorAlias("匿名用户");
        }
        if (message.getCommentCount() == null) {
            message.setCommentCount(0);
        }
        if (message.getCamoEffect() == null) {
            message.setCamoEffect(false);
        }

        this.save(message);
        if (!confession) {
            tagService.extractAndSaveTags(message.getId(), message.getContent());
            tagSubscriptionService.notifySubscribersForMessage(message);
            realtimeService.incrementMessageRank(message.getId(), 5);
        }
        cacheInvalidationService.evictMessageStructureCaches();

        // 核心：通过 WebSocket 广播新留言
        try {
            Map<String, Object> broadcastData = new HashMap<>();
            broadcastData.put("type", "NEW_MESSAGE");
            broadcastData.put("data", message);
            WebSocketServer.broadcast(objectMapper.writeValueAsString(broadcastData));
        } catch (Exception e) {
            log.error("WebSocket broadcast error: {}", e.getMessage());
        }

        Map<String, Object> result = new HashMap<>(2);
        result.put("message", message);
        message.setIsOwner(true);
        result.put("userId", userId);

        if (confession) {
            triggerConfessorReply(message);
            return result;
        }

        // --- 异步触发：守望者的“心灵感应”回复 ---
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                // 模拟守望者在思索（延迟 2-5 秒）
                Thread.sleep(2000 + (long)(Math.random() * 3000));
                
                String replyContent = aiService.generateObserverReply(message.getContent());
                
                Comment observerComment = new Comment();
                observerComment.setMessageId(message.getId());
                observerComment.setContent(replyContent);
                observerComment.setAuthorAlias("树洞守望者");
                observerComment.setUserId("observer_ai"); // 特殊 ID
                
                commentMapper.insert(observerComment);
                
                // 更新留言的评论数
                this.update(new LambdaUpdateWrapper<Message>()
                    .eq(Message::getId, message.getId())
                    .setSql("comment_count = comment_count + 1"));
                realtimeService.incrementMessageRank(message.getId(), 3);
                cacheInvalidationService.evictCommentAndMessageListCaches();

                // 通过 WebSocket 广播这条“温暖的回响”
                Map<String, Object> commentData = new HashMap<>();
                commentData.put("type", "NEW_COMMENT");
                commentData.put("data", Map.of(
                    "messageId", message.getId(),
                    "comment", observerComment
                ));
                WebSocketServer.broadcast(objectMapper.writeValueAsString(commentData));
                
            } catch (Exception e) {
                log.error("Observer AI reply failed: {}", e.getMessage());
            }
        });

        return result;
    }

    private String normalizeMessageType(String messageType) {
        if (messageType == null || messageType.isBlank()) return MESSAGE_TYPE_NORMAL;
        if (MESSAGE_TYPE_CONFESSION.equals(messageType) || MESSAGE_TYPE_NORMAL.equals(messageType)) return messageType;
        throw new BusinessException(ErrorCode.PARAM_ERROR, "未知留言类型");
    }

    private void triggerConfessorReply(Message message) {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(1500 + (long)(Math.random() * 2500));
                String replyContent = aiService.generateConfessorReply(message.getContent());

                Comment confessorComment = new Comment();
                confessorComment.setMessageId(message.getId());
                confessorComment.setContent(replyContent);
                confessorComment.setAuthorAlias("赛博神父");
                confessorComment.setUserId(CONFESSOR_USER_ID);

                commentMapper.insert(confessorComment);
                this.update(new LambdaUpdateWrapper<Message>()
                        .eq(Message::getId, message.getId())
                        .setSql("comment_count = comment_count + 1"));
                cacheInvalidationService.evictCommentAndMessageListCaches();

                Map<String, Object> broadcastData = new HashMap<>();
                broadcastData.put("type", "CONFESSOR_REPLY");
                broadcastData.put("data", Map.of(
                        "messageId", message.getId(),
                        "reply", replyContent
                ));
                WebSocketServer.broadcast(objectMapper.writeValueAsString(broadcastData));
            } catch (Exception e) {
                log.error("Confessor AI reply failed: {}", e.getMessage());
            }
        });
    }

    @Override
    @Cacheable(
            cacheNames = "messagePage",
            key = "T(String).format('%d:%d:%s', #pageNum, #pageSize, #viewerId == null ? '' : #viewerId)"
    )
    public IPage<Message> listByPage(int pageNum, int pageSize, String viewerId) {
        Page<Message> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
        applyVisibleMessageFilter(wrapper);
        wrapper.orderByDesc(Message::getCreateTime);
        IPage<Message> resultPage = this.page(page, wrapper);
        hydrateMessageExtras(resultPage.getRecords(), viewerId);
        return resultPage;
    }

    @Override
    @Cacheable(
            cacheNames = "messageTagPage",
            key = "T(String).format('%s:%d:%d:%s', #tagName, #pageNum, #pageSize, #viewerId == null ? '' : #viewerId)"
    )
    public IPage<Message> listByTag(String tagName, int pageNum, int pageSize, String viewerId) {
        Page<Message> page = new Page<>(pageNum, pageSize);
        
        LambdaQueryWrapper<Tag> tagWrapper = new LambdaQueryWrapper<>();
        tagWrapper.eq(Tag::getName, tagName);
        Tag tag = tagService.getOne(tagWrapper);
        if (tag == null) {
            return page;
        }

        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
        wrapper.inSql(Message::getId, "SELECT message_id FROM message_tag WHERE tag_id = " + tag.getId());
        applyVisibleMessageFilter(wrapper);
        wrapper.orderByDesc(Message::getCreateTime);
        
        IPage<Message> resultPage = this.page(page, wrapper);
        hydrateMessageExtras(resultPage.getRecords(), viewerId);
        return resultPage;
    }

    private void applyVisibleMessageFilter(LambdaQueryWrapper<Message> wrapper) {
        wrapper.and(w -> w
                .eq(Message::getMessageType, MESSAGE_TYPE_NORMAL)
                .or()
                .isNull(Message::getMessageType)
                .or(x -> x.eq(Message::getMessageType, MESSAGE_TYPE_CONFESSION)
                        .gt(Message::getExpiresAt, LocalDateTime.now())));
    }

    @Override
    public Message getVisibleById(Long id, String viewerId) {
        if (id == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "留言 ID 不能为空");
        }
        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Message::getId, id);
        applyVisibleMessageFilter(wrapper);
        Message message = this.getOne(wrapper, false);
        if (message == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "留言不存在");
        }
        hydrateMessageExtras(List.of(message), viewerId);
        return message;
    }

    private void hydrateMessageExtras(List<Message> messages, String viewerId) {
        injectResonance(messages, viewerId);
        injectConfessionExtras(messages, viewerId);
    }

    private void injectConfessionExtras(List<Message> messages, String viewerId) {
        List<Message> confessions = messages.stream()
                .filter(m -> MESSAGE_TYPE_CONFESSION.equals(m.getMessageType()))
                .toList();
        if (confessions.isEmpty()) return;

        List<Long> ids = confessions.stream().map(Message::getId).toList();
        Map<Long, Long> witnessCounts = new HashMap<>();
        for (Map<String, Object> row : confessionWitnessMapper.countByMessageIds(ids)) {
            Object id = row.get("message_id");
            if (id == null) id = row.get("MESSAGE_ID");
            Object count = row.get("witness_count");
            if (count == null) count = row.get("WITNESS_COUNT");
            if (id instanceof Number && count instanceof Number) {
                witnessCounts.put(((Number) id).longValue(), ((Number) count).longValue());
            }
        }

        Set<Long> witnessedIds = new HashSet<>();
        if (viewerId != null && !viewerId.isBlank()) {
            witnessedIds.addAll(confessionWitnessMapper.findWitnessedMessageIds(viewerId, ids));
        }

        LambdaQueryWrapper<Comment> replyWrapper = new LambdaQueryWrapper<>();
        replyWrapper.in(Comment::getMessageId, ids)
                .eq(Comment::getUserId, CONFESSOR_USER_ID)
                .orderByAsc(Comment::getCreateTime);
        List<Comment> replies = commentMapper.selectList(replyWrapper);
        Map<Long, String> replyByMessage = new HashMap<>();
        for (Comment reply : replies) {
            replyByMessage.putIfAbsent(reply.getMessageId(), reply.getContent());
        }

        for (Message message : confessions) {
            message.setWitnessCount(witnessCounts.getOrDefault(message.getId(), 0L));
            message.setWitnessedByMe(witnessedIds.contains(message.getId()));
            message.setConfessorReply(replyByMessage.get(message.getId()));
        }
    }

    private void injectResonance(List<Message> messages, String viewerId) {
        if (viewerId == null || viewerId.isBlank() || messages.isEmpty()) return;
        
        List<String> authorIds = messages.stream()
                .map(Message::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        
        if (authorIds.isEmpty()) return;
        
        List<Map<String, Object>> scores = commentMapper.getResonanceScores(viewerId, authorIds);
        Map<String, Integer> scoreMap = new HashMap<>();
        for (Map<String, Object> score : scores) {
            // 兼容不同驱动的大小写差异
            Object token = score.get("author_token");
            if (token == null) token = score.get("AUTHOR_TOKEN");
            
            Object count = score.get("resonance_score");
            if (count == null) count = score.get("RESONANCE_SCORE");
            
            if (token != null && count instanceof Number) {
                scoreMap.put(token.toString(), ((Number) count).intValue());
            }
        }
        
        for (Message m : messages) {
            // 设置所有权
            if (viewerId.equals(m.getUserId())) {
                m.setIsOwner(true);
            }
            
            Integer score = scoreMap.get(m.getUserId());
            if (score != null && score >= 5) {
                m.setCoFrequency(true);
            }
        }
    }

    @Override
    public void like(Long id, String userId) {
        Message message = this.getById(id);
        LambdaUpdateWrapper<Message> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Message::getId, id)
               .setSql("likes = likes + 1");
        boolean updated = this.update(wrapper);
        realtimeService.incrementMessageRank(id, 2);
        cacheInvalidationService.evictMessageListCaches();
        if (updated && message != null && userId != null && !userId.isBlank()) {
            notificationService.createForMessageLiked(message, userId);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteWithComments(Long id, String userId) {
        Message message = this.getById(id);
        if (message == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "留言不存在");
        }

        if (userId == null || userId.isBlank() || !userId.equals(message.getUserId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "无权删除此留言");
        }

        LambdaQueryWrapper<Comment> commentWrapper = new LambdaQueryWrapper<>();
        commentWrapper.eq(Comment::getMessageId, id);
        commentMapper.delete(commentWrapper);

        tagService.decrementTagsForMessage(id);
        this.removeById(id);
        realtimeService.removeMessageRank(id);
        cacheInvalidationService.evictMessageStructureCaches();
        cacheInvalidationService.evictCommentCaches();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void react(Long id, String emoji, String userId) {
        if (userId == null || userId.isBlank()) {
            return;
        }

        Message message = this.getById(id);
        if (message == null) return;

        synchronized (("msg_react_" + id).intern()) {
            try {
                Map<String, Integer> reactionMap = realtimeService.updateReaction("msg", id, userId, emoji, message.getReactions());
                String json = realtimeService.toReactionJson(reactionMap);
                this.update(new LambdaUpdateWrapper<Message>()
                    .eq(Message::getId, id)
                    .set(Message::getReactions, json));
                realtimeService.incrementMessageRank(id, 1);
                cacheInvalidationService.evictMessageListCaches();
                
                // WebSocket 广播表情更新
                Map<String, Object> broadcastData = new HashMap<>();
                broadcastData.put("type", "REACTION_UPDATE");
                broadcastData.put("data", Map.of("messageId", id, "reactions", json));
                WebSocketServer.broadcast(objectMapper.writeValueAsString(broadcastData));
            } catch (Exception e) {
                log.error("Save reactions error: {}", e.getMessage());
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> witness(Long id, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "身份标识不能为空");
        }

        Message message = this.getById(id);
        if (message == null || !MESSAGE_TYPE_CONFESSION.equals(message.getMessageType())) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "告解不存在");
        }
        if (message.getExpiresAt() != null && !message.getExpiresAt().isAfter(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "告解已熄灭");
        }

        LambdaQueryWrapper<ConfessionWitness> existingWrapper = new LambdaQueryWrapper<>();
        existingWrapper.eq(ConfessionWitness::getMessageId, id)
                .eq(ConfessionWitness::getUserId, userId);
        Long existing = confessionWitnessMapper.selectCount(existingWrapper);
        boolean created = false;
        if (existing == null || existing == 0) {
            ConfessionWitness witness = new ConfessionWitness();
            witness.setMessageId(id);
            witness.setUserId(userId);
            try {
                confessionWitnessMapper.insert(witness);
                created = true;
            } catch (DuplicateKeyException ignored) {
                // Another tab or retry already witnessed this confession.
            }
            cacheInvalidationService.evictMessageListCaches();
        }
        if (created) {
            notificationService.createForConfessionWitnessed(message, userId);
        }

        LambdaQueryWrapper<ConfessionWitness> countWrapper = new LambdaQueryWrapper<>();
        countWrapper.eq(ConfessionWitness::getMessageId, id);
        long witnessCount = confessionWitnessMapper.selectCount(countWrapper);

        try {
            Map<String, Object> broadcastData = new HashMap<>();
            broadcastData.put("type", "CONFESSION_WITNESS_UPDATE");
            broadcastData.put("data", Map.of("messageId", id, "witnessCount", witnessCount));
            WebSocketServer.broadcast(objectMapper.writeValueAsString(broadcastData));
        } catch (Exception e) {
            log.error("Witness broadcast error: {}", e.getMessage());
        }

        return Map.of("witnessCount", witnessCount, "witnessedByMe", true);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int cleanupExpiredConfessions() {
        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Message::getMessageType, MESSAGE_TYPE_CONFESSION)
                .le(Message::getExpiresAt, LocalDateTime.now());
        List<Message> expired = this.list(wrapper);
        if (expired.isEmpty()) return 0;

        for (Message message : expired) {
            tagService.decrementTagsForMessage(message.getId());
            realtimeService.removeMessageRank(message.getId());
        }
        this.removeBatchByIds(expired.stream().map(Message::getId).toList());
        cacheInvalidationService.evictMessageStructureCaches();
        cacheInvalidationService.evictCommentCaches();
        return expired.size();
    }
}
