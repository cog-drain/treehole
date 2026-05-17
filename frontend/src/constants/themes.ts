import type { ThemeKey } from '@/types'

export const CARD_THEMES = [
    { value: 'default' },
    { value: 'dawn' },
    { value: 'sakura' },
    { value: 'spring' }
] as const satisfies readonly { value: ThemeKey }[]
