import { describe, expect, it } from 'vitest'
import { parseReactionMap, REACTION_EMOJIS } from './reactions'

describe('reaction constants', () => {
  it('exposes the supported reaction emoji set', () => {
    expect(REACTION_EMOJIS).toContain('❤️')
    expect(REACTION_EMOJIS).toContain('👍')
  })

  it('parses serialized reaction maps', () => {
    expect(parseReactionMap('{"❤️":2}')).toEqual({ '❤️': 2 })
  })

  it('returns object maps unchanged', () => {
    expect(parseReactionMap({ '🔥': 1 })).toEqual({ '🔥': 1 })
  })

  it('falls back to an empty map for invalid input', () => {
    expect(parseReactionMap('{')).toEqual({})
    expect(parseReactionMap(null)).toEqual({})
  })
})
