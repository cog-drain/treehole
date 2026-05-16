import { ElMessage, ElNotification } from 'element-plus'
import { useWebSocket } from '@/composables/useWebSocket'
import type {
  Comment,
  ConfessionWitnessPayload,
  ConfessorReplyPayload,
  FeedMessage,
  Id,
  Message,
  OnlineStats,
  ReactionUpdatePayload,
  RealtimeEventType
} from '@/types'

interface RefLike<T> {
  value: T
}

interface UserStoreLike {
  userId: string
}

interface UseHomeRealtimeOptions {
  messages: RefLike<FeedMessage[]>
  pageNum: RefLike<number>
  pageSize: RefLike<number>
  total: RefLike<number>
  userStore: UserStoreLike
  onlineCount: RefLike<number>
  onlineModules: RefLike<Record<string, number>>
  emit: (event: 'new-broadcast' | 'resonance-boom', payload?: FeedMessage) => void
}

export function normalizeRealtimeMessage(data: Message, userId: string): FeedMessage {
  return {
    ...data,
    isOwner: data.userId === userId,
    _showComments: false,
    _comments: [],
    _commentText: '',
    _commentImage: null,
    _replyToId: null,
    _commenting: false,
    _read: false
  }
}

export function insertRealtimeMessage(messages: FeedMessage[], data: Message, userId: string, pageSize: number) {
  const feedBase = messages.filter(message => !message.isOptimistic)
  if (feedBase.some(message => message.id === data.id)) {
    return { messages: feedBase, inserted: false, message: null as FeedMessage | null }
  }
  const message = normalizeRealtimeMessage(data, userId)
  return {
    messages: [message, ...feedBase.slice(0, pageSize - 1)],
    inserted: true,
    message
  }
}

export function appendRealtimeComment(messages: FeedMessage[], data: Comment, userId: string): boolean {
  const target = messages.find(message => message.id === data.messageId)
  if (!target || target._comments?.some(comment => comment.id === data.id)) return false
  target._comments = [...(target._comments || []), { ...data, isOwner: data.userId === userId }]
  target.commentCount = (target.commentCount || 0) + 1
  return true
}

export function applyRealtimeReaction(messages: FeedMessage[], type: RealtimeEventType, data: ReactionUpdatePayload): void {
  const target = messages.find(message => message.id === data.messageId)
  if (!target) return
  if (type === 'COMMENT_REACTION_UPDATE') {
    const comment = target._comments?.find(item => item.id === data.commentId)
    if (comment) comment.reactions = data.reactions
  } else {
    target.reactions = data.reactions
  }
}

export function useHomeRealtime({
  messages,
  pageNum,
  pageSize,
  total,
  userStore,
  onlineCount,
  onlineModules,
  emit
}: UseHomeRealtimeOptions) {
  let watcherInstance: ReturnType<typeof ElNotification> | null = null
  let lastWatcherMsg = ''

  function showWatcherMessage(data: string) {
    if (data === lastWatcherMsg && watcherInstance) return
    if (watcherInstance) watcherInstance.close()
    lastWatcherMsg = data
    watcherInstance = ElNotification({
      title: '树洞守望者 🛰️',
      message: data,
      duration: 10000,
      position: 'bottom-left',
      offset: 250,
      customClass: 'watcher-notification',
      onClose: () => {
        watcherInstance = null
        lastWatcherMsg = ''
      }
    })
  }

  return useWebSocket({
    onNewMessage(data: Message) {
      const result = insertRealtimeMessage(messages.value, data, userStore.userId, pageSize.value)
      if (!result.inserted) {
        messages.value = result.messages
        return
      }
      messages.value = pageNum.value === 1 ? result.messages : messages.value.filter(message => !message.isOptimistic)
      if (pageNum.value === 1 && result.inserted && result.message) {
        emit('new-broadcast', result.message)
      }
      if (data.userId !== userStore.userId) {
        ElMessage({ message: '星空中传来了新的回响...', type: 'success', plain: true, duration: 2000 })
      }
      total.value++
    },
    onNewComment(data: Comment) {
      const appended = appendRealtimeComment(messages.value, data, userStore.userId)
      if (appended) {
        const target = messages.value.find(message => message.id === data.messageId)
        if (target?.commentCount === 5 || target?.commentCount === 10) emit('resonance-boom')
      }
    },
    onObserverMessage: showWatcherMessage,
    onReactionUpdate(type: RealtimeEventType, data: ReactionUpdatePayload) {
      applyRealtimeReaction(messages.value, type, data)
    },
    onOnlineStatsUpdate(data: OnlineStats) {
      onlineCount.value = Number(data?.online || 0)
      onlineModules.value = data?.modules || onlineModules.value
    },
    onConfessorReply(data: ConfessorReplyPayload) {
      const target = messages.value.find(message => message.id === data.messageId)
      if (target) target.confessorReply = data.reply
    },
    onConfessionWitnessUpdate(data: ConfessionWitnessPayload) {
      const target = messages.value.find(message => message.id === data.messageId)
      if (target) target.witnessCount = Number(data.witnessCount || 0)
    }
  })
}
