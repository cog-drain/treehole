package com.treehole.service;

import com.treehole.entity.Blacklist;
import java.util.List;

public interface AdminService {
    String login(String password);
    void resetPassword(String oldPassword, String newPassword);
    void deleteMessage(Long id);
    void deleteComment(Long id);
    void banIP(String ip, String reason);
    void unbanIP(String ip);
    List<Blacklist> listBlacklist();
    boolean isIPBanned(String ip);
}
