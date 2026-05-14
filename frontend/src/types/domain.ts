export type ThemeKey = 'default' | 'dawn' | 'sakura' | 'spring'

export type ToneKey = 'whisper' | 'shout' | 'dream' | 'glitch' | 'poetic'

export type MessageType = 'normal' | 'confession'

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
  createTime?: string
  likeCount?: number
  reactions?: string | Record<string, number>
  children?: Comment[]
}

export interface Message {
  id: number | string
  content: string
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

export interface StoreItem {
  id: string
  name: string
  description: string
  cost: number
  preview: string
  toggleEvent: string
}
