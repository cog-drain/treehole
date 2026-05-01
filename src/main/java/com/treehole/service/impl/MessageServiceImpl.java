package com.treehole.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.treehole.common.BusinessException;
import com.treehole.entity.Comment;
import com.treehole.entity.Message;
import com.treehole.mapper.CommentMapper;
import com.treehole.mapper.MessageMapper;
import com.treehole.service.MessageService;
import com.treehole.service.TagService;
import com.treehole.entity.Tag;
import lombok.RequiredArgsConstructor;
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
public class MessageServiceImpl extends ServiceImpl<MessageMapper, Message> implements MessageService {

    private final CommentMapper commentMapper;
    private final TagService tagService;

    @Override
    public Map<String, Object> publish(Message message, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BusinessException(400, "身份标识不能为空");
        }
        message.setUserId(userId);

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

        Map<String, Object> result = new HashMap<>(2);
        result.put("message", message);
        message.setIsOwner(true);
        result.put("userId", userId);
        return result;
    }

    @Override
    public IPage<Message> listByPage(int pageNum, int pageSize, String viewerId) {
        Page<Message> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(Message::getCreateTime);
        IPage<Message> resultPage = this.page(page, wrapper);
        injectResonance(resultPage.getRecords(), viewerId);
        return resultPage;
    }

    @Override
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
            if (score != null && score >= 3) {
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
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteWithComments(Long id, String userId) {
        Message message = this.getById(id);
        if (message == null) {
            throw new BusinessException(404, "留言不存在");
        }

        if (userId == null || userId.isBlank() || !userId.equals(message.getUserId())) {
            throw new BusinessException(403, "无权删除此留言");
        }

        LambdaQueryWrapper<Comment> commentWrapper = new LambdaQueryWrapper<>();
        commentWrapper.eq(Comment::getMessageId, id);
        commentMapper.delete(commentWrapper);

        tagService.decrementTagsForMessage(id);
        this.removeById(id);
    }

}
