package com.treehole.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TagSubscriptionDTO {
    private Long id;
    private Long tagId;
    private String tagName;
    private Integer usageCount;
    private LocalDateTime createTime;
}
