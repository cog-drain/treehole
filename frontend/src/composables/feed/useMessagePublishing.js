import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
import { offlineQueue } from '@/utils/offlineQueue'

export function useMessagePublishing({
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
  messages,
  pageNum,
  pageSize,
  total,
  fetchMessages,
  fetchTrending
}) {
  const publishing = ref(false)

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
      const feedBase = messages.value.filter(message => !message.isOptimistic)
      const hasServerMessage = normalizedServerMessage?.id && feedBase.some(message => message.id === normalizedServerMessage.id)
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

  return {
    publishing,
    saveToOfflineQueue,
    publishMessage,
    handlePublishButtonClick
  }
}
