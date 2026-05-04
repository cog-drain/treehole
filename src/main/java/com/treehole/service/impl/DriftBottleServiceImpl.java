package com.treehole.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.treehole.common.BusinessException;
import com.treehole.entity.DriftBottle;
import com.treehole.mapper.DriftBottleMapper;
import com.treehole.service.DriftBottleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 漂流瓶 Service 实现类 (Local Identity 模型)
 */
@Service
@RequiredArgsConstructor
public class DriftBottleServiceImpl extends ServiceImpl<DriftBottleMapper, DriftBottle> implements DriftBottleService {

    @Override
    @Transactional
    public void throwBottle(DriftBottle bottle, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BusinessException(400, "身份标识不能为空");
        }
        bottle.setUserId(userId);
        bottle.setState(0); // 漂流中
        this.save(bottle);
    }

    @Override
    @Transactional
    public DriftBottle pickBottle(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BusinessException(400, "身份标识不能为空");
        }
        
        // 1. 自动回收：释放超过 5 分钟未处理的“僵尸瓶”
        LocalDateTime timeout = LocalDateTime.now().minusMinutes(5);
        LambdaUpdateWrapper<DriftBottle> reclaim = new LambdaUpdateWrapper<>();
        reclaim.eq(DriftBottle::getState, 1)
               .lt(DriftBottle::getCreateTime, timeout) // 这里其实应该用更新时间，但 MVP 暂用创建时间模拟，或不限制时间直接释放旧瓶
               .set(DriftBottle::getState, 0)
               .set(DriftBottle::getPickerId, null);
        this.update(reclaim);

        // 2. 随机捞一个不属于自己且在海里的瓶子，且避开刚被自己扔掉的
        LambdaQueryWrapper<DriftBottle> query = new LambdaQueryWrapper<>();
        query.eq(DriftBottle::getState, 0)
             .ne(DriftBottle::getUserId, userId)
             .and(w -> w.ne(DriftBottle::getLastPickerId, userId).or().isNull(DriftBottle::getLastPickerId))
             .last("ORDER BY RAND() LIMIT 1");
        
        DriftBottle bottle = this.getOne(query);
        if (bottle != null) {
            // 精准更新，不触碰 content 字段，防止因映射问题导致内容被擦除
            LambdaUpdateWrapper<DriftBottle> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.eq(DriftBottle::getId, bottle.getId())
                         .set(DriftBottle::getState, 1)
                         .set(DriftBottle::getPickerId, userId);
            this.update(updateWrapper);
            
            // 同步更新本地对象的内存状态返回给前端
            bottle.setState(1);
            bottle.setPickerId(userId);
        }
        return bottle;
    }

    @Override
    @Transactional
    public void replyBottle(Long id, String replyContent, String replyAuthorAlias, String userId) {
        DriftBottle bottle = this.getById(id);
        if (bottle == null) throw new BusinessException(404, "瓶子已消失在海中");
        
        if (!userId.equals(bottle.getPickerId())) {
            throw new BusinessException(403, "你没有权限回复这个瓶子");
        }
        
        // 保存回信内容与时间
        bottle.setReplyContent(replyContent);
        bottle.setReplyAuthorAlias(replyAuthorAlias);
        bottle.setReplyTime(LocalDateTime.now());
        bottle.setState(2); // 已归还/完成
        this.updateById(bottle);

        // 实时通知原作者
        try {
            com.treehole.common.Result<DriftBottle> res = com.treehole.common.Result.success(bottle);
            res.setMsg("BOTTLE_REPLIED"); // 使用 msg 字段标记通知类型
            com.treehole.websocket.WebSocketServer.sendToUser(bottle.getUserId(), res);
        } catch (Exception e) {
            // 通知失败不影响业务流程
        }
    }

    @Override
    @Transactional
    public void returnBottle(Long id, String userId) {
        DriftBottle bottle = this.getById(id);
        if (bottle == null) throw new BusinessException(404, "瓶子不存在");
        
        if (!userId.equals(bottle.getPickerId())) {
            throw new BusinessException(403, "你没有权限归还这个瓶子");
        }
        
        bottle.setState(0); // 重新放回海里
        bottle.setPickerId(null);
        bottle.setLastPickerId(userId); // 标记此用户已看过并放回
        this.updateById(bottle);
    }

    @Override
    public java.util.List<DriftBottle> getMyBottles(String userId) {
        return this.list(new LambdaQueryWrapper<DriftBottle>()
                .eq(DriftBottle::getUserId, userId)
                .orderByDesc(DriftBottle::getCreateTime));
    }
}
