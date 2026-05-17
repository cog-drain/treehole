import request from '../request'
import type {
    ApiResponse,
    Id,
    NotificationPageParams,
    PageResult,
    TreeholeNotification,
    UnreadCountResponse
} from '@/types'

export const notificationApi = {
    getNotifications: (params: NotificationPageParams = {}) =>
        request.get<unknown, ApiResponse<PageResult<TreeholeNotification>>>('/notifications', { params }),

    getUnreadCount: () => request.get<unknown, ApiResponse<UnreadCountResponse>>('/notifications/unread-count'),

    markNotificationRead: (id: Id) => request.put<unknown, ApiResponse<null>>(`/notifications/${id}/read`),

    markAllNotificationsRead: () => request.put<unknown, ApiResponse<null>>('/notifications/read-all')
}
