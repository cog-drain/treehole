import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { ACTIVITY_EVENTS, ACTIVITY_MODULES } from '@/constants/activityEvents'
import { useHomeActivityBridge } from './useHomeActivityBridge'

describe('useHomeActivityBridge', () => {
    it('routes activity calls after handlers are registered', () => {
        const setActivityModule = vi.fn()
        const trackActivity = vi.fn()
        const bridge = useHomeActivityBridge({
            viewMode: ref('list'),
            storeVisible: () => false,
            openNotificationCenter: vi.fn(),
            emitOpenStore: vi.fn()
        })

        bridge.setActivityHandlers({ setActivityModule, trackActivity })
        bridge.setViewMode('graph')

        expect(setActivityModule).toHaveBeenCalledWith(ACTIVITY_MODULES.graph)
        expect(trackActivity).toHaveBeenCalledWith(ACTIVITY_EVENTS.viewGraph, ACTIVITY_MODULES.graph)
    })

    it('opens store through tracking and parent emit', () => {
        const setActivityModule = vi.fn()
        const trackActivity = vi.fn()
        const emitOpenStore = vi.fn()
        const bridge = useHomeActivityBridge({
            viewMode: ref('list'),
            storeVisible: () => false,
            openNotificationCenter: vi.fn(),
            emitOpenStore
        })

        bridge.setActivityHandlers({ setActivityModule, trackActivity })
        bridge.openStore()

        expect(setActivityModule).toHaveBeenCalledWith(ACTIVITY_MODULES.shop)
        expect(trackActivity).toHaveBeenCalledWith(ACTIVITY_EVENTS.openShop, ACTIVITY_MODULES.shop)
        expect(emitOpenStore).toHaveBeenCalled()
    })
})
