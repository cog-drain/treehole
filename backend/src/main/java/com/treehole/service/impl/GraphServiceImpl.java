package com.treehole.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.treehole.dto.GraphDataDTO;
import com.treehole.entity.Message;
import com.treehole.entity.MessageTag;
import com.treehole.mapper.MessageMapper;
import com.treehole.mapper.MessageTagMapper;
import com.treehole.service.GraphService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GraphServiceImpl implements GraphService {

    private final MessageMapper messageMapper;
    private final MessageTagMapper messageTagMapper;

    @Override
    @Cacheable(cacheNames = "graphData", key = "'latest'")
    public GraphDataDTO getGraphData() {
        LambdaQueryWrapper<Message> messageWrapper = new LambdaQueryWrapper<>();
        messageWrapper.orderByDesc(Message::getCreateTime).last("LIMIT 150");
        List<Message> messages = messageMapper.selectList(messageWrapper);

        if (messages.isEmpty()) {
            return new GraphDataDTO(new ArrayList<>(), new ArrayList<>());
        }

        List<Long> msgIds = messages.stream().map(Message::getId).collect(Collectors.toList());

        LambdaQueryWrapper<MessageTag> tagWrapper = new LambdaQueryWrapper<>();
        tagWrapper.in(MessageTag::getMessageId, msgIds);
        List<MessageTag> msgTags = messageTagMapper.selectList(tagWrapper);

        List<GraphDataDTO.Node> nodes = messages.stream().map(message -> {
            String content = message.getContent() == null ? "" : message.getContent();
            String snippet = content.length() > 30 ? content.substring(0, 30) + "..." : content;
            return new GraphDataDTO.Node(
                    message.getId(),
                    snippet,
                    message.getMood(),
                    message.getTheme(),
                    message.getAuthorAlias()
            );
        }).collect(Collectors.toList());

        Set<String> linkKeys = new HashSet<>();
        List<GraphDataDTO.Link> links = new ArrayList<>();

        Map<Long, List<Long>> tagToMessages = new HashMap<>();
        for (MessageTag messageTag : msgTags) {
            tagToMessages.computeIfAbsent(messageTag.getTagId(), key -> new ArrayList<>()).add(messageTag.getMessageId());
        }

        for (List<Long> idsInTag : tagToMessages.values()) {
            for (int i = 0; i < idsInTag.size(); i++) {
                for (int j = i + 1; j < idsInTag.size(); j++) {
                    addLink(links, linkKeys, idsInTag.get(i), idsInTag.get(j), "tag");
                }
            }
        }

        Map<String, List<Long>> moodToMessages = new HashMap<>();
        for (Message message : messages) {
            if (message.getMood() != null) {
                moodToMessages.computeIfAbsent(message.getMood(), key -> new ArrayList<>()).add(message.getId());
            }
        }

        for (List<Long> idsInMood : moodToMessages.values()) {
            for (int i = 0; i < idsInMood.size() - 1; i++) {
                addLink(links, linkKeys, idsInMood.get(i), idsInMood.get(i + 1), "mood");
            }
        }

        return new GraphDataDTO(nodes, links);
    }

    private void addLink(List<GraphDataDTO.Link> links, Set<String> keys, Long id1, Long id2, String type) {
        if (id1.equals(id2)) {
            return;
        }
        long min = Math.min(id1, id2);
        long max = Math.max(id1, id2);
        String key = min + "-" + max;
        if (!keys.contains(key)) {
            links.add(new GraphDataDTO.Link(id1, id2, type));
            keys.add(key);
        }
    }
}
