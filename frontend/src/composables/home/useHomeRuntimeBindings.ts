import { useHomeRuntime } from '@/composables/useHomeRuntime'
import { ACTIVITY_EVENTS, ACTIVITY_MODULES } from '@/constants/activityEvents'
import type { ActivityModule } from '@/types'

export interface HomeRuntimeBindingsOptions {
    addDocumentClickListener: () => void
    removeDocumentClickListener: () => void
    initApp: () => void
    initOfflineQueue: () => void
    startViewportListeners: () => void
    stopViewportListeners: () => void
    startNetworkListeners: () => void
    stopNetworkListeners: () => void
    startParticles: () => void
    stopWatchingTheme: () => void
    tickClock: () => void
    initUser: () => void
    getUserId: () => string
    getUserAlias: () => string
    setAuthorAlias: (alias: string) => void
    connectRealtime: (userId: string) => void
    disconnectRealtime: () => void
    fetchUnreadCount: () => void | Promise<void>
    setActivityModule: (module: ActivityModule) => void
    resolveActivityModule: () => ActivityModule
    trackActivity: (event: typeof ACTIVITY_EVENTS.viewFeed, module: typeof ACTIVITY_MODULES.feed) => void
    fetchMessages: () => void | Promise<void>
    fetchTrending: () => void | Promise<void>
    fetchTagSubscriptions: () => void | Promise<void>
    fetchOnlineStats: () => void | Promise<void>
    clearHighlight: () => void
}

export function useHomeRuntimeBindings({
    clearHighlight,
    setActivityModule,
    resolveActivityModule,
    trackActivity,
    ...runtimeOptions
}: HomeRuntimeBindingsOptions) {
    const { startHomeRuntime, stopHomeRuntime: stopRuntime } = useHomeRuntime({
        ...runtimeOptions,
        setInitialActivityModule: () => setActivityModule(resolveActivityModule()),
        trackInitialActivity: () => trackActivity(ACTIVITY_EVENTS.viewFeed, ACTIVITY_MODULES.feed)
    })

    function stopHomeRuntime(): void {
        stopRuntime()
        clearHighlight()
    }

    return {
        startHomeRuntime,
        stopHomeRuntime
    }
}
