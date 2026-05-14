import { computed } from 'vue'
import { getString, remove, setString } from '@/utils/storage'

export function useReactionState(keyFactory, getId) {
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

  return {
    getReactedEmoji,
    hasReacted,
    setReactedEmoji
  }
}
