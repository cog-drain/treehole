package com.treehole.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.treehole.entity.Comment;

import java.util.List;
import java.util.Map;

/**
 * 评论 Service 接口
 */
public interface CommentService extends IService<Comment> {

    /**
     * 发布评论
     *
     * @param userId 客户端提供的匿名身份标识
     * @return Map 包含 "comment"（评论实体）和 "userId"（实际使用的标识）
     */
    Map<String, Object> publish(Comment comment, String userId);

    /**
     * 根据 message_id 查询该留言下的所有评论（按时间正序）
     * @param messageId 留言ID
     * @param userId 当前用户的身份标识 (用于标记 isOwner 和同频判定)
     */
    List<Comment> listByMessageId(Long messageId, String userId);

    /**
     * 删除评论
     *
     * @param id         评论 ID
     * @param userId     客户端提供的匿名身份标识
     */
    void deleteWithToken(Long id, String userId);
    /**
     * 更新评论表情回响
     * @param id 评论ID
     * @param emoji 表情符号
     */
    void react(Long id, String emoji);
}
