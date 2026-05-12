package com.treehole.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.treehole.entity.Comment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 评论 Mapper 接口
 */
@Mapper
public interface CommentMapper extends BaseMapper<Comment> {

    /**
     * 批量查询作者与查看者的共鸣得分（互动过的共同留言数）
     * @param viewerId 查看者 UserId
     * @param authorIds 待检查的作者 UserId 列表
     * @return 包含 author_token 和 resonance_score 的 Map 列表
     */
    @Select("<script>" +
            "SELECT t1.author_token, SUM(t1.score) as resonance_score FROM (" +
            "  /* 基础得分：在同一个留言下互动过 (DISTINCT 防止单帖刷分) */ " +
            "  SELECT DISTINCT user_id as author_token, message_id, 1.0 as score FROM comment " +
            "  WHERE is_deleted = 0 AND user_id != #{viewerId} AND user_id IN " +
            "  <foreach item='item' index='index' collection='authorIds' open='(' separator=',' close=')'>#{item}</foreach>" +
            "  UNION ALL " +
            "  SELECT DISTINCT user_id as author_token, id as message_id, 1.0 as score FROM message " +
            "  WHERE is_deleted = 0 AND user_id != #{viewerId} AND user_id IN " +
            "  <foreach item='item' index='index' collection='authorIds' open='(' separator=',' close=')'>#{item}</foreach>" +
            "  UNION ALL " +
            "  /* 额外加分：直接回复过对方 (父子关系, DISTINCT 同一帖只算一次) */ " +
            "  SELECT DISTINCT c1.user_id as author_token, c1.message_id, 2.0 as score " +
            "  FROM comment c1 JOIN comment c2 ON c1.parent_id = c2.id " +
            "  WHERE c1.is_deleted = 0 AND c2.is_deleted = 0 AND c2.user_id = #{viewerId} AND c1.user_id IN " +
            "  <foreach item='item' index='index' collection='authorIds' open='(' separator=',' close=')'>#{item}</foreach>" +
            ") t1 JOIN (" +
            "  /* UNION 去重防止 viewer 既是作者又评论时双倍计分 */ " +
            "  SELECT message_id FROM comment WHERE is_deleted = 0 AND user_id = #{viewerId}" +
            "  UNION " +
            "  SELECT id as message_id FROM message WHERE is_deleted = 0 AND user_id = #{viewerId}" +
            ") t2 ON t1.message_id = t2.message_id " +
            "GROUP BY t1.author_token" +
            "</script>")
    List<Map<String, Object>> getResonanceScores(@Param("viewerId") String viewerId, @Param("authorIds") List<String> authorIds);
}
