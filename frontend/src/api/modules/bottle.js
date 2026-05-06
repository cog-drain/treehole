import request from '../request'

export const bottleApi = {
  // 扔出一个瓶子
  throwBottle: (data) => request.post('/bottles', data),

  // 获取我的瓶子列表
  getMyBottles: () => request.get('/bottles/my'),

  // 捞起一个瓶子
  pickBottle: () => request.get('/bottles/pick'),

  // 回复瓶子 (建立回响)
  replyBottle: (id, content, replyAuthorAlias) => 
    request.post(`/bottles/${id}/replies`, { content, replyAuthorAlias }),

  // 扔回大海 (放弃持有)
  returnBottle: (id) => request.delete(`/bottles/${id}`)
}
