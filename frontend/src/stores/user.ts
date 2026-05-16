/**
 * 用户身份 Store — 统一管理 UUID、昵称、头像色
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { getString, setString } from '@/utils/storage'
import { generateRandomAlias, getOrCreateUserIdentity } from '@/utils/clientIdentity'

export const useUserStore = defineStore('user', () => {
  const userId = ref('')
  const alias = ref('')

  function init(): void {
    const identity = getOrCreateUserIdentity()
    userId.value = identity.userId

    const saved = getString(STORAGE_KEYS.alias)
    if (saved) {
      alias.value = saved
    } else {
      refreshAlias()
    }
  }

  function refreshAlias(): void {
    alias.value = generateRandomAlias()
    setString(STORAGE_KEYS.alias, alias.value)
  }

  function setAlias(newAlias: string): void {
    if (newAlias) {
      alias.value = newAlias
      setString(STORAGE_KEYS.alias, newAlias)
    }
  }

  function getAvatarColor(name?: string): string {
    const str = name || alias.value
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
    return '#' + '00000'.substring(0, 6 - c.length) + c
  }

  return { userId, alias, init, refreshAlias, setAlias, getAvatarColor }
})
