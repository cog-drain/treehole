package com.treehole.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.treehole.entity.Notification;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface NotificationMapper extends BaseMapper<Notification> {
}
