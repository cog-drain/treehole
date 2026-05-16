import request from '../request'
import type { ActivityStats, ApiResponse, OnlineStats } from '@/types'

export const statsApi = {
  getOnlineStats: () => request.get<unknown, ApiResponse<OnlineStats>>('/stats/online'),
  getActivityStats: () => request.get<unknown, ApiResponse<ActivityStats>>('/stats/activity')
}
