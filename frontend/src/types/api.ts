import type {
    Bottle,
    Comment,
    GraphData,
    GraphLink,
    GraphNode,
    Message,
    ReactionCounts,
    ServerMessage,
    TagSubscription,
    TreeholeNotification
} from './domain'

export interface ApiResponse<T = unknown> {
    code?: number
    msg?: string
    data: T
}

export interface ApiErrorResponse<T = unknown> {
    code?: number
    msg?: string
    message?: string
    data?: T
}

export interface PageResult<T> {
    records?: T[]
    list?: T[]
    total: number
    current?: number
    size?: number
}

export interface NormalizedPageResult<T> {
    records: T[]
    total: number
    current?: number
    size?: number
}

export type Id = number | string

export interface PageParams {
    pageNum?: number
    pageSize?: number
    tag?: string
}

export interface NotificationPageParams {
    pageNum?: number
    pageSize?: number
    unreadOnly?: boolean
}

export interface UnreadCountResponse {
    unreadCount: number
}

export function toApiId(id: Id): string {
    return String(id)
}

export function normalizeNullableApiId(id: unknown): Id | null {
    if (typeof id === 'number' || typeof id === 'string') {
        return id
    }

    return null
}

export function isSameApiId(left: Id | null | undefined, right: Id | null | undefined): boolean {
    if (left === null || left === undefined || right === null || right === undefined) {
        return false
    }

    return toApiId(left) === toApiId(right)
}

export function normalizeReactionCounts(reactions: string | ReactionCounts | null | undefined): ReactionCounts {
    if (!reactions) return {}

    const value = typeof reactions === 'string' ? parseJsonObject(reactions) : reactions
    if (!value || typeof value !== 'object') return {}

    return Object.fromEntries(
        Object.entries(value)
            .map(([emoji, count]) => [emoji, Number(count)] as const)
            .filter(([, count]) => Number.isFinite(count) && count > 0)
    )
}

export function normalizeComment(comment: Partial<Comment> | null | undefined): Comment {
    return {
        ...comment,
        id: normalizeNullableApiId(comment?.id) ?? '',
        messageId: normalizeNullableApiId(comment?.messageId),
        parentId: normalizeNullableApiId(comment?.parentId),
        content: typeof comment?.content === 'string' ? comment.content : '',
        imageUrl: comment?.imageUrl ?? null,
        authorAlias: comment?.authorAlias ?? null,
        userId: comment?.userId ?? null,
        isOwner: Boolean(comment?.isOwner),
        createTime: comment?.createTime ?? null,
        reactions: normalizeReactionCounts(comment?.reactions),
        children: Array.isArray(comment?.children) ? comment.children.map(normalizeComment) : [],
        coFrequency: Boolean(comment?.coFrequency)
    }
}

export function normalizeMessage(message: Partial<ServerMessage> | null | undefined): Message {
    const likes = normalizeNumber(message?.likes ?? message?.likeCount)

    return {
        ...message,
        id: normalizeNullableApiId(message?.id) ?? '',
        content: typeof message?.content === 'string' ? message.content : '',
        userId: message?.userId ?? null,
        authorAlias: message?.authorAlias ?? null,
        imageUrl: message?.imageUrl ?? null,
        audioUrl: message?.audioUrl ?? null,
        likes,
        likeCount: likes,
        commentCount: normalizeNumber(message?.commentCount),
        reactions: normalizeReactionCounts(message?.reactions),
        comments: Array.isArray(message?.comments) ? message.comments.map(normalizeComment) : [],
        createTime: message?.createTime ?? null,
        createTimeEpochMs: normalizeNullableNumber(message?.createTimeEpochMs),
        expiresAt: message?.expiresAt ?? null,
        expiresAtEpochMs: normalizeNullableNumber(message?.expiresAtEpochMs),
        messageType: message?.messageType ?? message?.type ?? 'normal',
        type: message?.type ?? message?.messageType ?? 'normal',
        witnessCount: normalizeNumber(message?.witnessCount),
        witnessedByMe: Boolean(message?.witnessedByMe),
        confessorReply: message?.confessorReply ?? null,
        isOwner: Boolean(message?.isOwner),
        coFrequency: Boolean(message?.coFrequency),
        camoEffect: Boolean(message?.camoEffect)
    }
}

