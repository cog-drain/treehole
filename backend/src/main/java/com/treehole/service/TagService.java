package com.treehole.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.treehole.entity.Tag;

import java.util.List;

public interface TagService extends IService<Tag> {
    /** 提取文本中的标签并保存 */
    void extractAndSaveTags(Long messageId, String content);

    /** 留言被删除时，扣减相关标签的引用计数 */
    void decrementTagsForMessage(Long messageId);

    /** 获取热门标签 */
    List<Tag> getTrendingTags(int limit);
}
