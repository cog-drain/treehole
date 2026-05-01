package com.treehole.controller;

import com.treehole.common.Result;
import com.treehole.entity.Tag;
import com.treehole.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tag")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    /**
     * 获取热门话题标签
     */
    @GetMapping("/trending")
    public Result<List<Tag>> getTrendingTags(@RequestParam(defaultValue = "10") int limit) {
        return Result.success(tagService.getTrendingTags(limit));
    }
}
