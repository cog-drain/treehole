import request from '../request'
import type { ApiResponse, BlacklistItem, Id, IdentityBackup } from '@/types'

export const identityApi = {
    // --- 用户身份 (Identity) ---
    // 备份身份
    backup: () => request.get<unknown, ApiResponse<IdentityBackup>>('/user/backup'),
    // 恢复身份
    restore: (recoveryKey: string) => request.post<unknown, ApiResponse<unknown>>('/user/restore', { recoveryKey }),

    // --- 管理员 (Admin) ---
    // 登录
    adminLogin: (password: string) => request.post<unknown, ApiResponse<unknown>>('/admin/auth', { password }),
    // 修改密码
    resetAdminPassword: (oldPassword: string, newPassword: string) =>
        request.put<unknown, ApiResponse<unknown>>('/admin/password', { oldPassword, newPassword }),
    // 封禁 IP
    banIP: (ip: string, reason?: string) =>
        request.post<unknown, ApiResponse<unknown>>('/admin/blacklist', { ip, reason }),
    // 解封 IP
    unbanIP: (ip: string) => request.delete<unknown, ApiResponse<unknown>>('/admin/blacklist', { params: { ip } }),
    // 黑名单列表
    getBlacklist: () => request.get<unknown, ApiResponse<BlacklistItem[]>>('/admin/blacklist'),
    // 强制删除 (留言/评论)
    adminDeleteMessage: (id: Id) => request.delete<unknown, ApiResponse<null>>(`/admin/messages/${id}`),
    adminDeleteComment: (id: Id) => request.delete<unknown, ApiResponse<null>>(`/admin/comments/${id}`)
}
