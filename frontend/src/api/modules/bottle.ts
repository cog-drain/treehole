import request from '../request'
import type { ApiResponse, Bottle, BottleDraft, Id } from '@/types'

export const bottleApi = {
  // 扔出一个瓶子
  throwBottle: (data: BottleDraft) => request.post<unknown, ApiResponse<Bottle>>('/bottles', data),

  // 获取我的瓶子列表
  getMyBottles: () => request.get<unknown, ApiResponse<Bottle[]>>('/bottles/my'),

  // 捞起一个瓶子
  pickBottle: () => request.get<unknown, ApiResponse<Bottle | null>>('/bottles/pick'),

  // 回复瓶子 (建立回响)
  replyBottle: (id: Id, content: string, replyAuthorAlias?: string) =>
    request.post<unknown, ApiResponse<Bottle>>(`/bottles/${id}/replies`, { content, replyAuthorAlias }),

  // 扔回大海 (放弃持有)
  returnBottle: (id: Id) => request.delete<unknown, ApiResponse<null>>(`/bottles/${id}`)
}
