package com.treehole.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("blacklist")
public class Blacklist {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String ip;
    private String reason;
    private LocalDateTime createTime;
}
