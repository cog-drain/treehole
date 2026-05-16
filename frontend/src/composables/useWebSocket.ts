/**
 * WebSocket Composable — 从 Home.vue 中提取的实时通信逻辑
 * 
 * 职责：连接管理、自动重连、消息路由
 * 通过回调 (callbacks) 将业务逻辑委托给调用方
 */
import { onUnmounted } from 'vue'
import { ElNotification } from 'element-plus'
import type {
  Comment,
  ConfessionWitnessPayload,
  ConfessorReplyPayload,
  Message,
  OnlineStats,
  ReactionUpdatePayload,
  RealtimeEnvelope,
  RealtimeEventType
} from '@/types'

interface BottleReplyPayload {
  replyContent?: string
}

export interface WebSocketCallbacks {
  onNewMessage?: (data: Message) => void
  onNewComment?: (data: Comment) => void
  onObserverMessage?: (data: string) => void
  onReactionUpdate?: (type: RealtimeEventType, data: ReactionUpdatePayload) => void
  onOnlineStatsUpdate?: (data: OnlineStats) => void
  onConfessorReply?: (data: ConfessorReplyPayload) => void
  onConfessionWitnessUpdate?: (data: ConfessionWitnessPayload) => void
}

const debugLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.debug(...args)
}

export function useWebSocket(callbacks: WebSocketCallbacks = {}) {
  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let currentModule = 'feed'
  const HEARTBEAT_INTERVAL = 25000

  // 守望者消息节流
  let lastObserverMessage = ''
  let lastObserverTime = 0

  function stopHeartbeat() {
    if (heartbeatTimer) {
      window.clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  function sendHeartbeat() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    try {
      ws.send(JSON.stringify({ type: 'PING', module: currentModule, ts: Date.now() }))
    } catch (e) {
      console.error('WebSocket: Heartbeat send failed', e)
    }
  }

  function sendActivity(action: string, module = currentModule) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    try {
      ws.send(JSON.stringify({ type: 'ACTIVITY', module, action, ts: Date.now() }))
    } catch (e) {
      console.error('WebSocket: Activity send failed', e)
    }
  }

  function setModule(module: string) {
    currentModule = module || 'unknown'
    sendHeartbeat()
  }

  function trackAction(action: string, module = currentModule) {
    if (!action) return
    sendActivity(action, module)
  }

  function startHeartbeat() {
    stopHeartbeat()
    sendHeartbeat()
    heartbeatTimer = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)
  }

  function connect(userId: string) {
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
    stopHeartbeat()

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/treehole/${userId}`
    debugLog('🌌 WebSocket: Connecting to', wsUrl)

    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      startHeartbeat()
    }

    ws.onmessage = (event) => {
      try {
        const { type, msg, data } = JSON.parse(event.data) as RealtimeEnvelope

        // 漂流瓶回响
        if (msg === 'BOTTLE_REPLIED') {
          const reply = data as BottleReplyPayload
          ElNotification({
            title: '🌊 奇妙的回响',
            message: `你在海边投下的瓶子收到了回信：\n"${reply.replyContent}"`,
            type: 'success',
            position: 'bottom-right',
            duration: 0,
            offset: 100,
            customClass: 'cyber-notification'
          })
          return
        }

        // 消息路由
        switch (type) {
          case 'NEW_MESSAGE':
            callbacks.onNewMessage?.(data as Message)
            break

          case 'NEW_COMMENT':
            callbacks.onNewComment?.(data as Comment)
            break

          case 'OBSERVER_MESSAGE': {
            const now = Date.now()
            const message = String(data)
            if (message === lastObserverMessage && (now - lastObserverTime < 5000)) return
            lastObserverMessage = message
            lastObserverTime = now
            callbacks.onObserverMessage?.(message)
            break
          }

          case 'REACTION_UPDATE':
          case 'COMMENT_REACTION_UPDATE':
            callbacks.onReactionUpdate?.(type, data as ReactionUpdatePayload)
            break

          case 'ONLINE_STATS_UPDATE':
            callbacks.onOnlineStatsUpdate?.(data as OnlineStats)
            break

          case 'CONFESSOR_REPLY':
            callbacks.onConfessorReply?.(data as ConfessorReplyPayload)
            break

          case 'CONFESSION_WITNESS_UPDATE':
            callbacks.onConfessionWitnessUpdate?.(data as ConfessionWitnessPayload)
            break
        }
      } catch (e) {
        console.error('WebSocket: Parse error', e)
      }
    }

    ws.onclose = () => {
      stopHeartbeat()
      debugLog('WebSocket: Disconnected, retrying in 5s...')
      reconnectTimer = window.setTimeout(() => connect(userId), 5000)
    }
  }

  function disconnect() {
    stopHeartbeat()
    if (ws) {
      ws.onclose = null
      ws.close()
      ws = null
    }
    if (reconnectTimer) clearTimeout(reconnectTimer)
  }

  onUnmounted(disconnect)

  return { connect, disconnect, setModule, trackAction }
}
