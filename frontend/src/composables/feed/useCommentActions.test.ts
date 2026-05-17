import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCommentActions } from './useCommentActions'

vi.mock('element-plus', () => ({
    ElMessage: { success: vi.fn(), info: vi.fn(), warning: vi.fn() },
    ElMessageBox: { confirm: vi.fn() }
}))

vi.mock('@/api', () => ({
    default: {
        likeMessage: vi.fn(),
        getComments: vi.fn(),
        publishComment: vi.fn(),
        deleteMessage: vi.fn(),
        deleteComment: vi.fn(),
        witnessMessage: vi.fn()
    },
    CMT_TOKEN_KEY: 'cmt_token',
    getToken: vi.fn(() => ''),
    MSG_TOKEN_KEY: 'msg_token'
}))

import api from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

function createOptions(overrides: Record<string, unknown> = {}) {
    const likedIds = new Set<string | number>()
    const readIds = new Set<string | number>()
    const energyLog: number[] = []
    const activityLog: { event: string; module?: string }[] = []

    return {
        options: {
            likedIds,
            markAsRead: (id: string | number) => readIds.add(id),
            isAdmin: { value: false },
            appStore: { addEnergy: (n: number) => energyLog.push(n) },
            activity: {
                setModule: (m: string) => activityLog.push({ event: 'set_module', module: m }),
                track: (e: string, m?: string) => activityLog.push({ event: e, module: m }),
                resolveModule: () => 'feed'
            },
            fetchMessages: vi.fn(),
            ...overrides
        },
        likedIds,
        readIds,
        energyLog: () => energyLog,
        activityLog: () => activityLog
    }
}

function createMsg(overrides: Record<string, unknown> = {}) {
    return {
        id: 1 as string | number,
        content: 'test',
        likes: 0,
        likeCount: 0,
        commentCount: 0,
        _showComments: false,
        _comments: [] as any[],
        _commentText: '',
        _commentImage: null as string | null,
        _replyToId: null as string | number | null,
        _commenting: false,
        _read: false,
        isOwner: true,
        witnessCount: 0,
        witnessedByMe: false,
        coFrequency: false,
        ...overrides
    } as any
}

