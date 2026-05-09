import { computed, reactive, watch } from 'vue'
import { toast } from '@/services/toast'
import { DEFAULT_MESSAGE_SKIN, MESSAGE_SKIN_META, normalizeMessageSkin } from '@/utils/messageSkins'

export function usePublishComposer({
  uiStore,
  userStore,
  recorder,
  offlineQueue,
  offlineQueueCount,
  uploadFile,
  publishMessageApi,
  fetchTrending,
  publishSuccess,
  afterPublish,
  pageSize,
  messages,
  total
}) {
  const form = reactive({ authorAlias: '', content: '', mood: '', skin: DEFAULT_MESSAGE_SKIN })
  const moodMap = { '开心': '😄', '难过': '😢', '愤怒': '😡', '平静': '😌', '迷茫': '🤔' }
  const imageState = reactive({ file: null, preview: '' })
  const publishingState = reactive({ publishing: false })

  const messageSkinMeta = MESSAGE_SKIN_META
  const availableSkins = computed(() => uiStore.availableMessageSkins)

  watch(() => uiStore.selectedMessageSkin, (skin) => {
    form.skin = normalizeMessageSkin(skin)
  }, { immediate: true })

  watch(() => form.authorAlias, (newVal) => {
    if (newVal) userStore.setAlias(newVal)
  }, { immediate: true })

  function syncAlias() {
    form.authorAlias = userStore.alias
  }

  function refreshIdentity() {
    userStore.refreshAlias()
    syncAlias()
  }

  function handleAliasFocus() {}

  function onImageSelect(event) {
    const file = event.target.files?.[0]
    if (!file) return
    imageState.file = file
    imageState.preview = URL.createObjectURL(file)
  }

  function clearImage() {
    imageState.file = null
    imageState.preview = ''
  }

  function handlePaste(event) {
    const items = (event.clipboardData || event.originalEvent?.clipboardData)?.items || []
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile()
        if (file) {
          imageState.file = file
          imageState.preview = URL.createObjectURL(file)
          toast.success('已从剪贴板捕获图片 📸')
        }
      }
    }
  }

  function saveToOfflineQueue() {
    offlineQueue.push({ ...form })
    resetComposer()
  }

  function resetComposer() {
    form.content = ''
    clearImage()
    recorder.clearAudio()
  }

  async function publishMessage() {
    if (!form.content.trim() && !imageState.file && !recorder.recordedBlob.value) return

    if (!navigator.onLine) {
      saveToOfflineQueue()
      return
    }

    publishingState.publishing = true

    const localContent = form.content
    const localAlias = form.authorAlias
    const localMood = form.mood
    const localSkin = form.skin

    const optimisticMessage = {
      id: Date.now(),
      content: localContent,
      authorAlias: localAlias || '访客',
      mood: localMood,
      skin: localSkin,
      theme: localSkin,
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

      if (imageState.file) {
        const formData = new FormData()
        formData.append('file', imageState.file)
        imageUrl = (await uploadFile(formData)).data
      }

      if (recorder.maskedAudioBlob.value) {
        const formData = new FormData()
        const ext = recorder.maskedAudioBlob.value.type.includes('webm') ? 'webm' : 'wav'
        formData.append('file', recorder.maskedAudioBlob.value, `voice.${ext}`)
        audioUrl = (await uploadFile(formData)).data
      }

      optimisticMessage.imageUrl = imageUrl
      optimisticMessage.audioUrl = audioUrl

      const response = await publishMessageApi({ ...form, theme: form.skin, imageUrl, audioUrl })
      if (response && response.code === 202) return

      const serverMessage = response?.data?.message
      const normalizedServerMessage = serverMessage ? {
        ...serverMessage,
        skin: normalizeMessageSkin(serverMessage.theme || serverMessage.skin),
        isOwner: true,
        _showComments: false,
        _comments: [],
        _commentText: '',
        _commentImage: null,
        _replyToId: null,
        _commenting: false,
        _read: false
      } : null

      toast.success('留言已投入星空 🌌 (获得 10 ⚡)')
      publishSuccess(normalizedServerMessage || optimisticMessage)

      const feedBase = messages.value.filter(message => !message.isOptimistic)
      const hasServerMessage = normalizedServerMessage?.id && feedBase.some(message => message.id === normalizedServerMessage.id)
      if (!hasServerMessage) {
        messages.value = [normalizedServerMessage || optimisticMessage, ...feedBase].slice(0, pageSize.value)
        total.value++
      } else {
        messages.value = feedBase
      }

      resetComposer()
      setTimeout(() => {
        fetchTrending()
        afterPublish()
      }, 3000)
    } catch (error) {
      if (!navigator.onLine) {
        saveToOfflineQueue()
      }
    } finally {
      publishingState.publishing = false
    }
  }

  return {
    form,
    moodMap,
    messageSkinMeta,
    availableSkins,
    imageFile: computed(() => imageState.file),
    imagePreview: computed(() => imageState.preview),
    publishing: computed(() => publishingState.publishing),
    offlineQueueCount,
    syncAlias,
    refreshIdentity,
    handleAliasFocus,
    onImageSelect,
    clearImage,
    handlePaste,
    saveToOfflineQueue,
    resetComposer,
    publishMessage
  }
}
