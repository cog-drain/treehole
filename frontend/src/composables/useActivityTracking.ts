import { type Ref, watch } from 'vue'
import { ACTIVITY_EVENTS, ACTIVITY_MODULES } from '@/constants/activityEvents'

export interface UseActivityTrackingOptions {
    viewMode: Ref<string>
    storeVisible: () => boolean
    resolveActivityModule: () => string
    setActivityModule: (module: string) => void
    trackActivity: (event: string, module?: string) => void
    openNotificationCenter: () => Promise<void>
}

export function useActivityTracking({
    viewMode,
    storeVisible,
    resolveActivityModule,
    setActivityModule,
    trackActivity,
    openNotificationCenter
}: UseActivityTrackingOptions) {
    function setViewMode(mode: string): void {
        if (viewMode.value === mode) return
        viewMode.value = mode
        const module = mode === 'graph' ? ACTIVITY_MODULES.graph : ACTIVITY_MODULES.feed
        setActivityModule(module)
        trackActivity(mode === 'graph' ? ACTIVITY_EVENTS.viewGraph : ACTIVITY_EVENTS.viewFeed, module)
    }

    function openStore(): void {
        setActivityModule(ACTIVITY_MODULES.shop)
        trackActivity(ACTIVITY_EVENTS.openShop, ACTIVITY_MODULES.shop)
    }

    async function openNotifications(): Promise<void> {
        trackActivity('open_notifications', ACTIVITY_MODULES.feed)
        await openNotificationCenter()
    }

    watch(storeVisible, visible => {
        const module = visible ? ACTIVITY_MODULES.shop : resolveActivityModule()
        setActivityModule(module)
        if (visible) trackActivity(ACTIVITY_EVENTS.openShop, ACTIVITY_MODULES.shop)
    })

    return {
        setViewMode,
        openStore,
        openNotificationCenter: openNotifications
    }
}
