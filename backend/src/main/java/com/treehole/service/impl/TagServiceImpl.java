package com.treehole.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.treehole.entity.MessageTag;
import com.treehole.entity.Tag;
import com.treehole.mapper.MessageTagMapper;
import com.treehole.mapper.TagMapper;
import com.treehole.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class TagServiceImpl extends ServiceImpl<TagMapper, Tag> implements TagService {

    private final MessageTagMapper messageTagMapper;

    // 匹配 # 后接非空白字符和#的正则
    private static final Pattern HASHTAG_PATTERN = Pattern.compile("#([^\\s#]+)");

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void extractAndSaveTags(Long messageId, String content) {
        if (content == null || content.isBlank()) {
            return;
        }

        Matcher matcher = HASHTAG_PATTERN.matcher(content);
        Set<String> uniqueTags = new HashSet<>();
        while (matcher.find()) {
            uniqueTags.add(matcher.group(1).trim());
        }

        for (String tagName : uniqueTags) {
            if (tagName.length() > 50) {
                tagName = tagName.substring(0, 50); // 防止超长
            }
            
            // 查找标签是否存在
            LambdaQueryWrapper<Tag> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Tag::getName, tagName);
            Tag existingTag = this.getOne(wrapper);

            if (existingTag != null) {
                // 存在则 usage_count + 1
                LambdaUpdateWrapper<Tag> updateWrapper = new LambdaUpdateWrapper<>();
                updateWrapper.eq(Tag::getId, existingTag.getId())
                             .setSql("usage_count = usage_count + 1");
                this.update(updateWrapper);
            } else {
                // 不存在则新建
                existingTag = new Tag();
                existingTag.setName(tagName);
                existingTag.setUsageCount(1);
                this.save(existingTag);
            }

            // 保存关联关系
            messageTagMapper.insert(new MessageTag(messageId, existingTag.getId()));
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void decrementTagsForMessage(Long messageId) {
        // 查找该留言关联的所有标签
        LambdaQueryWrapper<MessageTag> mtWrapper = new LambdaQueryWrapper<>();
        mtWrapper.eq(MessageTag::getMessageId, messageId);
        List<MessageTag> messageTags = messageTagMapper.selectList(mtWrapper);

        for (MessageTag mt : messageTags) {
            // usage_count - 1
            LambdaUpdateWrapper<Tag> tagUpdate = new LambdaUpdateWrapper<>();
            tagUpdate.eq(Tag::getId, mt.getTagId())
                     .gt(Tag::getUsageCount, 0)
                     .setSql("usage_count = usage_count - 1");
            this.update(tagUpdate);
        }

        // 删除关联记录
        messageTagMapper.delete(mtWrapper);
    }

    @Override
    public List<Tag> getTrendingTags(int limit) {
        LambdaQueryWrapper<Tag> wrapper = new LambdaQueryWrapper<>();
        wrapper.gt(Tag::getUsageCount, 0); // 只查使用次数 > 0 的
        wrapper.orderByDesc(Tag::getUsageCount);
        wrapper.last("LIMIT " + limit);
        return this.list(wrapper);
    }
}
