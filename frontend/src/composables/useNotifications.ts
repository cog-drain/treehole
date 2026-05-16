import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { notificationApi } from '@/api'
import type { Id, TreeholeNotification } from '@/types'

const DEFAULT_PAGE_SIZE = 20

export function badgeLabel(count: number): string {
  return count > 99 ? '99+' : String(Math.max(0, count))
}

export function upsertRealtimeNotification(
  list: TreeholeNotification[],
  notification: TreeholeNotification
): { list: TreeholeNotification[]; inserted: boolean } {
  if (list.some(item => item.id === notification.id)) return { list, inserted: false }
  return { list: [notification, ...list], inserted: true }
}

export function countUnreadDelta(notification: TreeholeNotification): number {
  return notification.read ? 0 : 1
}

export function useNotifications() {
  const notifications = ref<TreeholeNotification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const loadingMore = ref(false)
  const pageNum = ref(1)
  const pageSize = ref(DEFAULT_PAGE_SIZE)
  const total = ref(0)
  const visible = ref(false)
  const error = ref('')

  const hasMore = computed(() => notifications.value.length < total.value)
  const unreadBadge = computed(() => badgeLabel(unreadCount.value))

  async function fetchUnreadCount() {
    try {
      const res = await notificationApi.getUnreadCount()
      unreadCount.value = Number(res.data?.unreadCount || 0)
    } catch {
      error.value = '未能刷新未读通知'
    }
  }

  async function fetchFirstPage() {
    loading.value = true
    error.value = ''
    try {
      const res = await notificationApi.getNotifications({
        pageNum: 1,
        pageSize: pageSize.value,
        unreadOnly: false
      })
      notifications.value = res.data.records || res.data.list || []
      pageNum.value = Number(res.data.current || 1)
      total.value = Number(res.data.total || notifications.value.length)
    } catch {
      error.value = '通知暂时无法打开'
      ElMessage.warning('通知暂时无法打开，请稍后再试')
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (loadingMore.value || loading.value || !hasMore.value) return
    loadingMore.value = true
    error.value = ''
    const nextPage = pageNum.value + 1
    try {
      const res = await notificationApi.getNotifications({
        pageNum: nextPage,
        pageSize: pageSize.value,
        unreadOnly: false
      })
      const incoming = res.data.records || res.data.list || []
      const existingIds = new Set(notifications.value.map(item => item.id))
      notifications.value = [
        ...notifications.value,
        ...incoming.filter(item => !existingIds.has(item.id))
      ]
      pageNum.value = Number(res.data.current || nextPage)
      total.value = Number(res.data.total || notifications.value.length)
    } catch {
      error.value = '加载更多通知失败'
      ElMessage.warning('加载更多通知失败')
    } finally {
      loadingMore.value = false
    }
  }

  async function openCenter() {
    visible.value = true
    await fetchFirstPage()
  }

  function closeCenter() {
    visible.value = false
  }

  function handleRealtimeNotification(notification: TreeholeNotification) {
    const result = upsertRealtimeNotification(notifications.value, notification)
    notifications.value = result.list
    if (result.inserted) {
      total.value += 1
      unreadCount.value += countUnreadDelta(notification)
    }
  }

  async function markRead(id: Id) {
    const target = notifications.value.find(item => item.id === id)
    const wasUnread = Boolean(target && !target.read)
    if (target) target.read = true
    if (wasUnread) unreadCount.value = Math.max(0, unreadCount.value - 1)

    try {
      await notificationApi.markNotificationRead(id)
    } catch {
      if (target) target.read = false
      if (wasUnread) unreadCount.value += 1
      ElMessage.warning('标记已读失败，请稍后再试')
      throw new Error('mark notification read failed')
    }
  }

  async function markAllRead() {
    const previous = notifications.value.map(item => ({ id: item.id, read: item.read }))
    const previousUnread = unreadCount.value
    notifications.value.forEach(item => { item.read = true })
    unreadCount.value = 0

    try {
      await notificationApi.markAllNotificationsRead()
    } catch {
      previous.forEach(snapshot => {
        const target = notifications.value.find(item => item.id === snapshot.id)
        if (target) target.read = snapshot.read
      })
      unreadCount.value = previousUnread
      ElMessage.warning('全部标记已读失败，请稍后再试')
      throw new Error('mark all notifications read failed')
    }
  }

  return {
    notifications,
    unreadCount,
    unreadBadge,
    loading,
    loadingMore,
    pageNum,
    pageSize,
    total,
    hasMore,
    visible,
    error,
    fetchUnreadCount,
    fetchFirstPage,
    loadMore,
    openCenter,
    closeCenter,
    handleRealtimeNotification,
    markRead,
    markAllRead
  }
}
