package com.treehole.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.treehole.entity.DriftBottle;

/**
 * 漂流瓶 Service 接口
 */
public interface DriftBottleService extends IService<DriftBottle> {
    
    /** 扔一个瓶子 */
    void throwBottle(DriftBottle bottle, String userId);
    
    /** 捞一个瓶子 */
    DriftBottle pickBottle(String userId);
    
    /** 回复瓶子 */
    void replyBottle(Long id, String replyContent, String replyAuthorAlias, String userId);
    
    /** 归还瓶子（放回海里） */
    void returnBottle(Long id, String userId);

    /** 获取我的瓶子列表 (包含回信) */
    java.util.List<DriftBottle> getMyBottles(String userId);
}
