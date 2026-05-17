import { ref } from 'vue'
import type { Id, TreeholeNotification } from '@/types'

export interface NotificationTargetLocation {
    targetType: TreeholeNotification['targetType']
    messageId: Id | null
    commentId: Id | null
    parentCommentId: Id | null
    tagId: Id | null
    tagName: string | null
}

export function resolveNotificationTarget(notification: TreeholeNotification): NotificationTargetLocation {
    return {
        targetType: notification.targetType,
        messageId: notification.messageId ?? null,
        commentId: notification.commentId ?? null,
        parentCommentId: notification.parentCommentId ?? null,
        tagId: notification.tagId ?? null,
        tagName: notification.tagName ?? null
    }
}

export function canLocateNotificationTarget(target: NotificationTargetLocation): boolean {
    if (target.targetType === 'COMMENT') return target.messageId !== null && target.commentId !== null
    if (target.targetType === 'TAG') return Boolean(target.tagName)
    return target.messageId !== null
}

export function getMessageElementId(messageId: Id): string {
    return `msg-${messageId}`
}

export function getCommentElementId(commentId: Id): string {
    return `comment-${commentId}`
}

export interface NotificationNavigatorMessage {
    id: Id
    _showComments?: boolean
    _comments?: unknown[]
    commentCount?: number
}

export interface NotificationTargetNavigatorOptions<TMessage extends NotificationNavigatorMessage> {
    locateMessageById: (messageId: Id) => Promise<TMessage>
    loadComments: (messageId: Id) => Promise<unknown[]>
    handleTagClick: (tagName: string) => void | Promise<void>
    setViewMode: (mode: 'list') => void
    markRead: (id: Id) => Promise<void>
    closeCenter: () => void
    notifyInfo?: (message: string) => void
    notifyWarning?: (message: string) => void
    scrollToElement?: (id: string) => Promise<void>
    highlightDurationMs?: number
}

function defaultScrollToElement(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        window.requestAnimationFrame(() => {
            const element = document.getElementById(id)
            if (!element) {
                reject(new Error('target not found'))
                return
            }
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            resolve()
        })
    })
}

export function useNotificationTargetNavigator<TMessage extends NotificationNavigatorMessage>({
    locateMessageById,
    loadComments,
    handleTagClick,
    setViewMode,
    markRead,
    closeCenter,
    notifyInfo,
    notifyWarning,
    scrollToElement = defaultScrollToElement,
    highlightDurationMs = 3000
}: NotificationTargetNavigatorOptions<TMessage>) {
    const highlightedMessageId = ref<Id | null>(null)
    const highlightedCommentId = ref<Id | null>(null)
    let highlightTimer: ReturnType<typeof globalThis.setTimeout> | null = null

    function clearHighlight(): void {
        if (highlightTimer) globalThis.clearTimeout(highlightTimer)
        highlightedMessageId.value = null
        highlightedCommentId.value = null
        highlightTimer = null
    }

    function startHighlight(messageId: Id, commentId: Id | null): void {
        highlightedMessageId.value = messageId
        highlightedCommentId.value = commentId
        if (highlightTimer) globalThis.clearTimeout(highlightTimer)
        highlightTimer = globalThis.setTimeout(clearHighlight, highlightDurationMs)
    }

    async function markNotificationReadQuietly(id: Id): Promise<void> {
        try {
            await markRead(id)
        } catch {
            // Read-state failures should not block navigation or close the center.
        }
    }

    async function locateMessageTarget(messageId: Id): Promise<void> {
        const message = await locateMessageById(messageId)
        setViewMode('list')
        startHighlight(message.id, null)
        await scrollToElement(getMessageElementId(message.id))
    }

    async function locateCommentTarget(messageId: Id, commentId: Id): Promise<void> {
        const message = await locateMessageById(messageId)
        setViewMode('list')
        if (!message._showComments) {
            message._showComments = true
        }
        const comments = await loadComments(message.id)
        message._comments = comments
        message.commentCount = Math.max(Number(message.commentCount || 0), comments.length)
        startHighlight(message.id, commentId)
        await scrollToElement(getCommentElementId(commentId))
    }

    async function locateTagTarget(tagName: string | null): Promise<void> {
        if (!tagName) throw new Error('missing tag')
        setViewMode('list')
        await handleTagClick(tagName)
    }

    async function handleNotificationClick(notification: TreeholeNotification): Promise<void> {
        const target = resolveNotificationTarget(notification)
        if (!canLocateNotificationTarget(target)) {
            await markNotificationReadQuietly(notification.id)
            notifyInfo?.('这条内容暂时无法定位')
            return
        }

        try {
            if (target.targetType === 'COMMENT' && target.messageId !== null && target.commentId !== null) {
                await locateCommentTarget(target.messageId, target.commentId)
            } else if (target.targetType === 'TAG') {
                await locateTagTarget(target.tagName)
            } else if (target.messageId !== null) {
                await locateMessageTarget(target.messageId)
            }
            await markNotificationReadQuietly(notification.id)
            closeCenter()
        } catch {
            await markNotificationReadQuietly(notification.id)
            notifyWarning?.('目标内容暂时不可达')
        }
    }

    return {
        highlightedMessageId,
        highlightedCommentId,
        clearHighlight,
        startHighlight,
        locateMessageTarget,
        locateCommentTarget,
        locateTagTarget,
        handleNotificationClick
    }
}
