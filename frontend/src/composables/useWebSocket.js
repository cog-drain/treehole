/**
 * WebSocket Composable — 从 Home.vue 中提取的实时通信逻辑
 * 
 * 职责：连接管理、自动重连、消息路由
 * 通过回调 (callbacks) 将业务逻辑委托给调用方
 */
import { onUnmounted } from 'vue'
import { toast } from '@/services/toast'

export function useWebSocket(callbacks = {}) {
  let ws = null
  let reconnectTimer = null

  // 守望者消息节流
  let lastObserverMessage = ''
  let lastObserverTime = 0

  function connect(userId) {
    if (!userId) {
      console.error('WebSocket: userId is required')
      return
    }

    // 清理旧连接
    if (ws) {
      ws.onclose = null
      ws.close()
      ws = null
    }
    if (reconnectTimer) clearTimeout(reconnectTimer)

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/treehole/${userId}`
    console.log('🌌 WebSocket: Connecting to', wsUrl)

    ws = new WebSocket(wsUrl)

    ws.onmessage = (event) => {
      try {
        const { type, msg, data } = JSON.parse(event.data)

        // 漂流瓶回响
        if (msg === 'BOTTLE_REPLIED') {
          toast.success({
            title: '🌊 奇妙的回响',
            message: `你在海边投下的瓶子收到了回信：\n"${data.replyContent}"`,
            duration: 10000
          })
          return
        }

        // 消息路由
        switch (type) {
          case 'NEW_MESSAGE':
            callbacks.onNewMessage?.(data)
            break

          case 'NEW_COMMENT':
            callbacks.onNewComment?.(data)
            break

          case 'OBSERVER_MESSAGE': {
            const now = Date.now()
            if (data === lastObserverMessage && (now - lastObserverTime < 5000)) return
            lastObserverMessage = data
            lastObserverTime = now
            callbacks.onObserverMessage?.(data)
            break
          }

          case 'REACTION_UPDATE':
          case 'COMMENT_REACTION_UPDATE':
            callbacks.onReactionUpdate?.(type, data)
            break
        }
      } catch (e) {
        console.error('WebSocket: Parse error', e)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket: Disconnected, retrying in 5s...')
      reconnectTimer = setTimeout(() => connect(userId), 5000)
    }
  }

  function disconnect() {
    if (ws) {
      ws.onclose = null
      ws.close()
      ws = null
    }
    if (reconnectTimer) clearTimeout(reconnectTimer)
  }

  onUnmounted(disconnect)

  return { connect, disconnect }
}
