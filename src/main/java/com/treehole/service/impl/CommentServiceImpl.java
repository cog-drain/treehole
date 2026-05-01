package com.treehole.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.treehole.common.BusinessException;
import com.treehole.entity.Comment;
import com.treehole.mapper.CommentMapper;
import com.treehole.service.CommentService;
import com.treehole.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.treehole.common.IdentityUtils;
import com.treehole.entity.Message;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 评论 Service 实现类
 */
@Service
public class CommentServiceImpl extends ServiceImpl<CommentMapper, Comment> implements CommentService {

    private MessageService messageService;

    @Autowired
    public void setMessageService(@Lazy MessageService messageService) {
        this.messageService = messageService;
    }

    @Override
    @Transactional
    public Map<String, Object> publish(Comment comment, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BusinessException(400, "身份标识不能为空");
        }
        comment.setUserId(userId);
        comment.setAuthorAlias(null); 

        this.save(comment);

        messageService.update().setSql("comment_count = comment_count + 1")
                .eq("id", comment.getMessageId()).update();

        comment.setIsOwner(true);

        Map<String, Object> result = new HashMap<>(2);
        result.put("comment", comment);
        result.put("userId", userId);
        return result;
    }

    @Override
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
            if (score != null && score >= 3) {
                c.setCoFrequency(true);
            }
        }
    }

    @Override
    public void deleteWithToken(Long id, String userId) {
        Comment comment = this.getById(id);
        if (comment == null) {
            throw new BusinessException(404, "评论不存在");
        }
        if (userId == null || userId.isBlank() || !userId.equals(comment.getUserId())) {
            throw new BusinessException(403, "无权删除此评论");
        }
        this.removeById(id);
    }
}
