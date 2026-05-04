import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  // 生产环境自适应：使用相对路径，让 Nginx 处理转发
  baseURL: '/api',
  timeout: 20000 // 增加超时时间以支持大文件上传
})

/** 获取或初始化本地身份 (MVP 方案) */
export function getUserIdentity() {
  let identity = null
  try {
    identity = JSON.parse(localStorage.getItem('treehole_identity'))
  } catch (e) {
    identity = null
  }

  if (!identity || !identity.userId) {
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    identity = {
      userId: newId,
      createdAt: Date.now()
    }
    localStorage.setItem('treehole_identity', JSON.stringify(identity))
  }
  return identity
}

/** 兼容旧逻辑：获取 userId 作为 Token */
export function getUserToken() {
  return getUserIdentity().userId
}

// 请求拦截器
request.interceptors.request.use(
  config => {
    const identity = getUserIdentity()
    config.headers['X-User-Id'] = identity.userId
    
    if (!config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${identity.userId}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    console.log(`[API Response] ${response.config.url}:`, res) // 探测器：打印所有后端返回
    if (res.code && res.code !== 200) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    return res
  },
  error => {
    const res = error.response && error.response.data
    if (res && res.msg) {
      ElMessage.error(res.msg)
    } else {
      ElMessage.error('网络异常，请稍后重试')
    }
    return Promise.reject(error)
  }
)

// export default request

// ── localStorage Token 管理工具 ──
const MSG_TOKEN_KEY = 'treehole_msg_tokens'
const CMT_TOKEN_KEY = 'treehole_cmt_tokens'

function loadTokenMap(storageKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}')
  } catch { return {} }
}

// 将业务方法挂载到 request 实例上，确保 api.get() 和 api.getMessages() 同时可用
const api = Object.assign(request, {
  publishMessage: (data) => request.post('/message', data),
  getMessages: (pageNum = 1, pageSize = 10) =>
    request.get(`/message/list?pageNum=${pageNum}&pageSize=${pageSize}`),
  getMessagesByTag: (tag, pageNum = 1, pageSize = 10) =>
    request.get(`/message/listByTag?tag=${encodeURIComponent(tag)}&pageNum=${pageNum}&pageSize=${pageSize}`),
  likeMessage: (id) => request.put(`/message/like/${id}`),
  deleteMessage: (id, ownerToken) => {
    return request.delete(`/message/${id}`, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    })
  },
  getRandomMessage: () => request.get('/message/random'),
  getTrendingTags: (limit = 10) => request.get(`/tag/trending?limit=${limit}`),
  throwBottle: (data) => request.post('/bottle/throw', data),
  pickBottle: () => request.get('/bottle/pick'),
  replyBottle: (id, content, replyAuthorAlias) => request.post(`/bottle/reply/${id}`, { content, replyAuthorAlias }),
  returnBottle: (id) => request.post(`/bottle/return/${id}`),
  backupIdentity: () => request.get('/user/backup'),
  restoreIdentity: (recoveryKey) => request.post('/user/restore', { recoveryKey }),
  getUserIdentity,
  getUserToken
})

export default api

// 同时导出具名函数供部分组件解构使用
export const { 
  publishMessage, getMessages, getMessagesByTag, likeMessage, deleteMessage, 
  getRandomMessage, getTrendingTags, throwBottle, pickBottle, replyBottle, 
  returnBottle, backupIdentity, restoreIdentity 
} = api

/** 保存 Token */
export function saveToken(storageKey, id, token) {
  const map = loadTokenMap(storageKey)
  map[id] = token
  localStorage.setItem(storageKey, JSON.stringify(map))
}

/** 读取 Token */
export function getToken(storageKey, id) {
  return loadTokenMap(storageKey)[id] || null
}

/** 删除 Token */
export function removeToken(storageKey, id) {
  const map = loadTokenMap(storageKey)
  delete map[id]
  localStorage.setItem(storageKey, JSON.stringify(map))
}

/** 当前浏览器是否拥有该留言的删除权限 */
export function hasMsgToken(id) {
  return !!getToken(MSG_TOKEN_KEY, id)
}

/** 当前浏览器是否拥有该评论的删除权限 */
export function hasCmtToken(id) {
  return !!getToken(CMT_TOKEN_KEY, id)
}

export { MSG_TOKEN_KEY, CMT_TOKEN_KEY }
