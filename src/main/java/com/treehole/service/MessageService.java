package com.treehole.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.treehole.entity.Message;

import java.util.Map;

/**
 * 留言 Service 接口
 */
public interface MessageService extends IService<Message> {

    /**
     * 发布留言
     *
     * @param ownerToken 客户端提供的原始令牌（可选）
     * @return Map 包含 "message"（留言实体）和 "ownerToken"（实际使用的令牌）
     */
    Map<String, Object> publish(Message message, String ownerToken);

    /**
     * 分页查询留言列表（按 create_time 倒序）
     * @param viewerToken 查看者 Token (用于同频判定)
     */
    IPage<Message> listByPage(int pageNum, int pageSize, String viewerToken);

    /**
     * 按话题标签分页查询留言列表
     * @param viewerToken 查看者 Token (用于同频判定)
     */
    IPage<Message> listByTag(String tagName, int pageNum, int pageSize, String viewerToken);

    /**
     * 给留言点赞（likes + 1）
     */
    void like(Long id);

    /**
     * 删除留言，同时级联删除该留言下所有评论
     *
     * @param id         留言 ID
     * @param ownerToken 客户端提供的原始所有权令牌
     */
    void deleteWithComments(Long id, String ownerToken);

}
