export type ThemeKey = 'default' | 'dawn' | 'sakura' | 'spring'

export type ToneKey = 'whisper' | 'shout' | 'dream' | 'glitch' | 'poetic'

export type MessageType = 'normal' | 'confession'

export type VoiceEffectKey = 'original' | 'robot' | 'deep' | 'ethereal'

export type NotificationType =
    | 'MESSAGE_COMMENTED'
    | 'MESSAGE_LIKED'
    | 'COMMENT_REPLIED'
    | 'COMMENT_LIKED'
    | 'CONFESSION_WITNESSED'
    | 'TAG_NEW_MESSAGES'

export type NotificationTargetType = 'MESSAGE' | 'COMMENT' | 'CONFESSION' | 'TAG'

export type ReactionCounts = Record<string, number>

export interface TreeholeNotification {
    id: number | string
    type: NotificationType
    targetType: NotificationTargetType
    messageId?: number | string | null
    commentId?: number | string | null
    parentCommentId?: number | string | null
    tagId?: number | string | null
    tagName?: string | null
    title?: string | null
    summary?: string | null
    read: boolean
    createTime?: string | null
}

export interface UserIdentity {
    userId: string
    createdAt: number
}

export interface Comment {
    id: number | string
    messageId?: number | string | null
    parentId?: number | string | null
    content: string
    imageUrl?: string | null
    authorAlias?: string | null
    userId?: string | null
    isOwner?: boolean
    createTime?: string | null
    likeCount?: number
    reactions?: string | ReactionCounts
    children?: Comment[]
    coFrequency?: boolean
}

export interface ServerMessage {
    id: number | string
    content: string
    userId?: string | null
    authorAlias?: string | null
    theme?: ThemeKey | string | null
    mood?: ToneKey | string | null
    imageUrl?: string | null
    audioUrl?: string | null
    likes?: number | null
    likeCount?: number | null
    commentCount?: number | null
    reactions?: string | ReactionCounts | null
    tags?: string[] | string | null
    comments?: Comment[]
    createTime?: string | null
    expiresAt?: string | null
    aiReply?: string | null
    messageType?: MessageType | string | null
    type?: MessageType | string | null
    witnessCount?: number | null
    witnessedByMe?: boolean | null
    confessorReply?: string | null
    isOwner?: boolean | null
    coFrequency?: boolean | null
    camoEffect?: boolean | null
}

export interface Message extends Omit<
    ServerMessage,
    'reactions' | 'likes' | 'likeCount' | 'commentCount' | 'witnessCount'
> {
    reactions?: string | ReactionCounts
    likes?: number
    likeCount?: number
    commentCount?: number
    witnessCount?: number
    witnessedByMe?: boolean
    isOwner?: boolean
    coFrequency?: boolean
    camoEffect?: boolean
    /** Runtime-only compatibility; new feed state belongs on FeedMessage. */
    isOptimistic?: boolean
}

export interface FeedMessageRuntimeState {
    _showComments: boolean
    _comments: Comment[]
    _commentText: string
    _commentImage: string | null
    _replyToId: number | string | null
    _commenting: boolean
    _read: boolean
}

export interface FeedMessage extends Message, FeedMessageRuntimeState {}

export interface MessageDraft {
    content: string
    authorAlias?: string
    mood?: ToneKey | string
    theme?: ThemeKey | string
    imageUrl?: string
    audioUrl?: string
    messageType?: MessageType | string
    camoEffect?: boolean
    [key: string]: unknown
}

export interface ComposeFormDraft {
    authorAlias: string
    content: string
    mood: ToneKey | ''
    theme: ThemeKey | string
    [key: string]: unknown
}

export interface VoiceEffectOption {
    id: VoiceEffectKey
    name: string
    icon: string
}

export interface CommentDraft {
    messageId: number | string
    content: string
    imageUrl?: string | null
    parentId?: number | string | null
}

export interface Bottle {
    id: number | string
    content?: string
    authorAlias?: string | null
    theme?: ThemeKey | string | null
    state?: number | null
    createTime?: string | null
    replyContent?: string | null
    replyAuthorAlias?: string | null
    replyTime?: string | null
    lastPickerId?: string | null
    updateTime?: string | null
}

export type DriftBottleState = 'init' | 'throwing' | 'picking' | 'picked' | 'reply' | 'my-bottles' | 'sent'

export interface BottleDraft {
    content: string
    authorAlias?: string
    theme?: ThemeKey | string
    [key: string]: unknown
}

export interface GraphNode {
    id: number | string
    label: string
    mood?: ToneKey | string | null
    author?: string | null
    theme?: ThemeKey | string | null
    [key: string]: unknown
}

export interface GraphLink {
    source: number | string
    target: number | string
    type?: 'tag' | 'mood' | string
    value?: number
    [key: string]: unknown
}

export interface GraphData {
    nodes: GraphNode[]
    links: GraphLink[]
}

export interface OnlineStats {
    online: number
    modules?: Record<string, number>
}

export type RealtimeEventType =
    | 'NEW_MESSAGE'
    | 'NEW_COMMENT'
    | 'OBSERVER_MESSAGE'
    | 'REACTION_UPDATE'
    | 'COMMENT_REACTION_UPDATE'
    | 'ONLINE_STATS_UPDATE'
    | 'CONFESSOR_REPLY'
    | 'CONFESSION_WITNESS_UPDATE'
    | 'NOTIFICATION_CREATED'

export interface RealtimeEnvelope<T = unknown> {
    type?: RealtimeEventType
    msg?: string
    data?: T
}

export interface ReactionUpdatePayload {
    messageId: number | string
    commentId?: number | string
    reactions: string | ReactionCounts
}

export interface ConfessorReplyPayload {
    messageId: number | string
    reply: string
}

export interface ConfessionWitnessPayload {
    messageId: number | string
    witnessCount: number
}

export interface ActivityStats {
    [key: string]: unknown
}

export interface TrendingTag {
    id?: number | string
    tag?: string
    name?: string
    usageCount?: number
    count?: number
    [key: string]: unknown
}

export interface TagSubscription {
    id: number | string
    tagId: number | string
    tagName: string
    usageCount?: number | null
    createTime?: string | null
}

export interface IdentityBackup {
    recoveryKey?: string
    [key: string]: unknown
}

export interface BlacklistItem {
    ip: string
    reason?: string
    createTime?: string
    [key: string]: unknown
}

export interface StoreItem {
    id: string
    name: string
    description: string
    cost: number
    preview: string
    toggleEvent: string
}
