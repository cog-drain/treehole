import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { ACTIVITY_EVENTS, ACTIVITY_MODULES } from '@/constants/activityEvents'
import { useHomeFeedBindings } from './useHomeFeedBindings'
import type { FeedMessage } from '@/types'

function createMessage(id: number): FeedMessage {
    return {
        id,
        content: 'msg',
        _showComments: false,
        _comments: [],
        _commentText: '',
        _commentImage: null,
        _replyToId: null,
        _commenting: false,
        _read: true
    }
}

describe('useHomeFeedBindings', () => {
    it('updates reply target and comment text fields', () => {
        const message = createMessage(1)
        const bindings = useHomeFeedBindings({
            messages: ref([message]),
            witnessMessage: vi.fn(),
            handleTagClick: vi.fn(),
            trackActivity: vi.fn()
        })

        bindings.setReplyTarget({ msg: message, comment: { id: 2, content: 'hi', authorAlias: 'Echo' } })
        expect(message._replyToId).toBe(2)
        expect(message._commentText).toBe('@Echo ')

        bindings.setCommentText({ msg: message, value: 'draft' })
        expect(message._commentText).toBe('draft')

        bindings.clearReplyTarget(message)
        expect(message._replyToId).toBeNull()
        expect(message._commentText).toBe('')
    })

    it('witnesses an existing message and tracks comment activity', () => {
        const message = createMessage(1)
        const witnessMessage = vi.fn()
        const trackActivity = vi.fn()
        const bindings = useHomeFeedBindings({
            messages: ref([message]),
            witnessMessage,
            handleTagClick: vi.fn(),
            trackActivity
        })

        bindings.handleWitness(1)

        expect(witnessMessage).toHaveBeenCalledWith(message)
        expect(trackActivity).toHaveBeenCalledWith(ACTIVITY_EVENTS.witnessConfession, ACTIVITY_MODULES.comments)
    })
})
