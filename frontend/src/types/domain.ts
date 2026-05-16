export type ThemeKey = 'default' | 'dawn' | 'sakura' | 'spring'

export type ToneKey = 'whisper' | 'shout' | 'dream' | 'glitch' | 'poetic'

export type MessageType = 'normal' | 'confession'

export type VoiceEffectKey = 'original' | 'robot' | 'deep' | 'ethereal'

export interface UserIdentity {
  userId: string
  createdAt: number
}

export interface Comment {
  id: number | string
  messageId?: number | string
  parentId?: number | string | null
  content: string
  authorAlias?: string
  userId?: string
  isOwner?: boolean
  createTime?: string
  likeCount?: number
  reactions?: string | Record<string, number>
  children?: Comment[]
  coFrequency?: boolean
}

export interface Message {
  id: number | string
  content: string
  userId?: string
  authorAlias?: string
  theme?: ThemeKey | string
  mood?: ToneKey | string
  type?: MessageType | string
  imageUrl?: string
  audioUrl?: string
  likeCount?: number
  commentCount?: number
  reactions?: string | Record<string, number>
  tags?: string[] | string
  comments?: Comment[]
  createTime?: string
  expiresAt?: string | null
  aiReply?: string
  messageType?: MessageType | string
  witnessCount?: number
  witnessedByMe?: boolean
  confessorReply?: string
  likes?: number
  isOwner?: boolean
  isOptimistic?: boolean
  coFrequency?: boolean
}

export interface FeedMessage extends Message {
  _showComments: boolean
  _comments: Comment[]
  _commentText: string
  _commentImage: string | null
  _replyToId: number | string | null
  _commenting: boolean
  _read: boolean
}

export interface MessageDraft {
  content: string
  authorAlias?: string
  mood?: ToneKey | string
  theme?: ThemeKey | string
  imageUrl?: string
  audioUrl?: string
  messageType?: MessageType | string
  [key: string]: unknown
}

export interface ComposeFormDraft {
  authorAlias: string
  content: string
  mood: ToneKey | ''
  theme: ThemeKey
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
  content: string
  authorAlias?: string
  createTime?: string
  replyContent?: string
  replyAuthorAlias?: string
  replyTime?: string
}

export interface BottleDraft {
  content: string
  authorAlias?: string
  [key: string]: unknown
}

export interface GraphNode {
  id: number | string
  label: string
  author?: string
  theme?: ThemeKey | string
  [key: string]: unknown
}

export interface GraphLink {
  source: number | string
  target: number | string
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

export interface RealtimeEnvelope<T = unknown> {
  type?: RealtimeEventType
  msg?: string
  data?: T
}

export interface ReactionUpdatePayload {
  messageId: number | string
  commentId?: number | string
  reactions: string | Record<string, number>
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
  tag?: string
  name?: string
  count?: number
  [key: string]: unknown
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
