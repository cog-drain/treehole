package com.treehole.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.treehole.common.BusinessException;
import com.treehole.common.ErrorCode;
import com.treehole.util.TokenUtil;
import com.treehole.entity.AdminConfig;
import com.treehole.entity.Blacklist;
import com.treehole.mapper.AdminConfigMapper;
import com.treehole.mapper.BlacklistMapper;
import com.treehole.mapper.CommentMapper;
import com.treehole.mapper.MessageMapper;
import com.treehole.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminConfigMapper adminConfigMapper;
    private final BlacklistMapper blacklistMapper;
    private final MessageMapper messageMapper;
    private final CommentMapper commentMapper;

    @Override
    public String login(String password) {
        AdminConfig config = adminConfigMapper.selectById("admin_password");
        
        // 自动初始化：如果数据库没密码，默认创建一个 root
        if (config == null) {
            config = new AdminConfig();
            config.setConfigKey("admin_password");
            config.setConfigValue("root");
            adminConfigMapper.insert(config);
        }

        if (!config.getConfigValue().equals(password)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "管理员密码错误");
        }
        return TokenUtil.generateToken(); 
    }

    @Override
    @Transactional
    public void resetPassword(String oldPassword, String newPassword) {
        AdminConfig config = adminConfigMapper.selectById("admin_password");
        if (config == null || !config.getConfigValue().equals(oldPassword)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "原密码错误");
        }
        config.setConfigValue(newPassword);
        adminConfigMapper.updateById(config);
    }

    @Override
    public void deleteMessage(Long id) {
        // MyBatis-Plus 开启了 TableLogic 后，deleteById 自动变为软删除
        messageMapper.deleteById(id);
    }

    @Override
    public void deleteComment(Long id) {
        commentMapper.deleteById(id);
    }

    @Override
    public void banIP(String ip, String reason) {
        Blacklist blacklist = new Blacklist();
        blacklist.setIp(ip);
        blacklist.setReason(reason);
        try {
            blacklistMapper.insert(blacklist);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "该 IP 已在黑名单中");
        }
    }

    @Override
    public void unbanIP(String ip) {
        blacklistMapper.delete(new LambdaQueryWrapper<Blacklist>().eq(Blacklist::getIp, ip));
    }

    @Override
    public List<Blacklist> listBlacklist() {
        return blacklistMapper.selectList(null);
    }

    @Override
    public boolean isIPBanned(String ip) {
        return blacklistMapper.selectCount(new LambdaQueryWrapper<Blacklist>().eq(Blacklist::getIp, ip)) > 0;
    }
}
