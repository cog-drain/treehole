export const REACTION_EMOJIS = ['❤️', '😂', '👍', '🔥', '😭'] as const

export function parseReactionMap(reactions: string | Record<string, number> | null | undefined): Record<string, number> {
  if (!reactions) return {}
  try {
    return typeof reactions === 'string' ? JSON.parse(reactions) : reactions
  } catch {
    return {}
  }
}
