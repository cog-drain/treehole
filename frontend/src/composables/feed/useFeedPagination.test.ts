import { describe, expect, it } from 'vitest'
import { createFeedMessageState } from './feedMessageState'

describe('createFeedMessageState', () => {
    it('adds feed UI state fields', () => {
        const normalized = createFeedMessageState(
            { id: 1, content: 'hello', commentCount: 2 },
            { readIds: new Set([1]) }
        )

        expect(normalized._showComments).toBe(false)
        expect(normalized._comments).toEqual([])
        expect(normalized._commentText).toBe('')
        expect(normalized._read).toBe(true)
        expect(normalized.coFrequency).toBe(false)
    })

    it('marks high-comment messages as co-frequency', () => {
        const normalized = createFeedMessageState({ id: 2, content: 'hot', commentCount: 6 })

        expect(normalized.coFrequency).toBe(true)
    })

    it('preserves existing co-frequency truthy state', () => {
        const normalized = createFeedMessageState({ id: 3, content: 'resonant', coFrequency: true })

        expect(normalized.coFrequency).toBe(true)
    })

    it('applies owner and optimistic overrides', () => {
        const normalized = createFeedMessageState({ id: 4, content: 'local' }, { isOwner: true, isOptimistic: true })

        expect(normalized.isOwner).toBe(true)
        expect(normalized.isOptimistic).toBe(true)
    })

    it('normalizes camo skin state per message', () => {
        const normalized = createFeedMessageState({ id: 5, content: 'ghost', camoEffect: true })

        expect(normalized.camoEffect).toBe(true)
    })
})
