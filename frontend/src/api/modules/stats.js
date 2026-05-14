import request from '../request'

export const statsApi = {
  getOnlineStats: () => request.get('/stats/online'),
  getActivityStats: () => request.get('/stats/activity')
}
