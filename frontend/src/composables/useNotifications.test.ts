import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useNotifications, upsertRealtimeNotification } from './useNotifications'
import type { TreeholeNotification } from '@/types'

const api = vi.hoisted(() => ({
  getUnreadCount: vi.fn(),
  getNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn()
}))

vi.mock('@/api', () => ({
  notificationApi: api
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    warning: vi.fn()
  }
}))

function notification(id: number, read = false): TreeholeNotification {
  return {
    id,
    type: 'MESSAGE_COMMENTED',
    targetType: 'COMMENT',
    messageId: 10,
    commentId: id,
    title: `n-${id}`,
    read
  }
}

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts realtime notifications once and tracks unread count', () => {
    const state = useNotifications()

    state.handleRealtimeNotification(notification(1))
    state.handleRealtimeNotification(notification(1))
    state.handleRealtimeNotification(notification(2, true))

    expect(state.notifications.value.map(item => item.id)).toEqual([2, 1])
    expect(state.unreadCount.value).toBe(1)
    expect(state.total.value).toBe(2)
  })

  it('loads unread count and first page', async () => {
    api.getUnreadCount.mockResolvedValue({ data: { unreadCount: 4 } })
    api.getNotifications.mockResolvedValue({
      data: { records: [notification(1)], total: 1, current: 1 }
    })
    const state = useNotifications()

    await state.fetchUnreadCount()
    await state.openCenter()

    expect(state.unreadCount.value).toBe(4)
    expect(state.visible.value).toBe(true)
    expect(state.notifications.value).toHaveLength(1)
  })

  it('marks one and all notifications read with local state updates', async () => {
    api.markNotificationRead.mockResolvedValue({})
    api.markAllNotificationsRead.mockResolvedValue({})
    const state = useNotifications()
    state.handleRealtimeNotification(notification(1))
    state.handleRealtimeNotification(notification(2))

    await state.markRead(1)
    expect(state.notifications.value.find(item => item.id === 1)?.read).toBe(true)
    expect(state.unreadCount.value).toBe(1)

    await state.markAllRead()
    expect(state.notifications.value.every(item => item.read)).toBe(true)
    expect(state.unreadCount.value).toBe(0)
  })

  it('rolls back single read state when request fails', async () => {
    api.markNotificationRead.mockRejectedValue(new Error('fail'))
    const state = useNotifications()
    state.handleRealtimeNotification(notification(1))

    await expect(state.markRead(1)).rejects.toThrow('mark notification read failed')

    expect(state.notifications.value[0].read).toBe(false)
    expect(state.unreadCount.value).toBe(1)
  })

  it('keeps existing list when realtime notification is duplicate', () => {
    const first = notification(1)
    const result = upsertRealtimeNotification([first], first)

    expect(result.inserted).toBe(false)
    expect(result.list).toEqual([first])
  })
})
