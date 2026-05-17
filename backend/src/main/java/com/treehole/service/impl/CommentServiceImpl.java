package com.treehole.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.treehole.common.BusinessException;
import com.treehole.common.ErrorCode;
import com.treehole.entity.Comment;
import com.treehole.mapper.CommentMapper;
import com.treehole.service.CacheInvalidationService;
import com.treehole.service.CommentService;
import com.treehole.service.MessageService;
import com.treehole.service.NotificationService;
import com.treehole.service.RealtimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.treehole.util.IdentityUtils;
import com.treehole.entity.Message;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.treehole.websocket.WebSocketServer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 评论 Service 实现类
 */
@Service
@Slf4j
public class CommentServiceImpl extends ServiceImpl<CommentMapper, Comment> implements CommentService {

    private MessageService messageService;
    private final CacheInvalidationService cacheInvalidationService;
    private final RealtimeService realtimeService;
    private final NotificationService notificationService;
    
    @Autowired
    private ObjectMapper objectMapper;

    public CommentServiceImpl(CacheInvalidationService cacheInvalidationService, RealtimeService realtimeService, NotificationService notificationService) {
        this.cacheInvalidationService = cacheInvalidationService;
        this.realtimeService = realtimeService;
        this.notificationService = notificationService;
    }

    @Autowired
    public void setMessageService(@Lazy MessageService messageService) {
        this.messageService = messageService;
    }

