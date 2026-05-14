import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import api, { CMT_TOKEN_KEY, getOnlineStats, getToken, getTrendingTags, MSG_TOKEN_KEY } from '@/api'
import { offlineQueue } from '@/utils/offlineQueue'
import { ACTIVITY_EVENTS, ACTIVITY_MODULES } from '@/constants/activityEvents'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { getJson, setJson } from '@/utils/storage'

export function useFeedMessages({
  form,
  imageFile,
  isConfessionMode,
  isOnline,
  recordedBlob,
  maskedAudioBlob,
  clearImage,
  clearAudio,
  appStore,
  emit,
  isAdmin,
  activity
}) {
  const messages = ref([])
  const pageNum = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const trendingTags = ref([])
  const activeTag = ref('')
  const publishing = ref(false)
  const onlineCount = ref(0)
  const onlineModules = ref({})

  const likedIds = reactive(new Set(getJson(STORAGE_KEYS.likes, [])))
  watch(likedIds, (val) => setJson(STORAGE_KEYS.likes, [...val]), { deep: true })

  const readIds = ref(new Set(getJson(STORAGE_KEYS.readMessages, [])))
  const markAsRead = (id) => {
    readIds.value.add(id)
    setJson(STORAGE_KEYS.readMessages, [...readIds.value])
  }

  async function fetchTrending() {
    try {
      const res = await getTrendingTags(12)
      trendingTags.value = res.data || []
    } catch {}
  }

  async function fetchOnlineStats() {
    try {
      const res = await getOnlineStats()
      onlineCount.value = Number(res.data?.online || 0)
      onlineModules.value = res.data?.modules || {}
    } catch {}
  }

  async function fetchMessages() {
    try {
      const res = activeTag.value
        ? await api.getMessagesByTag(activeTag.value, pageNum.value, pageSize.value)
        : await api.getMessages(pageNum.value, pageSize.value)
      messages.value = (res.data.records || []).map(m => ({
        ...m,
        _showComments: false,
        _comments: [],
        _commentText: '',
        _commentImage: null,
        _replyToId: null,
        _commenting: false,
        _read: readIds.value.has(m.id),
        coFrequency: m.commentCount > 5 || m.coFrequency
      }))
      total.value = Number(res.data.total)
      if (total.value === 0 && pageNum.value === 1 && !activeTag.value) {
        ElNotification({
          title: '星空巡检',
          message: '当前树洞空空如也，快去留下第一句心声吧 🌌',
          type: 'info',
          position: 'bottom-left'
        })
      }
    } catch {}
  }

  function saveToOfflineQueue() {
    offlineQueue.push({ ...form, messageType: isConfessionMode.value ? 'confession' : 'normal' })
    form.content = ''
    clearImage()
    clearAudio()
  }

  async function publishMessage() {
    if (!form.content.trim() && !imageFile.value && !recordedBlob.value) return
    if (!isOnline.value) {
      saveToOfflineQueue()
      return
    }
    publishing.value = true

    const localContent = form.content
    const localAlias = form.authorAlias
    const localMood = form.mood
    const localTheme = form.theme
    const localMessageType = isConfessionMode.value ? 'confession' : 'normal'
    const optimisticMessage = {
      id: Date.now(),
      content: localContent,
      authorAlias: localAlias || '访客',
      mood: localMood,
      theme: localTheme,
      messageType: localMessageType,
      expiresAt: localMessageType === 'confession' ? new Date(Date.now() + 86400000).toISOString() : null,
      witnessCount: 0,
      witnessedByMe: false,
      confessorReply: '',
      imageUrl: '',
      audioUrl: '',
      likes: 0,
      commentCount: 0,
      createTime: new Date().toISOString(),
      isOwner: true,
      isOptimistic: true,
      _showComments: false,
      _comments: [],
      _commentText: '',
      _commentImage: null,
      _replyToId: null,
      _commenting: false,
      _read: false
    }

    try {
      let imageUrl = ''
      let audioUrl = ''
      if (imageFile.value) {
        const fd = new FormData()
        fd.append('file', imageFile.value)
        imageUrl = (await api.uploadFile(fd)).data
      }
      if (maskedAudioBlob.value) {
        const fd = new FormData()
        const ext = maskedAudioBlob.value.type.includes('webm') ? 'webm' : 'wav'
        fd.append('file', maskedAudioBlob.value, `voice.${ext}`)
        audioUrl = (await api.uploadFile(fd)).data
      }

      optimisticMessage.imageUrl = imageUrl
      optimisticMessage.audioUrl = audioUrl

      const res = await api.publishMessage({ ...form, imageUrl, audioUrl, messageType: localMessageType })
      if (res && res.code === 202) return

      const serverMessage = res?.data?.message
      const normalizedServerMessage = serverMessage ? {
        ...serverMessage,
        isOwner: true,
        _showComments: false,
        _comments: [],
        _commentText: '',
        _commentImage: null,
        _replyToId: null,
        _commenting: false,
        _read: false
      } : null

      ElMessage.success(localMessageType === 'confession' ? '告解已投入烛光 🕯️ (获得 10 ⚡)' : '留言已投入星空 🌌 (获得 10 ⚡)')
      appStore.addEnergy(10)
      emit('publish-success', normalizedServerMessage || optimisticMessage)

      pageNum.value = 1
      const feedBase = messages.value.filter(m => !m.isOptimistic)
      const hasServerMessage = normalizedServerMessage?.id && feedBase.some(m => m.id === normalizedServerMessage.id)
      if (!hasServerMessage) {
        messages.value = [normalizedServerMessage || optimisticMessage, ...feedBase].slice(0, pageSize.value)
        total.value++
      } else {
        messages.value = feedBase
      }

      form.content = ''
      clearImage()
      clearAudio()
      isConfessionMode.value = false
      setTimeout(() => {
        fetchMessages()
        fetchTrending()
      }, 3000)
    } catch {
      if (!navigator.onLine) saveToOfflineQueue()
    } finally {
      publishing.value = false
    }
  }

  function handlePublishButtonClick(isMidnight) {
    if (isMidnight && !isConfessionMode.value) {
      isConfessionMode.value = true
      return
    }
    publishMessage()
  }

  async function likeMessage(msg) {
    if (likedIds.has(msg.id)) {
      ElMessage.info('已经点过赞啦 ❤️')
      return
    }
    try {
      await api.likeMessage(msg.id)
      activity.track(ACTIVITY_EVENTS.likeMessage)
      likedIds.add(msg.id)
      msg.likes = (msg.likes || 0) + 1
      ElMessage.success('产生共鸣 ✨ (获得 2 ⚡)')
      appStore.addEnergy(2)
    } catch {}
  }

  async function toggleComments(msg) {
    msg._showComments = !msg._showComments
    if (msg._showComments) {
      activity.setModule(ACTIVITY_MODULES.comments)
      activity.track(ACTIVITY_EVENTS.openComments, ACTIVITY_MODULES.comments)
      msg._read = true
      markAsRead(msg.id)
      try {
        const res = await api.getComments(msg.id)
        msg._comments = res.data || []
        if (msg._comments.some(c => c.coFrequency)) msg.coFrequency = true
      } catch {}
    } else {
      activity.setModule(activity.resolveModule())
    }
  }

  async function publishComment(msg) {
    if (!msg._commentText.trim() && !msg._commentImage) return
    msg._commenting = true
    try {
      await api.publishComment({
        messageId: msg.id,
        content: msg._commentText.trim(),
        imageUrl: msg._commentImage,
        parentId: msg._replyToId || null
      })
      const cmtRes = await api.getComments(msg.id)
      msg._comments = [...(cmtRes.data || [])]
      msg.commentCount = (msg.commentCount || 0) + 1
      msg._commentText = ''
      msg._commentImage = null
      msg._replyToId = null
      if (msg._comments.some(c => c.coFrequency)) msg.coFrequency = true
      activity.track(ACTIVITY_EVENTS.publishComment, ACTIVITY_MODULES.comments)
      ElMessage.success('评论已送达 ✨ (获得 5 ⚡)')
      appStore.addEnergy(5)
    } catch {} finally {
      msg._commenting = false
    }
  }

  async function deleteMessage(msg) {
    if (!msg.isOwner && !getToken(MSG_TOKEN_KEY, msg.id) && !isAdmin.value) {
      ElMessage.warning('你没有删除权限')
      return
    }
    try {
      await ElMessageBox.confirm('确定要删除这条树洞吗？', '提示', { type: 'warning' })
      await api.deleteMessage(msg.id)
      ElMessage.success('已删除')
      fetchMessages()
    } catch {}
  }

  async function handleDeleteComment({ msg, comment }) {
    if (!comment.isOwner && !getToken(CMT_TOKEN_KEY, comment.id) && !isAdmin.value) {
      ElMessage.warning('你没有删除权限')
      return
    }
    try {
      await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', { type: 'warning' })
      await api.deleteComment(comment.id)
      ElMessage.success('评论已删除')
      const res = await api.getComments(msg.id)
      msg._comments = res.data || []
      msg.commentCount = Math.max(0, msg.commentCount - 1)
    } catch {}
  }

  function handleTagClick(tag) {
    activeTag.value = tag
    pageNum.value = 1
    fetchMessages()
  }

  function clearTagFilter() {
    activeTag.value = ''
    pageNum.value = 1
    fetchMessages()
  }

  function handlePageChange(page) {
    pageNum.value = page
    fetchMessages()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return {
    messages,
    pageNum,
    pageSize,
    total,
    totalPages,
    trendingTags,
    activeTag,
    publishing,
    onlineCount,
    onlineModules,
    likedIds,
    fetchTrending,
    fetchOnlineStats,
    fetchMessages,
    saveToOfflineQueue,
    publishMessage,
    handlePublishButtonClick,
    likeMessage,
    toggleComments,
    publishComment,
    deleteMessage,
    handleDeleteComment,
    handleTagClick,
    clearTagFilter,
    handlePageChange
  }
}
