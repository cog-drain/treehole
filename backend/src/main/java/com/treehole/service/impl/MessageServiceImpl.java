package com.treehole.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.treehole.common.BusinessException;
import com.treehole.common.ErrorCode;
import com.treehole.entity.Comment;
import com.treehole.entity.Message;
import com.treehole.mapper.CommentMapper;
import com.treehole.mapper.MessageMapper;
import com.treehole.service.CacheInvalidationService;
import com.treehole.service.MessageService;
import com.treehole.service.TagService;
import com.treehole.service.AIService;
import com.treehole.entity.Tag;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.treehole.websocket.WebSocketServer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

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
    private final org.springframework.data.redis.core.StringRedisTemplate stringRedisTemplate;

    @Override
    public Map<String, Object> publish(Message message, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "身份标识不能为空");
        }
        message.setUserId(userId);

        // --- AI 语义自动化：生成自动标签 ---
        // 1. 生成语义标签
        List<String> aiTags = aiService.generateTags(message.getContent());
        if (!aiTags.isEmpty()) {
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

        this.save(message);
        tagService.extractAndSaveTags(message.getId(), message.getContent());
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

    @Override
    @Cacheable(
            cacheNames = "messagePage",
            key = "T(String).format('%d:%d:%s', #pageNum, #pageSize, #viewerId == null ? '' : #viewerId)"
    )
    public IPage<Message> listByPage(int pageNum, int pageSize, String viewerId) {
        Page<Message> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(Message::getCreateTime);
        IPage<Message> resultPage = this.page(page, wrapper);
        injectResonance(resultPage.getRecords(), viewerId);
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
        wrapper.orderByDesc(Message::getCreateTime);
        
        IPage<Message> resultPage = this.page(page, wrapper);
        injectResonance(resultPage.getRecords(), viewerId);
        return resultPage;
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
    public void like(Long id) {
        LambdaUpdateWrapper<Message> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Message::getId, id)
               .setSql("likes = likes + 1");
        this.update(wrapper);
        cacheInvalidationService.evictMessageListCaches();
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

        Map<String, Integer> reactionMap = new HashMap<>();
        try {
            if (message.getReactions() != null && !message.getReactions().isBlank()) {
                reactionMap = objectMapper.readValue(message.getReactions(), 
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, Integer>>() {});
            }
        } catch (Exception e) {
            log.error("Parse reactions error: {}", e.getMessage());
        }

        String redisKey = "treehole:react:msg:" + id;
        
        synchronized (("msg_react_" + id).intern()) {
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
                this.update(new LambdaUpdateWrapper<Message>()
                    .eq(Message::getId, id)
                    .set(Message::getReactions, json));
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
}
