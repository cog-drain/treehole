import request from '../request'
import type { ApiResponse, Comment, CommentDraft, Id } from '@/types'

export const commentApi = {
  // 获取指定留言的评论列表
  getComments: (messageId: Id) => request.get<unknown, ApiResponse<Comment[]>>('/comments', { params: { messageId } }),

  // 发表评论
  publishComment: (data: CommentDraft) => request.post<unknown, ApiResponse<Comment>>('/comments', data),

  // 删除评论
  deleteComment: (id: Id) => request.delete<unknown, ApiResponse<null>>(`/comments/${id}`),

  // 表情回应
  reactToComment: (id: Id, emoji: string) => request.post<unknown, ApiResponse<unknown>>(`/comments/${id}/reactions`, null, { params: { emoji } })
}
