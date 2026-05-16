import { reactive, ref, watch } from 'vue'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { getJson, setJson } from '@/utils/storage'
import { useCommentActions } from '@/composables/feed/useCommentActions'
import { useFeedPagination } from '@/composables/feed/useFeedPagination'
import { useMessagePublishing } from '@/composables/feed/useMessagePublishing'
import type { ComposeFormDraft, FeedMessage, Id } from '@/types'

interface UseFeedMessagesOptions {
  form: ComposeFormDraft
  imageFile: { value: File | null }
  isConfessionMode: { value: boolean }
  isOnline: { value: boolean }
  recordedBlob: { value: Blob | null }
  maskedAudioBlob: { value: Blob | null }
  clearImage: () => void
  clearAudio: () => void
  appStore: { addEnergy: (amount: number) => void }
  emit: (event: 'publish-success', payload: FeedMessage | Record<string, unknown>) => void
  isAdmin: { value: boolean }
  activity: {
    setModule: (module: string) => void
    track: (event: string, module?: string) => void
    resolveModule: () => string
  }
}

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
}: UseFeedMessagesOptions) {
  const likedIds = reactive(new Set<Id>(getJson<Id[]>(STORAGE_KEYS.likes, [])))
  watch(likedIds, (val) => setJson(STORAGE_KEYS.likes, [...val]), { deep: true })

  const readIds = ref(new Set<Id>(getJson<Id[]>(STORAGE_KEYS.readMessages, [])))
  const markAsRead = (id: Id) => {
    readIds.value.add(id)
    setJson(STORAGE_KEYS.readMessages, [...readIds.value])
  }

  const pagination = useFeedPagination({ readIds })
  const {
    messages,
    pageNum,
    pageSize,
    total,
    totalPages,
    trendingTags,
    tagSubscriptions,
    subscribedTagIds,
    activeTag,
    onlineCount,
    onlineModules,
    fetchTrending,
    fetchTagSubscriptions,
    fetchOnlineStats,
    fetchMessages,
    locateMessageById,
    handleTagClick,
    clearTagFilter,
    handlePageChange
  } = pagination

  const publishingApi = useMessagePublishing({
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
  })

  const commentActions = useCommentActions({
    likedIds,
    markAsRead,
    isAdmin,
    appStore,
    activity,
    fetchMessages
  })

  return {
    messages,
    pageNum,
    pageSize,
    total,
    totalPages,
    trendingTags,
    tagSubscriptions,
    subscribedTagIds,
    activeTag,
    publishing: publishingApi.publishing,
    onlineCount,
    onlineModules,
    likedIds,
    fetchTrending,
    fetchTagSubscriptions,
    fetchOnlineStats,
    fetchMessages,
    locateMessageById,
    saveToOfflineQueue: publishingApi.saveToOfflineQueue,
    publishMessage: publishingApi.publishMessage,
    handlePublishButtonClick: publishingApi.handlePublishButtonClick,
    likeMessage: commentActions.likeMessage,
    toggleComments: commentActions.toggleComments,
    publishComment: commentActions.publishComment,
    deleteMessage: commentActions.deleteMessage,
    handleDeleteComment: commentActions.handleDeleteComment,
    handleTagClick,
    toggleTagSubscription: pagination.toggleTagSubscription,
    clearTagFilter,
    handlePageChange
  }
}
