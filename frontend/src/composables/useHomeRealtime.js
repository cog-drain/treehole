import { ElMessage, ElNotification } from 'element-plus'
import { useWebSocket } from '@/composables/useWebSocket'

export function useHomeRealtime({
  messages,
  pageNum,
  pageSize,
  total,
  userStore,
  onlineCount,
  onlineModules,
  emit
}) {
  let watcherInstance = null
  let lastWatcherMsg = ''

  function showWatcherMessage(data) {
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
    onNewMessage(data) {
      messages.value = messages.value.filter(m => !m.isOptimistic)
      if (messages.value.some(m => m.id === data.id)) return
      const newMsg = {
        ...data,
        isOwner: data.userId === userStore.userId,
        _showComments: false,
        _comments: [],
        _commentText: '',
        _commentImage: null,
        _replyToId: null,
        _commenting: false,
        _read: false
      }
      if (pageNum.value === 1 && !messages.value.some(m => m.id === newMsg.id)) {
        messages.value = [newMsg, ...messages.value.slice(0, pageSize.value - 1)]
        emit('new-broadcast', newMsg)
      }
      if (data.userId !== userStore.userId) {
        ElMessage({ message: '星空中传来了新的回响...', type: 'success', plain: true, duration: 2000 })
      }
      total.value++
    },
    onNewComment(data) {
      const target = messages.value.find(m => m.id === data.messageId)
      if (target && !target._comments?.some(c => c.id === data.id)) {
        target._comments = [...(target._comments || []), { ...data, isOwner: data.userId === userStore.userId }]
        target.commentCount++
        if (target.commentCount === 5 || target.commentCount === 10) emit('resonance-boom')
      }
    },
    onObserverMessage: showWatcherMessage,
    onReactionUpdate(type, data) {
      const target = messages.value.find(m => m.id === data.messageId)
      if (!target) return
      if (type === 'COMMENT_REACTION_UPDATE') {
        const comment = target._comments?.find(c => c.id === data.commentId)
        if (comment) comment.reactions = data.reactions
      } else {
        target.reactions = data.reactions
      }
    },
    onOnlineStatsUpdate(data) {
      onlineCount.value = Number(data?.online || 0)
      onlineModules.value = data?.modules || onlineModules.value
    },
    onConfessorReply(data) {
      const target = messages.value.find(m => m.id === data.messageId)
      if (target) target.confessorReply = data.reply
    },
    onConfessionWitnessUpdate(data) {
      const target = messages.value.find(m => m.id === data.messageId)
      if (target) target.witnessCount = Number(data.witnessCount || 0)
    }
  })
}
