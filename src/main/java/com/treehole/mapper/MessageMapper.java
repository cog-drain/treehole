package com.treehole.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.treehole.entity.Message;
import org.apache.ibatis.annotations.Mapper;


/**
 * 留言 Mapper 接口
 */
@Mapper
public interface MessageMapper extends BaseMapper<Message> {
}
