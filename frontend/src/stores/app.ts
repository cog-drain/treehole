/**
 * 全局应用 Store — 统一管理主题、能量、已购商品
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { getJson, getString, remove, setJson, setString } from '@/utils/storage'

type StoreToggleKey = 'lain' | 'p5' | 'p5Aoa' | 'alterEgo' | 'camo'

export const useAppStore = defineStore('app', () => {
    const energy = ref(1000)
    const ownedItems = ref<string[]>([])

    const lainEnabled = ref(false)
    const p5EffectEnabled = ref(false)
    const p5AoaEnabled = ref(false)
    const alterEgoEnabled = ref(false)
    const camoEnabled = ref(false)

    function init(): void {
        document.documentElement.classList.remove('dark')
        remove('theme')

        energy.value = parseInt(getString(STORAGE_KEYS.energy, '1000'), 10)
        ownedItems.value = getJson<string[]>(STORAGE_KEYS.ownedItems, [])
        lainEnabled.value = getString(STORAGE_KEYS.lainEnabled) === 'true'
        p5EffectEnabled.value = getString(STORAGE_KEYS.p5Enabled) === 'true'
        p5AoaEnabled.value = getString(STORAGE_KEYS.p5AoaEnabled) === 'true'
        alterEgoEnabled.value = getString(STORAGE_KEYS.alterEgoEnabled) === 'true'
        camoEnabled.value = getString(STORAGE_KEYS.camoEnabled) === 'true'
    }

    function persist(): void {
        setString(STORAGE_KEYS.energy, String(energy.value))
        setJson(STORAGE_KEYS.ownedItems, ownedItems.value)
        setString(STORAGE_KEYS.lainEnabled, String(lainEnabled.value))
        setString(STORAGE_KEYS.p5Enabled, String(p5EffectEnabled.value))
        setString(STORAGE_KEYS.p5AoaEnabled, String(p5AoaEnabled.value))
        setString(STORAGE_KEYS.alterEgoEnabled, String(alterEgoEnabled.value))
        setString(STORAGE_KEYS.camoEnabled, String(camoEnabled.value))
    }

    function addEnergy(amount: number): void {
        energy.value += amount
        persist()
    }

    function buy(id: string, cost: number): boolean {
        if (energy.value < cost) return false
        energy.value -= cost
        ownedItems.value.push(id)

        if (id === 'p5_effect') p5EffectEnabled.value = true
        if (id === 'p5_all_out_attack') p5AoaEnabled.value = true
        if (id === 'alter_ego') alterEgoEnabled.value = true
        if (id === 'lain_intro') lainEnabled.value = true
        if (id === 'camo_effect') camoEnabled.value = true

        persist()
        return true
    }

    function toggle(key: StoreToggleKey): void {
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
        energy,
        ownedItems,
        lainEnabled,
        p5EffectEnabled,
        p5AoaEnabled,
        alterEgoEnabled,
        camoEnabled,
        init,
        addEnergy,
        buy,
        toggle,
        persist
    }
})
