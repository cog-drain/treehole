import { computed } from 'vue'
import { useNotificationTargetNavigator } from '@/composables/useNotificationTarget'
import type { Comment, FeedMessage, Id, TreeholeNotification } from '@/types'

interface NotificationsSource {
    visible: { value: boolean }
    notifications: { value: TreeholeNotification[] }
    unreadCount: { value: number }
    unreadBadge: { value: string }
    loading: { value: boolean }
    loadingMore: { value: boolean }
    hasMore: { value: boolean }
    error: { value: string | null }
    markRead: (id: Id) => Promise<void>
    closeCenter: () => void
}

export interface HomeNotificationBindingsOptions {
    notifications: NotificationsSource
    locateMessageById: (messageId: Id) => Promise<FeedMessage>
    loadComments: (messageId: Id) => Promise<Comment[]>
    handleTagClick: (tagName: string) => void | Promise<void>
    setViewMode: (mode: 'list') => void
    notifyInfo?: (message: string) => void
    notifyWarning?: (message: string) => void
}

export function useHomeNotificationBindings({
    notifications,
    locateMessageById,
    loadComments,
    handleTagClick,
    setViewMode,
    notifyInfo,
    notifyWarning
}: HomeNotificationBindingsOptions) {
    const notificationState = computed(() => ({
        visible: notifications.visible.value,
        notifications: notifications.notifications.value,
        unreadCount: notifications.unreadCount.value,
        loading: notifications.loading.value,
        loadingMore: notifications.loadingMore.value,
        hasMore: notifications.hasMore.value,
        error: notifications.error.value
    }))

    const notificationUnreadCount = computed(() => notifications.unreadCount.value)
    const notificationBadge = computed(() => notifications.unreadBadge.value)

    const { highlightedMessageId, highlightedCommentId, clearHighlight, handleNotificationClick } =
        useNotificationTargetNavigator({
            locateMessageById,
            loadComments,
            handleTagClick,
            setViewMode,
            markRead: notifications.markRead,
            closeCenter: notifications.closeCenter,
            notifyInfo,
            notifyWarning
        })

    return {
        notificationState,
        notificationUnreadCount,
        notificationBadge,
        highlightedMessageId,
        highlightedCommentId,
        clearHighlight,
        handleNotificationClick
    }
}
