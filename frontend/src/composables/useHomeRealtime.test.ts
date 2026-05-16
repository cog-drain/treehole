import { describe, expect, it } from 'vitest'
import {
  appendRealtimeComment,
  applyRealtimeReaction,
  insertRealtimeMessage,
  normalizeRealtimeMessage
} from './useHomeRealtime'
import type { FeedMessage } from '@/types'

function feedMessage(id: number, commentCount = 0): FeedMessage {
  return {
    id,
    content: `message-${id}`,
    commentCount,
    _showComments: false,
    _comments: [],
    _commentText: '',
    _commentImage: null,
    _replyToId: null,
    _commenting: false,
    _read: false
  }
}

describe('home realtime helpers', () => {
  it('normalizes new messages for feed rendering', () => {
    const normalized = normalizeRealtimeMessage({ id: 1, content: 'hello', userId: 'u1' }, 'u1')

    expect(normalized.isOwner).toBe(true)
    expect(normalized._showComments).toBe(false)
    expect(normalized._comments).toEqual([])
    expect(normalized._commentText).toBe('')
  })

  it('inserts new messages and removes optimistic placeholders', () => {
    const optimistic = { ...feedMessage(99), isOptimistic: true }
    const result = insertRealtimeMessage([optimistic, feedMessage(2)], { id: 1, content: 'new', userId: 'u2' }, 'u1', 2)

    expect(result.inserted).toBe(true)
    expect(result.messages.map(message => message.id)).toEqual([1, 2])
    expect(result.message?.isOwner).toBe(false)
  })

  it('does not insert duplicate messages', () => {
    const result = insertRealtimeMessage([feedMessage(1)], { id: 1, content: 'duplicate' }, 'u1', 10)

    expect(result.inserted).toBe(false)
    expect(result.messages).toHaveLength(1)
    expect(result.message).toBeNull()
  })

  it('appends new comments once and updates ownership', () => {
    const messages = [feedMessage(1)]
    const appended = appendRealtimeComment(messages, { id: 10, messageId: 1, content: 'reply', userId: 'u1' }, 'u1')
    const duplicate = appendRealtimeComment(messages, { id: 10, messageId: 1, content: 'reply', userId: 'u1' }, 'u1')

    expect(appended).toBe(true)
    expect(duplicate).toBe(false)
    expect(messages[0].commentCount).toBe(1)
    expect(messages[0]._comments[0].isOwner).toBe(true)
  })

  it('applies message and comment reaction updates', () => {
    const messages = [feedMessage(1)]
    appendRealtimeComment(messages, { id: 10, messageId: 1, content: 'reply' }, 'u1')

    applyRealtimeReaction(messages, 'REACTION_UPDATE', { messageId: 1, reactions: { like: 2 } })
    applyRealtimeReaction(messages, 'COMMENT_REACTION_UPDATE', { messageId: 1, commentId: 10, reactions: { smile: 1 } })

    expect(messages[0].reactions).toEqual({ like: 2 })
    expect(messages[0]._comments[0].reactions).toEqual({ smile: 1 })
  })
})
