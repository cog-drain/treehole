import { computed, ref } from 'vue'
import { toast } from '@/services/toast'
import { buildCommentThreads } from '@/utils/commentThreads'
import { normalizeMessageSkin } from '@/utils/messageSkins'

export function useHomeFeedController({
  uiStore,
  userStore,
  api,
  getTrendingTags,
  getMessagesByTag,
  appStore,
  emit
}) {
  const messages = ref([])
  const pageNum = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const trendingTags = ref([])
  const activeTag = ref('')

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

  function normalizeMessage(rawMessage, readIds) {
    return {
      ...rawMessage,
      skin: normalizeMessageSkin(rawMessage.theme || rawMessage.skin, uiStore.colorMode),
      _showComments: false,
      _comments: [],
      _commentText: '',
      _commentImage: null,
      _replyToId: null,
      _commenting: false,
      _read: readIds.value.has(rawMessage.id),
      coFrequency: rawMessage.commentCount > 5 || rawMessage.coFrequency
    }
  }

  async function fetchTrending() {
    try {
      const response = await getTrendingTags(12)
      trendingTags.value = response.data || []
    } catch {}
  }

  async function fetchMessages(readIds) {
    try {
      const response = activeTag.value
        ? await getMessagesByTag(activeTag.value, pageNum.value, pageSize.value)
        : await api.getMessages(pageNum.value, pageSize.value)
      messages.value = (response.data.records || []).map(message => normalizeMessage(message, readIds))
      total.value = Number(response.data.total)
      if (total.value === 0 && pageNum.value === 1 && !activeTag.value) {
        toast.info({ title: '星空巡检', message: '当前树洞空空如也，快去留下第一句心声吧 🌌' })
      }
    } catch {}
  }

  async function likeMessage(message, likedIds) {
    if (likedIds.value.has(message.id)) {
      toast.info('已经点过赞啦 ❤️')
      return
    }

    try {
      await api.put(`/message/like/${message.id}`)
      likedIds.value = new Set([...likedIds.value, message.id])
      message.likes = (message.likes || 0) + 1
      toast.success('产生共鸣 ✨ (获得 2 ⚡)')
      appStore.addEnergy(2)
    } catch {}
  }

  async function toggleComments(message, readIds, markAsRead) {
    message._showComments = !message._showComments
    if (!message._showComments) return

    message._read = true
    markAsRead(message.id)
    try {
      const response = await api.getComments(message.id)
      message._comments = response.data || []
      if (message._comments.some(comment => comment.coFrequency)) {
        message.coFrequency = true
      }
    } catch {}
  }

  async function publishComment(message) {
    if (!message._commentText.trim() && !message._commentImage) return
    message._commenting = true
    try {
      await api.publishComment({
        messageId: message.id,
        content: message._commentText.trim(),
        imageUrl: message._commentImage,
        parentId: message._replyToId || null
      })
      const response = await api.getComments(message.id)
      message._comments = [...(response.data || [])]
      message.commentCount = (message.commentCount || 0) + 1
      message._commentText = ''
      message._commentImage = null
      message._replyToId = null
      if (message._comments.some(comment => comment.coFrequency)) {
        message.coFrequency = true
      }
      toast.success('评论已送达 ✨ (获得 5 ⚡)')
      appStore.addEnergy(5)
    } catch {} finally {
      message._commenting = false
    }
  }

  async function reactToComment({ comment, emoji }) {
    try {
      await api.reactToComment(comment.id, emoji)
    } catch {}
  }

  async function deleteMessage(message, isAdmin, getToken, MSG_TOKEN_KEY) {
    if (!message.isOwner && !getToken(MSG_TOKEN_KEY, message.id) && !isAdmin.value) {
      toast.warning('你没有删除权限')
      return
    }

    try {
      await emit('confirm-delete-message', message)
    } catch {}
  }

  async function handleDeleteComment({ message, comment }, isAdmin, getToken, CMT_TOKEN_KEY) {
    if (!comment.isOwner && !getToken(CMT_TOKEN_KEY, comment.id) && !isAdmin.value) {
      toast.warning('你没有删除权限')
      return
    }

    try {
      await emit('confirm-delete-comment', { message, comment })
    } catch {}
  }

  function handleTagClick(tag) {
    activeTag.value = tag
    pageNum.value = 1
  }

  function clearTagFilter() {
    activeTag.value = ''
    pageNum.value = 1
  }

  function handlePageChange(page) {
    pageNum.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function applyNewMessage(data) {
    const newMessage = {
      ...data,
      isOwner: data.userId === userStore.userId,
      skin: normalizeMessageSkin(data.theme || data.skin, uiStore.colorMode),
      _showComments: false,
      _comments: [],
      _commentText: '',
      _commentImage: null,
      _replyToId: null,
      _commenting: false,
      _read: false
    }

    messages.value = messages.value.filter(message => !message.isOptimistic)
    if (messages.value.some(message => message.id === newMessage.id)) return

    if (pageNum.value === 1) {
      messages.value = [newMessage, ...messages.value.slice(0, pageSize.value - 1)]
      emit('new-broadcast', newMessage)
    }

    if (data.userId !== userStore.userId) {
      toast.success({ message: '星空中传来了新的回响...', duration: 2000 })
    }

    total.value++
  }

  function applyNewComment(data) {
    const target = messages.value.find(message => message.id === data.messageId)
    if (target && !target._comments?.some(comment => comment.id === data.id)) {
      target._comments = [...(target._comments || []), { ...data, isOwner: data.userId === userStore.userId }]
      target.commentCount++
      if (target.commentCount === 5 || target.commentCount === 10) {
        emit('resonance-boom')
      }
    }
  }

  function applyReactionUpdate(type, data) {
    const target = messages.value.find(message => message.id === data.messageId)
    if (!target) return

    if (type === 'COMMENT_REACTION_UPDATE') {
      const comment = target._comments?.find(item => item.id === data.commentId)
      if (comment) comment.reactions = data.reactions
      return
    }

    target.reactions = data.reactions
  }

  return {
    messages,
    pageNum,
    pageSize,
    total,
    totalPages,
    trendingTags,
    activeTag,
    fetchTrending,
    fetchMessages,
    likeMessage,
    toggleComments,
    publishComment,
    reactToComment,
    deleteMessage,
    handleDeleteComment,
    handleTagClick,
    clearTagFilter,
    handlePageChange,
    applyNewMessage,
    applyNewComment,
    applyReactionUpdate,
    normalizeMessage
  }
}
