package com.treehole.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("confession_witness")
public class ConfessionWitness {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long messageId;

    private String userId;

    private LocalDateTime createTime;
}
