import { reactive, ref, watch } from 'vue'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { getJson, setJson } from '@/utils/storage'
import { useCommentActions } from '@/composables/feed/useCommentActions'
import { useFeedPagination } from '@/composables/feed/useFeedPagination'
import { useMessagePublishing } from '@/composables/feed/useMessagePublishing'

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
  const likedIds = reactive(new Set(getJson(STORAGE_KEYS.likes, [])))
  watch(likedIds, (val) => setJson(STORAGE_KEYS.likes, [...val]), { deep: true })

  const readIds = ref(new Set(getJson(STORAGE_KEYS.readMessages, [])))
  const markAsRead = (id) => {
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
    activeTag,
    onlineCount,
    onlineModules,
    fetchTrending,
    fetchOnlineStats,
    fetchMessages,
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
    activeTag,
    publishing: publishingApi.publishing,
    onlineCount,
    onlineModules,
    likedIds,
    fetchTrending,
    fetchOnlineStats,
    fetchMessages,
    saveToOfflineQueue: publishingApi.saveToOfflineQueue,
    publishMessage: publishingApi.publishMessage,
    handlePublishButtonClick: publishingApi.handlePublishButtonClick,
    likeMessage: commentActions.likeMessage,
    toggleComments: commentActions.toggleComments,
    publishComment: commentActions.publishComment,
    deleteMessage: commentActions.deleteMessage,
    handleDeleteComment: commentActions.handleDeleteComment,
    handleTagClick,
    clearTagFilter,
    handlePageChange
  }
}
