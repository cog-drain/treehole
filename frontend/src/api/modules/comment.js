import request from '../request'

export const commentApi = {
  // 获取指定留言的评论列表
  getComments: (messageId) => request.get('/comments', { params: { messageId } }),

  // 发表评论
  publishComment: (data) => request.post('/comments', data),

  // 删除评论
  deleteComment: (id) => request.delete(`/comments/${id}`),

  // 表情回应
  reactToComment: (id, emoji) => request.post(`/comments/${id}/reactions`, null, { params: { emoji } })
}
