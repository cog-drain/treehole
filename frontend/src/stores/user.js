/**
 * 用户身份 Store — 统一管理 UUID、昵称、头像色
 * 
 * 替代原来散落在以下位置的逻辑：
 * - src/utils/identity.js (昵称生成)
 * - src/api/index.js (UUID 生成)
 * - Home.vue form.authorAlias (昵称绑定)
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { getString, setString } from '@/utils/storage'
import { generateRandomAlias, getOrCreateUserIdentity } from '@/utils/clientIdentity'

export const useUserStore = defineStore('user', () => {
  // ── 核心状态 ──
  const userId = ref('')
  const alias = ref('')

  // ── 初始化 ──
  function init() {
    // 1. UUID 身份
    const identity = getOrCreateUserIdentity()
    userId.value = identity.userId

    // 2. 昵称
    const saved = getString(STORAGE_KEYS.alias)
    if (saved) {
      alias.value = saved
    } else {
      refreshAlias()
    }
  }

  // ── 生成新昵称 ──
  function refreshAlias() {
    alias.value = generateRandomAlias()
    setString(STORAGE_KEYS.alias, alias.value)
  }

  // ── 设置昵称 (手动编辑时调用) ──
  function setAlias(newAlias) {
    if (newAlias) {
      alias.value = newAlias
      setString(STORAGE_KEYS.alias, newAlias)
    }
  }

  // ── 头像颜色 ──
  function getAvatarColor(name) {
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
