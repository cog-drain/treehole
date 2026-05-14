/**
 * 全局应用 Store — 统一管理主题、能量、已购商品
 * 
 * 替代 App.vue 中 7 个分散的 localStorage 调用
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { STORAGE_KEYS } from '@/constants/storageKeys'

export const useAppStore = defineStore('app', () => {
  // ── 能量商店 ──
  const energy = ref(1000)
  const ownedItems = ref([])

  // ── 动效开关 ──
  const lainEnabled = ref(false)
  const p5EffectEnabled = ref(false)
  const p5AoaEnabled = ref(false)
  const alterEgoEnabled = ref(false)
  const camoEnabled = ref(false)

  // ── 初始化 ──
  function init() {
    document.documentElement.classList.remove('dark')
    localStorage.removeItem('theme')

    energy.value = parseInt(localStorage.getItem(STORAGE_KEYS.energy) || '1000')
    ownedItems.value = JSON.parse(localStorage.getItem(STORAGE_KEYS.ownedItems) || '[]')
    lainEnabled.value = localStorage.getItem(STORAGE_KEYS.lainEnabled) === 'true'
    p5EffectEnabled.value = localStorage.getItem(STORAGE_KEYS.p5Enabled) === 'true'
    p5AoaEnabled.value = localStorage.getItem(STORAGE_KEYS.p5AoaEnabled) === 'true'
    alterEgoEnabled.value = localStorage.getItem(STORAGE_KEYS.alterEgoEnabled) === 'true'
    camoEnabled.value = localStorage.getItem(STORAGE_KEYS.camoEnabled) === 'true'
  }

  // ── 持久化 ──
  function persist() {
    localStorage.setItem(STORAGE_KEYS.energy, energy.value.toString())
    localStorage.setItem(STORAGE_KEYS.ownedItems, JSON.stringify(ownedItems.value))
    localStorage.setItem(STORAGE_KEYS.lainEnabled, lainEnabled.value.toString())
    localStorage.setItem(STORAGE_KEYS.p5Enabled, p5EffectEnabled.value.toString())
    localStorage.setItem(STORAGE_KEYS.p5AoaEnabled, p5AoaEnabled.value.toString())
    localStorage.setItem(STORAGE_KEYS.alterEgoEnabled, alterEgoEnabled.value.toString())
    localStorage.setItem(STORAGE_KEYS.camoEnabled, camoEnabled.value.toString())
  }

  // ── 增加能量 ──
  function addEnergy(amount) {
    energy.value += amount
    persist()
  }

  // ── 购买商品 ──
  function buy(id, cost) {
    if (energy.value < cost) return false
    energy.value -= cost
    ownedItems.value.push(id)

    // 购买后自动启用
    if (id === 'p5_effect') p5EffectEnabled.value = true
    if (id === 'p5_all_out_attack') p5AoaEnabled.value = true
    if (id === 'alter_ego') alterEgoEnabled.value = true
    if (id === 'lain_intro') lainEnabled.value = true
    if (id === 'camo_effect') camoEnabled.value = true

    persist()
    return true
  }

  // ── 切换开关 ──
  function toggle(key) {
    const map = {
      lain: lainEnabled,
      p5: p5EffectEnabled,
      p5Aoa: p5AoaEnabled,
      alterEgo: alterEgoEnabled,
      camo: camoEnabled
    }
    if (map[key]) {
      map[key].value = !map[key].value
      persist()
    }
  }

  return {
    energy, ownedItems,
    lainEnabled, p5EffectEnabled, p5AoaEnabled, alterEgoEnabled, camoEnabled,
    init, addEnergy, buy, toggle, persist
  }
})
