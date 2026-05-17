import request from '../request'
import type { ApiResponse, GraphData } from '@/types'

export const graphApi = {
    getGraphData: () => request.get<unknown, ApiResponse<GraphData>>('/graph/data')
}
