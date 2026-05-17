import type { ToneKey } from '@/types'

export const TONE_MODES = {
    whisper: { emoji: '🤫', label: '悄悄话', desc: '文字变淡，悬停才显现', class: 'tone-whisper' },
    shout: { emoji: '📢', label: '大声说', desc: '文字加粗放大', class: 'tone-shout' },
    dream: { emoji: '💤', label: '梦话', desc: '模糊飘忽，像在梦境中', class: 'tone-dream' },
    glitch: { emoji: '👾', label: '电波', desc: '赛博毛刺动画', class: 'tone-glitch' },
    poetic: { emoji: '🌙', label: '诗意', desc: '衬线体、加大行距', class: 'tone-poetic' }
} as const satisfies Record<ToneKey, { emoji: string; label: string; desc: string; class: string }>
