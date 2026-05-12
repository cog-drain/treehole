import request from '../request'

export const identityApi = {
  // --- 用户身份 (Identity) ---
  // 备份身份
  backup: () => request.get('/user/backup'),
  // 恢复身份
  restore: (recoveryKey) => request.post('/user/restore', { recoveryKey }),

  // --- 管理员 (Admin) ---
  // 登录
  adminLogin: (password) => request.post('/admin/auth', { password }),
  // 修改密码
  resetAdminPassword: (oldPassword, newPassword) => 
    request.put('/admin/password', { oldPassword, newPassword }),
  // 封禁 IP
  banIP: (ip, reason) => request.post('/admin/blacklist', { ip, reason }),
  // 解封 IP
  unbanIP: (ip) => request.delete('/admin/blacklist', { params: { ip } }),
  // 黑名单列表
  getBlacklist: () => request.get('/admin/blacklist'),
  // 强制删除 (留言/评论)
  adminDeleteMessage: (id) => request.delete(`/admin/messages/${id}`),
  adminDeleteComment: (id) => request.delete(`/admin/comments/${id}`)
}
