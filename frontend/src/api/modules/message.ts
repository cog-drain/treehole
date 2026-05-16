import request from '../request'
import { offlineQueue } from '../../utils/offlineQueue'
import type { ApiResponse, Id, Message, MessageDraft, PageParams, PageResult, TrendingTag } from '@/types'

export const messageApi = {
  // 分页获取留言 (支持 tag 过滤)
  getMessages: (params: PageParams) => request.get<unknown, ApiResponse<PageResult<Message>>>('/messages', { params }),

  // 获取单条留言，用于通知定位
  getMessage: (id: Id) => request.get<unknown, ApiResponse<Message>>(`/messages/${id}`),

  // 发布留言 (包含离线处理逻辑)
  publishMessage: async (data: MessageDraft): Promise<ApiResponse<{ message?: Message } | null>> => {
    try {
      return await request.post('/messages', data)
    } catch (err) {
      if (!window.navigator.onLine || (err instanceof Error && err.message === 'Network Error')) {
        offlineQueue.push(data)
        return { code: 202, msg: '已进入离线队列', data: null }
      }
      throw err
    }
  },

  // 删除留言
  deleteMessage: (id: Id) => request.delete<unknown, ApiResponse<null>>(`/messages/${id}`),

  // 点赞共鸣
  likeMessage: (id: Id) => request.put<unknown, ApiResponse<unknown>>(`/messages/${id}/like`),

  // 表情回应
  reactToMessage: (id: Id, emoji: string) => request.post<unknown, ApiResponse<unknown>>(`/messages/${id}/reactions`, null, { params: { emoji } }),

  // 告解见证
  witnessMessage: (id: Id) => request.post<unknown, ApiResponse<unknown>>(`/messages/${id}/witness`),

  // 随机获取一条 (灵感/禅)
  getRandom: () => request.get<unknown, ApiResponse<Message>>('/messages/random'),

  // 热门标签
  getTrendingTags: (limit = 10) => request.get<unknown, ApiResponse<TrendingTag[]>>('/tags/trending', { params: { limit } })
}
