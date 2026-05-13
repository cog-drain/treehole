import request from '../request'

export const aiApi = {
  chat: (content) => request.post('/ai/chat', { content })
}
