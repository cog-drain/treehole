import request from '../request'

export const graphApi = {
  getGraphData: () => request.get('/graph/data')
}
