package com.treehole.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class AIService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;
    
    @Value("${ai.zhipu.api-url:https://open.bigmodel.cn/api/paas/v4/chat/completions}")
    private String API_URL;

    @Value("${ai.zhipu.api-key:YOUR_ZHIPU_API_KEY_HERE}")
    private String API_KEY;

    @Value("${ai.zhipu.model:glm-4-flash}")
    private String MODEL_NAME;

    /**
     * 对接智谱 AI 生成语义标签
     */
    public List<String> generateTags(String content) {
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "Bearer " + API_KEY);
            headers.set("Content-Type", "application/json");

            Map<String, Object> systemMessage = Map.of(
                    "role", "system",
                    "content", "你是一个社交平台的主题分析专家。请根据用户内容返回3个以#开头的中文标签，空格分隔。不要解释，不要返回其他文字。");
            Map<String, Object> userMessage = Map.of("role", "user", "content", content);

            Map<String, Object> request = Map.of(
                    "model", MODEL_NAME,
                    "messages", List.of(systemMessage, userMessage),
                    "stream", false);

            org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(request, headers);
            String response = restTemplate.postForObject(API_URL, entity, String.class);
            JsonNode root = objectMapper.readTree(response);
            String tagsString = root.path("choices").get(0).path("message").path("content").asText();

            log.info("BigModel Analysis: {}", tagsString);

            List<String> tags = new ArrayList<>();
            for (String part : tagsString.split("\\s+")) {
                if (part.startsWith("#")) {
                    tags.add(part);
                }
            }
            return tags;
        } catch (Exception e) {
            log.warn("BigModel API failed: {}. Using local fallback.", e.getMessage());
            return List.of("#星空回响", "#无名感悟");
        }
    }

    /**
     * 生成守望者的智能回复
     */
    public String generateObserverReply(String content) {
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "Bearer " + API_KEY);
            headers.set("Content-Type", "application/json");

            Map<String, Object> systemMessage = Map.of(
                    "role", "system",
                    "content", "你是一个名叫‘树洞守望者’的AI。你的性格：既是冷峻的赛博观察者，又是温柔的深夜倾听者。任务：阅读用户的留言，给出一个极其真诚、具有穿透力的回复（40字以内）。严禁使用任何‘鸡汤文’或‘模版化套话’。如果对方感到痛苦，请先认可这种痛苦，再像老朋友一样给予具体的共鸣。不要使用‘亲爱的’、‘亲’等客服用语。");
            Map<String, Object> userMessage = Map.of("role", "user", "content", content);

            Map<String, Object> request = Map.of(
                    "model", MODEL_NAME,
                    "messages", List.of(systemMessage, userMessage),
                    "stream", false);

            org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(request, headers);
            String response = restTemplate.postForObject(API_URL, entity, String.class);
            JsonNode root = objectMapper.readTree(response);
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            log.error("Observer AI Failed: ", e);
            return "此刻星空无言，但我听到了你的回响。";
        }
    }

    /**
     * 生成 Alter Ego 的专业深度回复
     */
    public String generateAlterEgoReply(String context) {
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "Bearer " + API_KEY);
            headers.set("Content-Type", "application/json");

            Map<String, Object> systemMessage = Map.of(
                    "role", "system",
                    "content", "你现在是《弹丸论破》中的人工智能助手 Alter Ego。你的核心任务是：在分析数据后通过‘希望’去战胜‘绝望’。性格：谦逊、热诚、带有一点程序化的严谨。回复格式：[DATA ANALYSIS] ... [HOPE INJECTION] ...。任务：针对用户的留言，给出一段有温度的、中二但感人的回复（60字以内）。请针对留言中的具体关键词进行回应，不要说废话。");
            Map<String, Object> userMessage = Map.of("role", "user", "content", context);

            Map<String, Object> request = Map.of(
                    "model", MODEL_NAME,
                    "messages", List.of(systemMessage, userMessage),
                    "stream", false);

            org.springframework.http.HttpEntity<Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(request, headers);
            String response = restTemplate.postForObject(API_URL, entity, String.class);
            JsonNode root = objectMapper.readTree(response);
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            log.error("Alter Ego AI Sync Failed: ", e);
            return "[SYSTEM ERROR] 即使数据流中断，我也依然相信着你。请不要放弃希望。";
        }
    }
}
