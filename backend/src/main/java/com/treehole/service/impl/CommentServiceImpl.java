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
    
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate;

    public CommentServiceImpl(CacheInvalidationService cacheInvalidationService) {
        this.cacheInvalidationService = cacheInvalidationService;
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
        comment.setUserId(userId);
        comment.setAuthorAlias(null); 

        this.save(comment);

        messageService.update().setSql("comment_count = comment_count + 1")
                .eq("id", comment.getMessageId()).update();
        cacheInvalidationService.evictCommentAndMessageListCaches();

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

        Map<String, Integer> reactionMap = new HashMap<>();
        try {
            if (comment.getReactions() != null && !comment.getReactions().isBlank()) {
                reactionMap = objectMapper.readValue(comment.getReactions(), 
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, Integer>>() {});
            }
        } catch (Exception e) {
            log.error("Parse comment reactions error: {}", e.getMessage());
        }

        String redisKey = "treehole:react:cmt:" + id;

        synchronized (("cmt_react_" + id).intern()) {
            Object oldEmojiObj = stringRedisTemplate.opsForHash().get(redisKey, userId);
            String oldEmoji = oldEmojiObj != null ? oldEmojiObj.toString() : null;

            if (oldEmoji != null) {
                reactionMap.put(oldEmoji, Math.max(0, reactionMap.getOrDefault(oldEmoji, 0) - 1));
                if (reactionMap.get(oldEmoji) == 0) reactionMap.remove(oldEmoji);
            }

            if (emoji.equals(oldEmoji)) {
                // withdraw
                stringRedisTemplate.opsForHash().delete(redisKey, userId);
            } else {
                // add or change
                reactionMap.put(emoji, reactionMap.getOrDefault(emoji, 0) + 1);
                stringRedisTemplate.opsForHash().put(redisKey, userId, emoji);
            }

            try {
                String json = objectMapper.writeValueAsString(reactionMap);
                this.update(new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<Comment>()
                    .eq(Comment::getId, id)
                    .set(Comment::getReactions, json));
                cacheInvalidationService.evictCommentCaches();
                
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
