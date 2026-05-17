import { describe, expect, it, vi } from 'vitest'
import { notificationApi } from './notification'

vi.mock('../request', () => ({
    default: {
        get: vi.fn((url: string, config?: unknown) => ({ method: 'get', url, config })),
        put: vi.fn((url: string) => ({ method: 'put', url }))
    }
}))

describe('notification api', () => {
    it('maps notification endpoints', () => {
        expect(notificationApi.getNotifications({ pageNum: 2, pageSize: 10, unreadOnly: true })).toMatchObject({
            method: 'get',
            url: '/notifications',
            config: { params: { pageNum: 2, pageSize: 10, unreadOnly: true } }
        })
        expect(notificationApi.getUnreadCount()).toMatchObject({ method: 'get', url: '/notifications/unread-count' })
        expect(notificationApi.markNotificationRead(7)).toMatchObject({ method: 'put', url: '/notifications/7/read' })
        expect(notificationApi.markAllNotificationsRead()).toMatchObject({
            method: 'put',
            url: '/notifications/read-all'
        })
    })
})
