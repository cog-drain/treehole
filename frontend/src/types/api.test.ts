import { describe, expect, it } from 'vitest'
import {
    getApiErrorMessage,
    isSameApiId,
    normalizeBottle,
    normalizeComment,
    normalizeGraphData,
    normalizeMessage,
    normalizeNotification,
    normalizeNullableApiId,
    normalizePageResult,
    normalizeReactionCounts,
    normalizeTagSubscription,
    toApiId
} from './api'

describe('api type utilities', () => {
    it('normalizes records pagination payloads', () => {
        expect(
            normalizePageResult({
                records: [{ id: 1 }],
                total: 3,
                current: 2,
                size: 1
            })
        ).toEqual({
            records: [{ id: 1 }],
            total: 3,
            current: 2,
            size: 1
        })
    })

    it('normalizes legacy list pagination payloads', () => {
        expect(
            normalizePageResult({
                list: [{ id: 'n1' }],
                total: 1
            })
        ).toEqual({
            records: [{ id: 'n1' }],
            total: 1,
            current: undefined,
            size: undefined
        })
    })

    it('compares numeric and string ids by API identity', () => {
        expect(toApiId(12)).toBe('12')
        expect(normalizeNullableApiId(undefined)).toBeNull()
        expect(normalizeNullableApiId('12')).toBe('12')
        expect(isSameApiId(12, '12')).toBe(true)
        expect(isSameApiId('12', '13')).toBe(false)
        expect(isSameApiId(null, '12')).toBe(false)
    })

    it('reads API error messages with a stable fallback', () => {
        expect(getApiErrorMessage({ code: 400, msg: '参数错误' })).toBe('参数错误')
        expect(getApiErrorMessage({ message: 'unauthorized' })).toBe('unauthorized')
        expect(getApiErrorMessage({}, '服务响应异常')).toBe('服务响应异常')
    })

    it('normalizes reaction JSON and drops invalid counts', () => {
        expect(normalizeReactionCounts('{"❤️":2,"bad":"x","zero":0}')).toEqual({ '❤️': 2 })
        expect(normalizeReactionCounts({ '🔥': 3 })).toEqual({ '🔥': 3 })
        expect(normalizeReactionCounts('not-json')).toEqual({})
    })

    it('normalizes message and comment server boundaries', () => {
        const message = normalizeMessage({
            id: 1,
            content: 'hello',
            likes: null,
            commentCount: undefined,
            messageType: null,
            reactions: '{"ok":1}',
            comments: [
                {
                    id: 'c1',
                    messageId: 1,
                    content: 'reply',
                    parentId: undefined,
                    reactions: { ok: 2 },
                    children: [{ id: 3, content: 'child' }]
                }
            ]
        })

        expect(message.id).toBe(1)
        expect(message.likeCount).toBe(0)
        expect(message.messageType).toBe('normal')
        expect(message.reactions).toEqual({ ok: 1 })
        expect(message.comments?.[0]).toMatchObject({
            id: 'c1',
            messageId: 1,
            parentId: null,
            reactions: { ok: 2 },
            children: [{ id: 3, content: 'child', messageId: null, parentId: null, imageUrl: null }]
        })

        expect(normalizeComment(null)).toMatchObject({ id: '', content: '', children: [] })
    })

    it('normalizes notification target fields to explicit nulls', () => {
        expect(
            normalizeNotification({
                id: 5,
                type: 'TAG_NEW_MESSAGES',
                targetType: 'TAG',
                tagName: 'vue',
                read: undefined
            })
        ).toMatchObject({
            id: 5,
            messageId: null,
            commentId: null,
            parentCommentId: null,
            tagId: null,
            tagName: 'vue',
            title: null,
            summary: null,
            read: false
        })
    })

    it('normalizes tag subscription, bottle, and graph optional fields', () => {
        expect(normalizeTagSubscription({ tagId: 7, tagName: 'redis', usageCount: null })).toEqual({
            id: '',
            tagId: 7,
            tagName: 'redis',
            usageCount: 0,
            createTime: null
        })

        expect(normalizeBottle({ id: 2, content: 'sea', state: undefined })).toMatchObject({
            id: 2,
            content: 'sea',
            authorAlias: null,
            theme: null,
            state: 0,
            replyContent: null
        })

        expect(
            normalizeGraphData({
                nodes: [{ id: 1, label: 'A' }],
                links: [{ source: 1, target: '2', type: 'tag' }]
            })
        ).toEqual({
            nodes: [{ id: 1, label: 'A', mood: null, theme: null, author: null }],
            links: [{ source: 1, target: '2', type: 'tag', value: undefined }]
        })
    })
})
