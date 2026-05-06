package com.treehole.controller;

import com.treehole.common.Result;
import com.treehole.entity.Tag;
import com.treehole.service.TagService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 标签 Controller
 */
@io.swagger.v3.oas.annotations.tags.Tag(name = "标签模块", description = "留言分类标签的管理与查询")
@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @Operation(summary = "获取热门话题", description = "返回当前树洞中最活跃的标签列表")
    @GetMapping("/trending")
    public Result<List<Tag>> getTrendingTags(@RequestParam(defaultValue = "10") int limit) {
        return Result.success(tagService.getTrendingTags(limit));
    }
}
