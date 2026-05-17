import { describe, expect, it } from 'vitest'
import {
    canLocateNotificationTarget,
    getCommentElementId,
    getMessageElementId,
    resolveNotificationTarget,
    useNotificationTargetNavigator
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
        expect(
            canLocateNotificationTarget({
                targetType: 'COMMENT',
                messageId: 1,
                commentId: 2,
                parentCommentId: null,
                tagId: null,
                tagName: null
            })
        ).toBe(true)
        expect(
            canLocateNotificationTarget({
                targetType: 'COMMENT',
                messageId: 1,
                commentId: null,
                parentCommentId: null,
                tagId: null,
                tagName: null
            })
        ).toBe(false)
        expect(
            canLocateNotificationTarget({
                targetType: 'MESSAGE',
                messageId: 1,
                commentId: null,
                parentCommentId: null,
                tagId: null,
                tagName: null
            })
        ).toBe(true)
        expect(
            canLocateNotificationTarget({
                targetType: 'CONFESSION',
                messageId: null,
                commentId: null,
                parentCommentId: null,
                tagId: null,
                tagName: null
            })
        ).toBe(false)
        expect(
            canLocateNotificationTarget({
                targetType: 'TAG',
                messageId: null,
                commentId: null,
                parentCommentId: null,
                tagId: 1,
                tagName: '夜晚'
            })
        ).toBe(true)
    })

    it('returns stable DOM ids for scroll targets', () => {
        expect(getMessageElementId(3)).toBe('msg-3')
        expect(getCommentElementId('c4')).toBe('comment-c4')
    })

    it('locates message notifications and marks them read', async () => {
        const calls: string[] = []
        const navigator = useNotificationTargetNavigator({
            locateMessageById: async () => ({ id: 10 }),
            loadComments: async () => [],
            handleTagClick: () => {
                calls.push('tag')
            },
            setViewMode: () => {
                calls.push('list')
            },
            markRead: async () => {
                calls.push('read')
            },
            closeCenter: () => {
                calls.push('close')
            },
            scrollToElement: async id => {
                calls.push(`scroll:${id}`)
            }
        })

        await navigator.handleNotificationClick({
            id: 1,
            type: 'MESSAGE_COMMENTED',
            targetType: 'MESSAGE',
            messageId: 10,
            title: 'message',
            read: false
        })

        expect(calls).toEqual(['list', 'scroll:msg-10', 'read', 'close'])
        expect(navigator.highlightedMessageId.value).toBe(10)
        navigator.clearHighlight()
    })

    it('opens comments before locating comment notifications', async () => {
        const message = { id: 10, _showComments: false, _comments: [], commentCount: 0 }
        const navigator = useNotificationTargetNavigator({
            locateMessageById: async () => message,
            loadComments: async () => [{ id: 20 }, { id: 21 }],
            handleTagClick: () => {},
            setViewMode: () => {},
            markRead: async () => {},
            closeCenter: () => {},
            scrollToElement: async () => {}
        })

        await navigator.handleNotificationClick({
            id: 1,
            type: 'COMMENT_REPLIED',
            targetType: 'COMMENT',
            messageId: 10,
            commentId: 20,
            title: 'comment',
            read: false
        })

        expect(message._showComments).toBe(true)
        expect(message._comments).toEqual([{ id: 20 }, { id: 21 }])
        expect(message.commentCount).toBe(2)
        expect(navigator.highlightedCommentId.value).toBe(20)
        navigator.clearHighlight()
    })

    it('switches to list mode and applies tag filters for tag notifications', async () => {
        const calls: string[] = []
        const navigator = useNotificationTargetNavigator({
            locateMessageById: async () => ({ id: 10 }),
            loadComments: async () => [],
            handleTagClick: tagName => {
                calls.push(`tag:${tagName}`)
            },
            setViewMode: () => {
                calls.push('list')
            },
            markRead: async () => {
                calls.push('read')
            },
            closeCenter: () => {
                calls.push('close')
            },
            scrollToElement: async () => {}
        })

        await navigator.handleNotificationClick({
            id: 1,
            type: 'TAG_NEW_MESSAGES',
            targetType: 'TAG',
            tagId: 8,
            tagName: '夜晚',
            title: 'tag',
            read: false
        })

        expect(calls).toEqual(['list', 'tag:夜晚', 'read', 'close'])
    })

    it('uses read fallback and info message for unlocatable notifications', async () => {
        const calls: string[] = []
        const navigator = useNotificationTargetNavigator({
            locateMessageById: async () => ({ id: 10 }),
            loadComments: async () => [],
            handleTagClick: () => {},
            setViewMode: () => {},
            markRead: async () => {
                calls.push('read')
            },
            closeCenter: () => {
                calls.push('close')
            },
            notifyInfo: message => {
                calls.push(message)
            }
        })

        await navigator.handleNotificationClick({
            id: 1,
            type: 'CONFESSION_WITNESSED',
            targetType: 'CONFESSION',
            messageId: null,
            title: 'missing',
            read: false
        })

        expect(calls).toEqual(['read', '这条内容暂时无法定位'])
    })

    it('marks read quietly and warns when target navigation fails', async () => {
        const calls: string[] = []
        const navigator = useNotificationTargetNavigator({
            locateMessageById: async () => ({ id: 10 }),
            loadComments: async () => [],
            handleTagClick: () => {},
            setViewMode: () => {},
            markRead: async () => {
                calls.push('read')
                throw new Error('read failed')
            },
            closeCenter: () => {
                calls.push('close')
            },
            scrollToElement: async () => {
                throw new Error('missing element')
            },
            notifyWarning: message => {
                calls.push(message)
            }
        })

        await navigator.handleNotificationClick({
            id: 1,
            type: 'MESSAGE_COMMENTED',
            targetType: 'MESSAGE',
            messageId: 10,
            title: 'message',
            read: false
        })

        expect(calls).toEqual(['read', '目标内容暂时不可达'])
    })
})
