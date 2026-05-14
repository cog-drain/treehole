import { ElNotification } from 'element-plus'
import { shallowRef } from 'vue'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { getJson, setJson } from '@/utils/storage'

const QUEUE_KEY = STORAGE_KEYS.offlineMessages

// 创建一个响应式的长度，供 UI 绑定
export const offlineQueueCount = shallowRef(0)

/** 离线队列管理工具 */
export const offlineQueue = {
  /** 初始化计数器 */
  init() {
    offlineQueueCount.value = this.get().length
  },

  /** 获取队列 */
  get() {
    return getJson(QUEUE_KEY, [])
  },

  /** 存入队列 */
  push(data) {
    const queue = this.get()
    // 避免重复存入相同内容
    if (queue.some(item => item.content === data.content && item.authorAlias === data.authorAlias)) {
      return
    }
    queue.push({
      ...data,
      timestamp: Date.now(),
      id: Math.random().toString(36).substring(2, 9)
    })
    setJson(QUEUE_KEY, queue)
    offlineQueueCount.value = queue.length
    
    ElNotification({
      title: '离线模式',
      message: '网络已断开，留言已暂存至本地，将在恢复后自动发送。',
      type: 'warning',
      duration: 5000
    })
  },

  /** 清空特定任务 */
  remove(id) {
    const queue = this.get().filter(item => item.id !== id)
    setJson(QUEUE_KEY, queue)
    offlineQueueCount.value = queue.length
  },

  /** 同步队列 */
  async sync(api) {
    const queue = this.get()
    if (queue.length === 0) {
      offlineQueueCount.value = 0
      return
    }
    
    offlineQueueCount.value = queue.length

    ElNotification({
      title: '同步中',
      message: `检测到网络恢复，正在尝试同步 ${queue.length} 条离线留言...`,
      type: 'info'
    })

    const remaining = []
    for (const item of queue) {
      try {
        // 剥离前端生成的临时字符串 id 和时间戳
        const { id, timestamp, ...payload } = item
        
        // 增加一个 300ms 的微小延迟，防止网络刚恢复时的瞬时拥堵
        await new Promise(resolve => setTimeout(resolve, 300))
        
        await api.publishMessage(payload)
      } catch (err) {
        console.error('Offline sync failed for item:', item, err)
        // 如果还是失败（比如后端挂了而非网络问题），则保留在队列中
        remaining.push(item)
      }
    }

    setJson(QUEUE_KEY, remaining)
    offlineQueueCount.value = remaining.length

    if (remaining.length === 0) {
      ElNotification({
        title: '同步成功',
        message: '所有离线留言已成功投入树洞！',
        type: 'success'
      })
      // 依赖 WebSocket 接收同步成功的新消息，无需刷新页面
    } else {
      ElNotification({
        title: '同步部分失败',
        message: '部分留言未能同步，请检查服务器状态。',
        type: 'error'
      })
    }
  }
}
