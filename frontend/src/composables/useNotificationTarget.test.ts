import { describe, expect, it } from 'vitest'
import {
  canLocateNotificationTarget,
  getCommentElementId,
  getMessageElementId,
  resolveNotificationTarget
} from './useNotificationTarget'

describe('notification target helpers', () => {
  it('extracts location params from notifications', () => {
    const target = resolveNotificationTarget({
      id: 1,
      type: 'COMMENT_REPLIED',
      targetType: 'COMMENT',
      messageId: 10,
      commentId: 20,
      parentCommentId: 15,
      tagId: null,
      tagName: null,
      title: 'reply',
      read: false
    })

    expect(target).toEqual({
      targetType: 'COMMENT',
      messageId: 10,
      commentId: 20,
      parentCommentId: 15,
      tagId: null,
      tagName: null
    })
  })

  it('requires comment notifications to include message and comment ids', () => {
    expect(canLocateNotificationTarget({ targetType: 'COMMENT', messageId: 1, commentId: 2, parentCommentId: null, tagId: null, tagName: null })).toBe(true)
    expect(canLocateNotificationTarget({ targetType: 'COMMENT', messageId: 1, commentId: null, parentCommentId: null, tagId: null, tagName: null })).toBe(false)
    expect(canLocateNotificationTarget({ targetType: 'MESSAGE', messageId: 1, commentId: null, parentCommentId: null, tagId: null, tagName: null })).toBe(true)
    expect(canLocateNotificationTarget({ targetType: 'CONFESSION', messageId: null, commentId: null, parentCommentId: null, tagId: null, tagName: null })).toBe(false)
    expect(canLocateNotificationTarget({ targetType: 'TAG', messageId: null, commentId: null, parentCommentId: null, tagId: 1, tagName: '夜晚' })).toBe(true)
  })

  it('returns stable DOM ids for scroll targets', () => {
    expect(getMessageElementId(3)).toBe('msg-3')
    expect(getCommentElementId('c4')).toBe('comment-c4')
  })
})
