export const REACTION_EMOJIS = ['❤️', '😂', '👍', '🔥', '😭']

export function parseReactionMap(reactions) {
  if (!reactions) return {}
  try {
    return typeof reactions === 'string' ? JSON.parse(reactions) : reactions
  } catch {
    return {}
  }
}
