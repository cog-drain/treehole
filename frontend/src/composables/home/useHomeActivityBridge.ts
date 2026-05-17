import { type Ref } from 'vue'
import { useActivityTracking } from '@/composables/useActivityTracking'
import { ACTIVITY_MODULES } from '@/constants/activityEvents'
import type { ActivityEvent, ActivityModule } from '@/types'

interface ActivityBridgeHandlers {
    setActivityModule: (module: ActivityModule) => void
    trackActivity: (event: ActivityEvent, module?: ActivityModule) => void
}

export interface HomeActivityBridgeOptions {
    viewMode: Ref<'list' | 'graph'>
    storeVisible: () => boolean
    openNotificationCenter: () => Promise<void>
    emitOpenStore: () => void
}

export function useHomeActivityBridge({
    viewMode,
    storeVisible,
    openNotificationCenter: openNotifications,
    emitOpenStore
}: HomeActivityBridgeOptions) {
    let handlers: ActivityBridgeHandlers | null = null

    function resolveActivityModule(): ActivityModule {
        if (storeVisible()) return ACTIVITY_MODULES.shop
        return viewMode.value === 'graph' ? ACTIVITY_MODULES.graph : ACTIVITY_MODULES.feed
    }

    function setActivityModule(module: ActivityModule): void {
        handlers?.setActivityModule(module)
    }

    function trackActivity(event: ActivityEvent, module?: ActivityModule): void {
        handlers?.trackActivity(event, module)
    }

    const activityTracking = useActivityTracking({
        viewMode,
        storeVisible,
        resolveActivityModule,
        setActivityModule: module => setActivityModule(module as ActivityModule),
        trackActivity: (event, module) => trackActivity(event as ActivityEvent, module as ActivityModule | undefined),
        openNotificationCenter: openNotifications
    })

    function setActivityHandlers(nextHandlers: ActivityBridgeHandlers): void {
        handlers = nextHandlers
    }

    function openStore(): void {
        activityTracking.openStore()
        emitOpenStore()
    }

    return {
        setViewMode: activityTracking.setViewMode as (mode: 'list' | 'graph') => void,
        openStore,
        openNotificationCenter: activityTracking.openNotificationCenter,
        setActivityHandlers,
        setActivityModule,
        trackActivity,
        resolveActivityModule
    }
}
