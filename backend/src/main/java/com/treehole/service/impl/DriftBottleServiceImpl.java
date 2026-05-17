package com.treehole.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.treehole.common.BusinessException;
import com.treehole.common.ErrorCode;
import com.treehole.entity.DriftBottle;
import com.treehole.mapper.DriftBottleMapper;
import com.treehole.service.DriftBottleService;
import com.treehole.service.RealtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * 漂流瓶 Service 实现类 (Local Identity 模型)
 */
@Service
@RequiredArgsConstructor
public class DriftBottleServiceImpl extends ServiceImpl<DriftBottleMapper, DriftBottle> implements DriftBottleService {

    private final RealtimeService realtimeService;

    @Override
    @Transactional
    public void throwBottle(DriftBottle bottle, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "身份标识不能为空");
        }
        bottle.setUserId(userId);
        bottle.setState(0); // 漂流中
        this.save(bottle);
        realtimeService.addBottleToPool(bottle.getId());
    }

    @Override
    @Transactional
    public DriftBottle pickBottle(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "身份标识不能为空");
        }
        
        // 1. 自动回收：释放超过 5 分钟未处理的“僵尸瓶”
        LocalDateTime timeout = LocalDateTime.now().minusMinutes(5);
        java.util.List<DriftBottle> staleBottles = this.list(new LambdaQueryWrapper<DriftBottle>()
                .eq(DriftBottle::getState, 1)
                .lt(DriftBottle::getUpdateTime, timeout));
        LambdaUpdateWrapper<DriftBottle> reclaim = new LambdaUpdateWrapper<>();
        reclaim.eq(DriftBottle::getState, 1)
               .lt(DriftBottle::getUpdateTime, timeout) // 使用更新时间判定超时，确保打捞后有充足的回复时间
               .set(DriftBottle::getState, 0)
               .set(DriftBottle::getPickerId, null);
        this.update(reclaim);
        staleBottles.forEach(b -> realtimeService.addBottleToPool(b.getId()));

        // 2. 优先从 Redis 候选池随机抽样，避免数据库 ORDER BY RAND() 成为热路径
        DriftBottle bottle = pickFromRedisPool(userId);
        if (bottle != null) {
            return bottle;
        }

        // 3. 兜底：池为空或池中候选都无效时，回退数据库随机查询并修复 Redis 池
        LambdaQueryWrapper<DriftBottle> query = new LambdaQueryWrapper<>();
        query.eq(DriftBottle::getState, 0)
             .ne(DriftBottle::getUserId, userId)
             .and(w -> w.ne(DriftBottle::getLastPickerId, userId).or().isNull(DriftBottle::getLastPickerId))
             .last("ORDER BY RAND() LIMIT 1");
        
        bottle = this.getOne(query);
        if (bottle != null) {
            reserveBottle(bottle, userId);
        }
        return bottle;
    }

    private DriftBottle pickFromRedisPool(String userId) {
        Set<String> candidates = realtimeService.sampleBottleIds(10);
        if (candidates == null || candidates.isEmpty()) return null;

        for (String candidate : candidates) {
            Long bottleId;
            try {
                bottleId = Long.valueOf(candidate);
            } catch (NumberFormatException e) {
                continue;
            }

            DriftBottle bottle = this.getById(bottleId);
            if (bottle == null || bottle.getState() == null || bottle.getState() != 0) {
                realtimeService.removeBottleFromPool(bottleId);
                continue;
            }
            if (userId.equals(bottle.getUserId()) || userId.equals(bottle.getLastPickerId())) {
                continue;
            }

            reserveBottle(bottle, userId);
            return bottle;
        }
        return null;
    }

    private void reserveBottle(DriftBottle bottle, String userId) {
        LambdaUpdateWrapper<DriftBottle> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(DriftBottle::getId, bottle.getId())
                     .eq(DriftBottle::getState, 0)
                     .set(DriftBottle::getState, 1)
                     .set(DriftBottle::getPickerId, userId);
        this.update(updateWrapper);
        realtimeService.removeBottleFromPool(bottle.getId());

        bottle.setState(1);
        bottle.setPickerId(userId);
    }

    @Override
    @Transactional
    public void replyBottle(Long id, String replyContent, String replyAuthorAlias, String userId) {
        DriftBottle bottle = this.getById(id);
        if (bottle == null) throw new BusinessException(ErrorCode.BOTTLE_NOT_FOUND, "瓶子已消失在海中");
        
        if (!userId.equals(bottle.getPickerId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "你没有权限回复这个瓶子");
        }
        
        // 保存回信内容与时间
        bottle.setReplyContent(replyContent);
        bottle.setReplyAuthorAlias(replyAuthorAlias);
        bottle.setReplyTime(LocalDateTime.now());
        bottle.setState(2); // 已归还/完成
        this.updateById(bottle);
        realtimeService.removeBottleFromPool(id);

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
        if (bottle == null) throw new BusinessException(ErrorCode.BOTTLE_NOT_FOUND, "瓶子不存在");
        
        if (!userId.equals(bottle.getPickerId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "你没有权限归还这个瓶子");
        }
        
        bottle.setState(0); // 重新放回海里
        bottle.setPickerId(null);
        bottle.setLastPickerId(userId); // 标记此用户已看过并放回
        this.updateById(bottle);
        realtimeService.addBottleToPool(id);
    }

    @Override
    public java.util.List<DriftBottle> getMyBottles(String userId) {
        return this.list(new LambdaQueryWrapper<DriftBottle>()
                .eq(DriftBottle::getUserId, userId)
                .orderByDesc(DriftBottle::getCreateTime));
    }
}