describe('useCommentActions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('likeMessage', () => {
        it('calls API and increments likes on success', async () => {
            vi.mocked(api.likeMessage).mockResolvedValue({ code: 200, data: null })
            const { options, likedIds, energyLog, activityLog } = createOptions()
            const { likeMessage } = useCommentActions(options)
            const msg = createMsg()

            await likeMessage(msg)

            expect(likedIds.has(1)).toBe(true)
            expect(msg.likeCount).toBe(1)
            expect(energyLog()).toEqual([2])
            expect(activityLog().some(a => a.event === 'like_message')).toBe(true)
        })

        it('shows info and returns early when already liked', async () => {
            const { options, likedIds } = createOptions()
            likedIds.add(1)
            const { likeMessage } = useCommentActions(options)
            const msg = createMsg()

            await likeMessage(msg)

            expect(api.likeMessage).not.toHaveBeenCalled()
            expect(vi.mocked(ElMessage.info)).toHaveBeenCalledWith('已经点过赞啦 ❤️')
        })

        it('silently catches API errors', async () => {
            vi.mocked(api.likeMessage).mockRejectedValue(new Error('fail'))
            const { options } = createOptions()
            const { likeMessage } = useCommentActions(options)

            await expect(likeMessage(createMsg())).resolves.toBeUndefined()
        })
    })

    describe('toggleComments', () => {
        it('opens comments, fetches them, and tracks activity', async () => {
            vi.mocked(api.getComments).mockResolvedValue({ code: 200, data: [{ id: 10, content: 'c1' }] })
            const { options, readIds, activityLog } = createOptions()
            const { toggleComments } = useCommentActions(options)
            const msg = createMsg()

            await toggleComments(msg)

            expect(msg._showComments).toBe(true)
            expect(msg._read).toBe(true)
            expect(readIds.has(1)).toBe(true)
            expect(msg._comments).toHaveLength(1)
            expect(activityLog().some(a => a.module === 'comments')).toBe(true)
        })

        it('closes comments and resets module', async () => {
            const { options, activityLog } = createOptions()
            const { toggleComments } = useCommentActions(options)
            const msg = createMsg({ _showComments: true })

            await toggleComments(msg)

            expect(msg._showComments).toBe(false)
            expect(activityLog().some(a => a.event === 'set_module')).toBe(true)
        })
    })

    describe('publishComment', () => {
        it('returns early when comment text and image are empty', async () => {
            const { options } = createOptions()
            const { publishComment } = useCommentActions(options)
            const msg = createMsg()

            await publishComment(msg)

            expect(api.publishComment).not.toHaveBeenCalled()
        })

        it('publishes comment and refreshes list', async () => {
            vi.mocked(api.publishComment).mockResolvedValue({ code: 200, data: null })
            vi.mocked(api.getComments).mockResolvedValue({ code: 200, data: [{ id: 20, content: 'new' }] })
            const { options, energyLog } = createOptions()
            const { publishComment } = useCommentActions(options)
            const msg = createMsg({ _commentText: 'hello' })

            await publishComment(msg)

            expect(api.publishComment).toHaveBeenCalledWith({
                messageId: 1,
                content: 'hello',
                imageUrl: null,
                parentId: null
            })
            expect(msg.commentCount).toBe(1)
            expect(msg._commentText).toBe('')
            expect(energyLog()).toEqual([5])
        })
    })

    describe('deleteMessage', () => {
        it('warns when user lacks permission', async () => {
            const { options } = createOptions()
            const { deleteMessage } = useCommentActions(options)
            const msg = createMsg({ isOwner: false })

            await deleteMessage(msg)

            expect(ElMessage.warning).toHaveBeenCalled()
        })

        it('deletes and re-fetches after confirmation', async () => {
            vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm' as never)
            vi.mocked(api.deleteMessage).mockResolvedValue({ code: 200, data: null })
            const { options } = createOptions()
            const { deleteMessage } = useCommentActions(options)
            const msg = createMsg()

            await deleteMessage(msg)

            expect(api.deleteMessage).toHaveBeenCalledWith(1)
            expect(options.fetchMessages).toHaveBeenCalled()
        })
    })

    describe('handleDeleteComment', () => {
        it('warns when user lacks permission', async () => {
            const { options } = createOptions()
            const { handleDeleteComment } = useCommentActions(options)
            const msg = createMsg()

            await handleDeleteComment({ msg, comment: { id: 5, content: '', isOwner: false } })

            expect(ElMessage.warning).toHaveBeenCalled()
        })

        it('deletes comment and refreshes after confirmation', async () => {
            vi.mocked(ElMessageBox.confirm).mockResolvedValue('confirm' as never)
            vi.mocked(api.deleteComment).mockResolvedValue({ code: 200, data: null })
            vi.mocked(api.getComments).mockResolvedValue({ code: 200, data: [] })
            const { options } = createOptions()
            const { handleDeleteComment } = useCommentActions(options)
            const msg = createMsg({ commentCount: 2 })

            await handleDeleteComment({ msg, comment: { id: 5, content: '', isOwner: true } })

            expect(api.deleteComment).toHaveBeenCalledWith(5)
            expect(msg.commentCount).toBe(1)
        })
    })

    describe('witnessMessage', () => {
        it('returns early when already witnessed', async () => {
            const { options } = createOptions()
            const { witnessMessage } = useCommentActions(options)
            const msg = createMsg({ witnessedByMe: true })

            await witnessMessage(msg)

            expect(api.witnessMessage).not.toHaveBeenCalled()
        })

        it('calls API and updates witness state on success', async () => {
            vi.mocked(api.witnessMessage).mockResolvedValue({ code: 200, data: { witnessCount: 5 } })
            const { options } = createOptions()
            const { witnessMessage } = useCommentActions(options)
            const msg = createMsg({ witnessCount: 1 })

            await witnessMessage(msg)

            expect(msg.witnessCount).toBe(5)
            expect(msg.witnessedByMe).toBe(true)
        })
    })
})
