package com.treehole.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.treehole.common.Result;
import com.treehole.dto.GraphDataDTO;
import com.treehole.entity.Message;
import com.treehole.entity.MessageTag;
import com.treehole.mapper.MessageMapper;
import com.treehole.mapper.MessageTagMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/graph")
@RequiredArgsConstructor
public class GraphController {

    private final MessageMapper messageMapper;
    private final MessageTagMapper messageTagMapper;

    @GetMapping("/data")
    public Result<GraphDataDTO> getGraphData() {
        // 1. 获取最近的 150 条留言
        LambdaQueryWrapper<Message> messageWrapper = new LambdaQueryWrapper<>();
        messageWrapper.orderByDesc(Message::getCreateTime).last("LIMIT 150");
        List<Message> messages = messageMapper.selectList(messageWrapper);

        if (messages.isEmpty()) {
            return Result.success(new GraphDataDTO(new ArrayList<>(), new ArrayList<>()));
        }

        List<Long> msgIds = messages.stream().map(Message::getId).collect(Collectors.toList());

        // 2. 获取这些留言的标签关联
        LambdaQueryWrapper<MessageTag> tagWrapper = new LambdaQueryWrapper<>();
        tagWrapper.in(MessageTag::getMessageId, msgIds);
        List<MessageTag> msgTags = messageTagMapper.selectList(tagWrapper);

        // 3. 构建节点
        List<GraphDataDTO.Node> nodes = messages.stream().map(m -> {
            String snippet = m.getContent().length() > 30 ? m.getContent().substring(0, 30) + "..." : m.getContent();
            return new GraphDataDTO.Node(m.getId(), snippet, m.getMood(), m.getTheme(), m.getAuthorAlias());
        }).collect(Collectors.toList());

        // 4. 构建连线
        Set<String> linkKeys = new HashSet<>(); // 防止重复连线
        List<GraphDataDTO.Link> links = new ArrayList<>();

        // 按标签分组构建连线
        Map<Long, List<Long>> tagToMsgs = new HashMap<>();
        for (MessageTag mt : msgTags) {
            tagToMsgs.computeIfAbsent(mt.getTagId(), k -> new ArrayList<>()).add(mt.getMessageId());
        }

        for (List<Long> idsInTag : tagToMsgs.values()) {
            for (int i = 0; i < idsInTag.size(); i++) {
                for (int j = i + 1; j < idsInTag.size(); j++) {
                    addLink(links, linkKeys, idsInTag.get(i), idsInTag.get(j), "tag");
                }
            }
        }

        // 按心情分组构建连线 (弱连接，只连接最近的几个)
        Map<String, List<Long>> moodToMsgs = new HashMap<>();
        for (Message m : messages) {
            if (m.getMood() != null) {
                moodToMsgs.computeIfAbsent(m.getMood(), k -> new ArrayList<>()).add(m.getId());
            }
        }

        for (List<Long> idsInMood : moodToMsgs.values()) {
            // 只连接时间轴上相邻的，防止过度稠密
            for (int i = 0; i < idsInMood.size() - 1; i++) {
                addLink(links, linkKeys, idsInMood.get(i), idsInMood.get(i + 1), "mood");
            }
        }

        return Result.success(new GraphDataDTO(nodes, links));
    }

    private void addLink(List<GraphDataDTO.Link> links, Set<String> keys, Long id1, Long id2, String type) {
        if (id1.equals(id2)) return;
        long min = Math.min(id1, id2);
        long max = Math.max(id1, id2);
        String key = min + "-" + max;
        if (!keys.contains(key)) {
            links.add(new GraphDataDTO.Link(id1, id2, type));
            keys.add(key);
        }
    }
}
