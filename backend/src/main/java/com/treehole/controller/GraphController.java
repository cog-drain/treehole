package com.treehole.controller;

import com.treehole.common.Result;
import com.treehole.dto.GraphDataDTO;
import com.treehole.service.GraphService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 知识图谱 Controller
 */
@Tag(name = "知识图谱模块", description = "提供树洞留言之间的语义关联图谱数据")
@RestController
@RequestMapping("/api/graph")
@RequiredArgsConstructor
public class GraphController {

    private final GraphService graphService;

    @Operation(summary = "获取图谱数据", description = "获取全量留言及其语义关联关系，用于可视化展示")
    @GetMapping("/data")
    public Result<GraphDataDTO> getGraphData() {
        return Result.success(graphService.getGraphData());
    }
}
