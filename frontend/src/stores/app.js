/**
 * 全局应用 Store — 统一管理主题、能量、已购商品
 * 
 * 替代 App.vue 中 7 个分散的 localStorage 调用
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // ── 主题 ──
  const isDark = ref(false)

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
    isDark.value = localStorage.getItem('theme') === 'dark'
    if (isDark.value) document.documentElement.classList.add('dark')

    energy.value = parseInt(localStorage.getItem('treehole_energy') || '1000')
    ownedItems.value = JSON.parse(localStorage.getItem('treehole_owned_items') || '[]')
    lainEnabled.value = localStorage.getItem('treehole_lain_enabled') === 'true'
    p5EffectEnabled.value = localStorage.getItem('treehole_p5_enabled') === 'true'
    p5AoaEnabled.value = localStorage.getItem('treehole_p5_aoa_enabled') === 'true'
    alterEgoEnabled.value = localStorage.getItem('treehole_alter_ego_enabled') === 'true'
    camoEnabled.value = localStorage.getItem('treehole_camo_enabled') === 'true'
  }

  // ── 持久化 ──
  function persist() {
    localStorage.setItem('treehole_energy', energy.value.toString())
    localStorage.setItem('treehole_owned_items', JSON.stringify(ownedItems.value))
    localStorage.setItem('treehole_lain_enabled', lainEnabled.value.toString())
    localStorage.setItem('treehole_p5_enabled', p5EffectEnabled.value.toString())
    localStorage.setItem('treehole_p5_aoa_enabled', p5AoaEnabled.value.toString())
    localStorage.setItem('treehole_alter_ego_enabled', alterEgoEnabled.value.toString())
    localStorage.setItem('treehole_camo_enabled', camoEnabled.value.toString())
  }

  // ── 切换主题 ──
  function toggleDark() {
    isDark.value = !isDark.value
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
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
    isDark, energy, ownedItems,
    lainEnabled, p5EffectEnabled, p5AoaEnabled, alterEgoEnabled, camoEnabled,
    init, toggleDark, addEnergy, buy, toggle, persist
  }
})
