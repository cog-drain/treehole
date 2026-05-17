import { computed, ref } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { messageApi } from '@/api/modules/message'
import { statsApi } from '@/api/modules/stats'
import { tagSubscriptionApi } from '@/api/modules/tagSubscription'
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
            const res = await messageApi.getTrendingTags(12)
            trendingTags.value = res.data || []
        } catch (error) {
            console.warn('Failed to load trending tags', error)
        }
    }

    async function fetchTagSubscriptions() {
        try {
            const res = await tagSubscriptionApi.getSubscriptions()
            tagSubscriptions.value = res.data || []
        } catch (error) {
            console.warn('Failed to load tag subscriptions', error)
        }
    }

    async function fetchOnlineStats() {
        try {
            const res = await statsApi.getOnlineStats()
            const data = res.data as OnlineStats | undefined
            onlineCount.value = Number(data?.online || 0)
            onlineModules.value = data?.modules || {}
        } catch (error) {
            console.warn('Failed to load online stats', error)
        }
    }

    async function fetchMessages() {
        try {
            const res = activeTag.value
                ? await messageApi.getMessages({
                      tag: activeTag.value,
                      pageNum: pageNum.value,
                      pageSize: pageSize.value
                  })
                : await messageApi.getMessages({ pageNum: pageNum.value, pageSize: pageSize.value })
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
        } catch (error) {
            console.warn('Failed to load messages', error)
            ElMessage.warning('留言暂时无法加载')
        }
    }

    async function locateMessageById(messageId: Id): Promise<FeedMessage> {
        const existing = messages.value.find(message => String(message.id) === String(messageId))
        if (existing) return existing

        const res = await messageApi.getMessage(messageId)
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
                await tagSubscriptionApi.unsubscribe(tagId)
                tagSubscriptions.value = tagSubscriptions.value.filter(item => String(item.tagId) !== String(tagId))
                ElMessage.success('已取消订阅')
            } else {
                const res = await tagSubscriptionApi.subscribe(tagId)
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
