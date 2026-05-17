package com.treehole.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.treehole.dto.TagSubscriptionDTO;
import com.treehole.entity.Message;
import com.treehole.entity.TagSubscription;

import java.util.List;

public interface TagSubscriptionService extends IService<TagSubscription> {

    List<TagSubscriptionDTO> listByUser(String userId);

    TagSubscriptionDTO subscribe(String userId, Long tagId);

    void unsubscribe(String userId, Long tagId);

    void notifySubscribersForMessage(Message message);
}
