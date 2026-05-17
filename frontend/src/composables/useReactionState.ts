import { computed, type ComputedRef } from 'vue'
import { getString, remove, setString } from '@/utils/storage'

export function useReactionState(
    keyFactory: (id: string | number) => string,
    getId: () => string | number,
    reactApi?: (emoji: string) => Promise<unknown>
) {
    const reactedKey: ComputedRef<string> = computed(() => keyFactory(getId()))

    function getReactedEmoji(): string {
        return getString(reactedKey.value, '')
    }

    function hasReacted(emoji: string): boolean {
        return getReactedEmoji() === emoji
    }

    function setReactedEmoji(emoji: string): void {
        const currentEmoji = getReactedEmoji()
        if (currentEmoji === emoji) remove(reactedKey.value)
        else setString(reactedKey.value, emoji)
    }

    async function toggleReaction(emoji: string): Promise<void> {
        if (!reactApi) return
        try {
            await reactApi(emoji)
            setReactedEmoji(emoji)
        } catch (e) {
            console.error('Reaction error:', e)
        }
    }

    return {
        getReactedEmoji,
        hasReacted,
        setReactedEmoji,
        toggleReaction
    }
}
