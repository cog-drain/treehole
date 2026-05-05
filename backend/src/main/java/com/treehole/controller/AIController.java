package com.treehole.controller;

import com.treehole.common.Result;
import com.treehole.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @PostMapping("/chat")
    public Result<String> chat(@RequestBody Map<String, String> params) {
        String content = params.get("content");
        String reply = aiService.generateAlterEgoReply(content);
        return Result.success(reply);
    }
}
