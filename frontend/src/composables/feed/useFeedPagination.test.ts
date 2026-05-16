import { describe, expect, it } from 'vitest'
import { normalizeFeedMessage } from './useFeedPagination'

describe('normalizeFeedMessage', () => {
  it('adds feed UI state fields', () => {
    const normalized = normalizeFeedMessage(
      { id: 1, content: 'hello', commentCount: 2 },
      new Set([1])
    )

    expect(normalized._showComments).toBe(false)
    expect(normalized._comments).toEqual([])
    expect(normalized._commentText).toBe('')
    expect(normalized._read).toBe(true)
    expect(normalized.coFrequency).toBe(false)
  })

  it('marks high-comment messages as co-frequency', () => {
    const normalized = normalizeFeedMessage(
      { id: 2, content: 'hot', commentCount: 6 },
      new Set()
    )

    expect(normalized.coFrequency).toBe(true)
  })

  it('preserves existing co-frequency truthy state', () => {
    const normalized = normalizeFeedMessage(
      { id: 3, content: 'resonant', coFrequency: true },
      new Set()
    )

    expect(normalized.coFrequency).toBe(true)
  })
})
