import request from '../request'
import { offlineQueue } from '../../utils/offlineQueue'

export const messageApi = {
  // 分页获取留言 (支持 tag 过滤)
  getMessages: (params) => request.get('/messages', { params }),

  // 发布留言 (包含离线处理逻辑)
  publishMessage: async (data) => {
    try {
      return await request.post('/messages', data)
    } catch (err) {
      if (!window.navigator.onLine || err.message === 'Network Error') {
        offlineQueue.push(data)
        return { code: 202, msg: '已进入离线队列', data: null }
      }
      throw err
    }
  },

  // 删除留言
  deleteMessage: (id) => request.delete(`/messages/${id}`),

  // 点赞共鸣
  likeMessage: (id) => request.put(`/messages/${id}/like`),

  // 表情回应
  reactToMessage: (id, emoji) => request.post(`/messages/${id}/reactions`, null, { params: { emoji } }),

  // 告解见证
  witnessMessage: (id) => request.post(`/messages/${id}/witness`),

  // 随机获取一条 (灵感/禅)
  getRandom: () => request.get('/messages/random'),

  // 热门标签
  getTrendingTags: (limit = 10) => request.get('/tags/trending', { params: { limit } })
}
