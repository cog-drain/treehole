import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 20000 
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
    if (res.code !== undefined && res.code !== 200 && res.code !== 0) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    return res
  },
  error => {
    if (!window.navigator.onLine || error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      // 离线处理逻辑交由具体模块或全局 UI 处理
    } else {
      const res = error.response && error.response.data
      if (res && res.msg) {
        ElMessage.error(res.msg)
      } else {
        ElMessage.error('服务响应异常')
      }
    }
    return Promise.reject(error)
  }
)

export default request
