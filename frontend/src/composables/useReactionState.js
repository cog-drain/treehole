import { computed } from 'vue'
import { getString, remove, setString } from '@/utils/storage'

export function useReactionState(keyFactory, getId, reactApi) {
    const reactedKey = computed(() => keyFactory(getId()))

    function getReactedEmoji() {
        return getString(reactedKey.value, '')
    }

    function hasReacted(emoji) {
        return getReactedEmoji() === emoji
    }

    function setReactedEmoji(emoji) {
        const currentEmoji = getReactedEmoji()
        if (currentEmoji === emoji) remove(reactedKey.value)
        else setString(reactedKey.value, emoji)
    }

    async function toggleReaction(emoji) {
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
