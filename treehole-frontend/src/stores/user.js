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

const ADJECTIVES = ['深海', '星际', '赛博', '荒野', '幻梦', '虚空', '极光', '迷雾', '雷鸣', '永恒']
const NOUNS = ['居民', '浪人', '访客', '幽灵', '观察者', '行者', '先驱', '诗人', '信徒', '极客']

export const useUserStore = defineStore('user', () => {
  // ── 核心状态 ──
  const userId = ref('')
  const alias = ref('')

  // ── 初始化 ──
  function init() {
    // 1. UUID 身份
    let identity = null
    try {
      identity = JSON.parse(localStorage.getItem('treehole_identity'))
    } catch { /* ignore */ }

    if (!identity?.userId) {
      // 兼容性修复：非 HTTPS 环境下 crypto.randomUUID 可能不可用
      const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      identity = { userId: newId, createdAt: Date.now() }
      localStorage.setItem('treehole_identity', JSON.stringify(identity))
    }
    userId.value = identity.userId

    // 2. 昵称
    const saved = localStorage.getItem('treehole_alias')
    if (saved) {
      alias.value = saved
    } else {
      refreshAlias()
    }
  }

  // ── 生成新昵称 ──
  function refreshAlias() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
    const id = Math.random().toString(36).substring(2, 6).toUpperCase()
    alias.value = `${adj}${noun}_${id}`
    localStorage.setItem('treehole_alias', alias.value)
  }

  // ── 设置昵称 (手动编辑时调用) ──
  function setAlias(newAlias) {
    if (newAlias) {
      alias.value = newAlias
      localStorage.setItem('treehole_alias', newAlias)
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
