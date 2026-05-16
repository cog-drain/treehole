import request from '../request'
import type { ApiResponse } from '@/types'

export const aiApi = {
  chat: (content: string) => request.post<unknown, ApiResponse<unknown>>('/ai/chat', { content })
}
