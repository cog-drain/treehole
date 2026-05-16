import { computed, ref } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import api, { getOnlineStats, getTrendingTags } from '@/api'
import { scrollToTop } from '@/utils/browser'
import { createFeedMessageState } from '@/composables/feed/feedMessageState'
import type { FeedMessage, Id, Message, OnlineStats, TagSubscription, TrendingTag } from '@/types'

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
  const tagSubscriptions = ref<TagSubscription[]>([])
  const subscribedTagIds = computed(() => new Set(tagSubscriptions.value.map(item => String(item.tagId))))
  const activeTag = ref('')
  const onlineCount = ref(0)
  const onlineModules = ref<Record<string, number>>({})

  async function fetchTrending() {
    try {
      const res = await getTrendingTags(12)
      trendingTags.value = res.data || []
    } catch {}
  }

  async function fetchTagSubscriptions() {
    try {
      const res = await api.getTagSubscriptions()
      tagSubscriptions.value = res.data || []
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

  async function locateMessageById(messageId: Id): Promise<FeedMessage> {
    const existing = messages.value.find(message => String(message.id) === String(messageId))
    if (existing) return existing

    const res = await api.getMessageById(messageId)
    const target = normalizeFeedMessage(res.data, readIds.value)
    messages.value = [target, ...messages.value.filter(message => String(message.id) !== String(messageId))]
    total.value = Math.max(total.value, messages.value.length)
    return target
  }

  function handleTagClick(tag: string) {
    activeTag.value = tag
    pageNum.value = 1
    fetchMessages()
  }

  async function toggleTagSubscription(tag: TrendingTag) {
    if (!tag.id) return
    const tagId = tag.id
    const wasSubscribed = subscribedTagIds.value.has(String(tagId))
    try {
      if (wasSubscribed) {
        await api.unsubscribeTag(tagId)
        tagSubscriptions.value = tagSubscriptions.value.filter(item => String(item.tagId) !== String(tagId))
        ElMessage.success('已取消订阅')
      } else {
        const res = await api.subscribeTag(tagId)
        if (res.data) tagSubscriptions.value = [res.data, ...tagSubscriptions.value]
        ElMessage.success('已订阅话题')
      }
    } catch {
      ElMessage.warning('订阅状态暂时无法更新')
    }
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
    toggleTagSubscription,
    clearTagFilter,
    handlePageChange
  }
}
