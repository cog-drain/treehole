import request from '../request'
import type { ApiResponse, Id, TagSubscription } from '@/types'

export const tagSubscriptionApi = {
  getSubscriptions: () =>
    request.get<unknown, ApiResponse<TagSubscription[]>>('/tag-subscriptions'),

  subscribe: (tagId: Id) =>
    request.post<unknown, ApiResponse<TagSubscription>>(`/tag-subscriptions/${tagId}`),

  unsubscribe: (tagId: Id) =>
    request.delete<unknown, ApiResponse<null>>(`/tag-subscriptions/${tagId}`)
}
