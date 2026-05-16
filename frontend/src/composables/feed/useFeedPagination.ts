import { computed, ref } from 'vue'
import { ElNotification } from 'element-plus'
import api, { getOnlineStats, getTrendingTags } from '@/api'
import { scrollToTop } from '@/utils/browser'
import { createFeedMessageState } from '@/composables/feed/feedMessageState'
import type { FeedMessage, Id, Message, OnlineStats, TrendingTag } from '@/types'

interface UseFeedPaginationOptions {
  readIds: { value: Set<Id> }
}

export function normalizeFeedMessage(message: Message, readIds: Set<Id>): FeedMessage {
  return createFeedMessageState(message, { readIds })
}

export function useFeedPagination({ readIds }: UseFeedPaginationOptions) {
  const messages = ref<FeedMessage[]>([])
  const pageNum = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const trendingTags = ref<TrendingTag[]>([])
  const activeTag = ref('')
  const onlineCount = ref(0)
  const onlineModules = ref<Record<string, number>>({})

  async function fetchTrending() {
    try {
      const res = await getTrendingTags(12)
      trendingTags.value = res.data || []
    } catch {}
  }

  async function fetchOnlineStats() {
    try {
      const res = await getOnlineStats()
      const data = res.data as OnlineStats | undefined
      onlineCount.value = Number(data?.online || 0)
      onlineModules.value = data?.modules || {}
    } catch {}
  }

  async function fetchMessages() {
    try {
      const res = activeTag.value
        ? await api.getMessagesByTag(activeTag.value, pageNum.value, pageSize.value)
        : await api.getMessages(pageNum.value, pageSize.value)
      messages.value = (res.data.records || []).map(message => normalizeFeedMessage(message, readIds.value))
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

  function handleTagClick(tag: string) {
    activeTag.value = tag
    pageNum.value = 1
    fetchMessages()
  }

  function clearTagFilter() {
    activeTag.value = ''
    pageNum.value = 1
    fetchMessages()
  }

  function handlePageChange(page: number) {
    pageNum.value = page
    fetchMessages()
    scrollToTop()
  }

  return {
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
  }
}
