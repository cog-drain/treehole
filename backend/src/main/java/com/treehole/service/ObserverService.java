package com.treehole.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.treehole.entity.Message;
import com.treehole.mapper.MessageMapper;
import com.treehole.websocket.WebSocketServer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class ObserverService {

    private final MessageMapper messageMapper;
    private final ObjectMapper objectMapper;
    private final Random random = new Random();

    /**
     * 生产模式：每 2 分钟执行一次观察任务
     */
    @Scheduled(fixedRate = 120000)
    public void observe() {
        try {
            // 1. 获取近 1 小时的留言数量
            LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
            LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();
            wrapper.gt(Message::getCreateTime, oneHourAgo);
            long recentCount = messageMapper.selectCount(wrapper);

            // 2. 准备守望者的台词
            String quote = generatePoeticQuote(recentCount);

            // 3. 通过 WebSocket 广播
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "OBSERVER_MESSAGE");
            payload.put("data", quote);
            payload.put("timestamp", LocalDateTime.now().toString());

            WebSocketServer.broadcast(objectMapper.writeValueAsString(payload));
            log.info("The Observer has spoken: {}", quote);
            
        } catch (Exception e) {
            log.error("Observer task error: {}", e.getMessage());
        }
    }

    private String generatePoeticQuote(long count) {
        if (count > 20) {
            String[] quotes = {
                "今晚的树洞，比平时喧嚣了一些，大家都在星空下低语。",
                "森林里回荡着许多声音，每一声叹息都在寻找归宿。",
                "热闹的表象下，我听见了二十颗心脏跳动的频率。"
            };
            return quotes[random.nextInt(quotes.length)];
        } else if (count > 0) {
            String[] quotes = {
                "风吹过叶尖，带走了几段不为人知的往事。",
                "此刻的宁静里，仍有灵魂在悄悄倾诉。",
                "我看见了几颗流星划过，那是有人在许下心愿。"
            };
            return quotes[random.nextInt(quotes.length)];
        } else {
            String[] quotes = {
                "森林陷入了沉睡，唯有星光在守护着那些沉默的梦。",
                "今夜无风，也无声，世界正在温柔地包裹着孤独。",
                "静谧的时刻，连树叶的呼吸都变得清晰可见。"
            };
            return quotes[random.nextInt(quotes.length)];
        }
    }
}