    @Override
    @Transactional
    public Map<String, Object> publish(Comment comment, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "身份标识不能为空");
        }

        // 安全校验：字数与昵称长度限制
        if (comment.getContent() == null || comment.getContent().length() > 500) {
            throw new BusinessException(ErrorCode.CONTENT_TOO_LONG, "评论内容太长啦 (最多500字)");
        }
        if (comment.getAuthorAlias() != null && comment.getAuthorAlias().length() > 20) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "昵称太长啦 (最多20字)");
        }

        Message targetMessage = messageService.getById(comment.getMessageId());
        if (targetMessage == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "留言不存在");
        }
        if ("confession".equals(targetMessage.getMessageType())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "告解只能被见证，不能被评论");
        }

        // 评论频率限流：同一用户 5 秒内只能发一条
        String rateKey = "treehole:rate:cmt:id:" + userId;
        if (!realtimeService.tryAcquireRateLimit(rateKey, Duration.ofSeconds(5))) {
            throw new BusinessException(ErrorCode.FREQ_LIMIT, "评论太频繁啦，请休息片刻 (5秒冷却)");
        }

        // IP 双重限流：同一 IP 5 秒内只能发一条 (防刷)
        if (comment.getIpAddress() != null && !comment.getIpAddress().isBlank()) {
            String ipRateKey = "treehole:rate:cmt:ip:" + comment.getIpAddress();
            if (!realtimeService.tryAcquireRateLimit(ipRateKey, Duration.ofSeconds(5))) {
                throw new BusinessException(ErrorCode.FREQ_LIMIT, "该 IP 评论太频繁，请稍后再试");
            }
        }

        comment.setUserId(userId);
        comment.setAuthorAlias(null); 

        this.save(comment);

        messageService.update().setSql("comment_count = comment_count + 1")
                .eq("id", comment.getMessageId()).update();
        realtimeService.incrementMessageRank(comment.getMessageId(), 3);
        cacheInvalidationService.evictCommentAndMessageListCaches();

        createCommentNotifications(targetMessage, comment, userId);

        // 核心：广播新评论
        try {
            Map<String, Object> broadcastData = new HashMap<>();
            broadcastData.put("type", "NEW_COMMENT");
            broadcastData.put("data", comment);
            WebSocketServer.broadcast(objectMapper.writeValueAsString(broadcastData));
        } catch (Exception e) {
            log.error("WebSocket broadcast error: {}", e.getMessage());
        }

        comment.setIsOwner(true);

        Map<String, Object> result = new HashMap<>(2);
        result.put("comment", comment);
        result.put("userId", userId);
        return result;
    }

    private void createCommentNotifications(Message targetMessage, Comment comment, String actorId) {
        if (comment.getParentId() == null) {
            notificationService.createForMessageCommented(targetMessage, comment, actorId);
            return;
        }

        Comment parentComment = this.getById(comment.getParentId());
        if (parentComment == null) {
            notificationService.createForMessageCommented(targetMessage, comment, actorId);
            return;
        }

        notificationService.createForCommentReplied(targetMessage, parentComment, comment, actorId);
        if (!Objects.equals(parentComment.getUserId(), targetMessage.getUserId())) {
            notificationService.createForMessageCommented(targetMessage, comment, actorId);
        }
    }

    @Override
    @Cacheable(
            cacheNames = "commentList",
            key = "T(String).format('%d:%s', #messageId, #viewerId == null ? '' : #viewerId)"
    )
    public List<Comment> listByMessageId(Long messageId, String viewerId) {
        Message message = messageService.getById(messageId);
        String threadOwnerId = (message != null) ? message.getUserId() : "";

        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Comment::getMessageId, messageId)
               .orderByAsc(Comment::getCreateTime);
        List<Comment> list = this.list(wrapper);

        injectResonance(list, viewerId);

        list.forEach(c -> {
            String dynamicName = IdentityUtils.generateThreadAlias(
                c.getUserId(), 
                messageId, 
                threadOwnerId
            );
            c.setAuthorAlias(dynamicName);
            if (viewerId != null && viewerId.equals(c.getUserId())) {
                c.setIsOwner(true);
            }
        });

        return list;
    }

    private void injectResonance(List<Comment> comments, String viewerId) {
        if (viewerId == null || viewerId.isBlank() || comments.isEmpty()) return;
        
        List<String> authorIds = comments.stream()
                .map(Comment::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        
        if (authorIds.isEmpty()) return;
        
        List<Map<String, Object>> scores = this.baseMapper.getResonanceScores(viewerId, authorIds);
        Map<String, Integer> scoreMap = new HashMap<>();
        for (Map<String, Object> score : scores) {
            scoreMap.put((String) score.get("author_token"), ((Number) score.get("resonance_score")).intValue());
        }
        
        for (Comment c : comments) {
            Integer score = scoreMap.get(c.getUserId());
            if (score != null && score >= 5) {
                c.setCoFrequency(true);
            }
        }
    }

    @Override
    public void deleteWithToken(Long id, String userId) {
        Comment comment = this.getById(id);
        if (comment == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "评论不存在");
        }
        if (userId == null || userId.isBlank() || !userId.equals(comment.getUserId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "无权删除此评论");
        }
        this.removeById(id);
        messageService.update().setSql("comment_count = CASE WHEN comment_count > 0 THEN comment_count - 1 ELSE 0 END")
                .eq("id", comment.getMessageId()).update();
        realtimeService.incrementMessageRank(comment.getMessageId(), -3);
        cacheInvalidationService.evictCommentAndMessageListCaches();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void react(Long id, String emoji, String userId) {
        if (userId == null || userId.isBlank()) {
            return;
        }

        Comment comment = this.getById(id);
        if (comment == null) return;

        synchronized (("cmt_react_" + id).intern()) {
            try {
                Map<String, Integer> reactionMap = realtimeService.updateReaction("cmt", id, userId, emoji, comment.getReactions());
                String json = realtimeService.toReactionJson(reactionMap);
                this.update(new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<Comment>()
                    .eq(Comment::getId, id)
                    .set(Comment::getReactions, json));
                realtimeService.incrementMessageRank(comment.getMessageId(), 1);
                cacheInvalidationService.evictCommentCaches();
                Message message = messageService.getById(comment.getMessageId());
                notificationService.createForCommentLiked(message, comment, userId);
                
                // WebSocket 广播评论表情更新
                Map<String, Object> broadcastData = new HashMap<>();
                broadcastData.put("type", "COMMENT_REACTION_UPDATE");
                broadcastData.put("data", Map.of("commentId", id, "messageId", comment.getMessageId(), "reactions", json));
                WebSocketServer.broadcast(objectMapper.writeValueAsString(broadcastData));
            } catch (Exception e) {
                log.error("Save comment reactions error: {}", e.getMessage());
            }
        }
    }
}
