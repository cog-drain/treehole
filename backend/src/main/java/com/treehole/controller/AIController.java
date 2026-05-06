package com.treehole.controller;

import com.treehole.common.Result;
import com.treehole.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * AI 辅助功能 Controller
 */
@Tag(name = "AI 模块", description = "提供语义搜索与智能对话辅助")
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @Operation(summary = "语义分析", description = "基于 AI 提取内容中的潜在标签")
    @PostMapping("/search")
    public Result<?> search(@RequestBody Map<String, String> body) {
        return Result.success(aiService.generateTags(body.get("query")));
    }

    @Operation(summary = "智能对话", description = "与树洞 AI 进行对话，获取情感支持")
    @PostMapping("/chat")
    public Result<?> chat(@RequestBody Map<String, String> body) {
        return Result.success(aiService.generateAlterEgoReply(body.get("message")));
    }
}
