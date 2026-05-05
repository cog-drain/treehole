package com.treehole.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GraphDataDTO {
    private List<Node> nodes;
    private List<Link> links;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Node {
        private Long id;
        private String label;
        private String mood;
        private String theme;
        private String author;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Link {
        private Long source;
        private Long target;
        private String type; // "tag" or "mood"
    }
}
