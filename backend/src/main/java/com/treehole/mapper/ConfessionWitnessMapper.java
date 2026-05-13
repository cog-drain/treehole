package com.treehole.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.treehole.entity.ConfessionWitness;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface ConfessionWitnessMapper extends BaseMapper<ConfessionWitness> {

    @Select("<script>" +
            "SELECT message_id, COUNT(*) AS witness_count FROM confession_witness " +
            "WHERE message_id IN " +
            "<foreach item='id' collection='messageIds' open='(' separator=',' close=')'>#{id}</foreach> " +
            "GROUP BY message_id" +
            "</script>")
    List<Map<String, Object>> countByMessageIds(@Param("messageIds") List<Long> messageIds);

    @Select("<script>" +
            "SELECT message_id FROM confession_witness " +
            "WHERE user_id = #{userId} AND message_id IN " +
            "<foreach item='id' collection='messageIds' open='(' separator=',' close=')'>#{id}</foreach>" +
            "</script>")
    List<Long> findWitnessedMessageIds(@Param("userId") String userId, @Param("messageIds") List<Long> messageIds);
}