export function normalizeNotification(
    notification: Partial<TreeholeNotification> | null | undefined
): TreeholeNotification {
    return {
        ...notification,
        id: normalizeNullableApiId(notification?.id) ?? '',
        type: notification?.type ?? 'MESSAGE_COMMENTED',
        targetType: notification?.targetType ?? 'MESSAGE',
        messageId: normalizeNullableApiId(notification?.messageId),
        commentId: normalizeNullableApiId(notification?.commentId),
        parentCommentId: normalizeNullableApiId(notification?.parentCommentId),
        tagId: normalizeNullableApiId(notification?.tagId),
        tagName: notification?.tagName ?? null,
        title: notification?.title ?? null,
        summary: notification?.summary ?? null,
        read: Boolean(notification?.read),
        createTime: notification?.createTime ?? null
    }
}

export function normalizeTagSubscription(subscription: Partial<TagSubscription> | null | undefined): TagSubscription {
    return {
        ...subscription,
        id: normalizeNullableApiId(subscription?.id) ?? '',
        tagId: normalizeNullableApiId(subscription?.tagId) ?? '',
        tagName: subscription?.tagName ?? '',
        usageCount: normalizeNumber(subscription?.usageCount),
        createTime: subscription?.createTime ?? null
    }
}

export function normalizeBottle(bottle: Partial<Bottle> | null | undefined): Bottle {
    return {
        ...bottle,
        id: normalizeNullableApiId(bottle?.id) ?? '',
        content: typeof bottle?.content === 'string' ? bottle.content : '',
        authorAlias: bottle?.authorAlias ?? null,
        theme: bottle?.theme ?? null,
        state: normalizeNumber(bottle?.state),
        createTime: bottle?.createTime ?? null,
        replyContent: bottle?.replyContent ?? null,
        replyAuthorAlias: bottle?.replyAuthorAlias ?? null,
        replyTime: bottle?.replyTime ?? null,
        lastPickerId: bottle?.lastPickerId ?? null,
        updateTime: bottle?.updateTime ?? null
    }
}

export function normalizeGraphData(graphData: Partial<GraphData> | null | undefined): GraphData {
    return {
        nodes: Array.isArray(graphData?.nodes) ? graphData.nodes.map(normalizeGraphNode) : [],
        links: Array.isArray(graphData?.links) ? graphData.links.map(normalizeGraphLink) : []
    }
}

export function normalizePageResult<T>(page: PageResult<T>): NormalizedPageResult<T> {
    return {
        records: page.records ?? page.list ?? [],
        total: page.total,
        current: page.current,
        size: page.size
    }
}

export function getApiErrorMessage(error: ApiErrorResponse | Error | unknown, fallback = '请求失败'): string {
    if (error instanceof Error && error.message) {
        return error.message
    }

    if (typeof error === 'object' && error !== null) {
        const response = error as ApiErrorResponse
        return response.msg || response.message || fallback
    }

    return fallback
}

function normalizeNumber(value: unknown): number {
    const numberValue = Number(value ?? 0)
    return Number.isFinite(numberValue) ? numberValue : 0
}

function normalizeNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null
    const numberValue = Number(value)
    return Number.isFinite(numberValue) ? numberValue : null
}

function parseJsonObject(value: string): ReactionCounts | null {
    try {
        const parsed = JSON.parse(value)
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
    } catch {
        return null
    }
}

function normalizeGraphNode(node: Partial<GraphNode> | null | undefined): GraphNode {
    return {
        ...node,
        id: normalizeNullableApiId(node?.id) ?? '',
        label: typeof node?.label === 'string' ? node.label : '',
        mood: node?.mood ?? null,
        theme: node?.theme ?? null,
        author: node?.author ?? null
    }
}

function normalizeGraphLink(link: Partial<GraphLink> | null | undefined): GraphLink {
    return {
        ...link,
        source: normalizeNullableApiId(link?.source) ?? '',
        target: normalizeNullableApiId(link?.target) ?? '',
        type: link?.type,
        value: link?.value
    }
}
