export interface HomeRuntimeOptions {
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
    setInitialActivityModule: () => void
    trackInitialActivity: () => void
    fetchMessages: () => void | Promise<void>
    fetchTrending: () => void | Promise<void>
    fetchTagSubscriptions: () => void | Promise<void>
    fetchOnlineStats: () => void | Promise<void>
    initialFeedDelayMs?: number
    onlineStatsIntervalMs?: number
}

export function useHomeRuntime({
    addDocumentClickListener,
    removeDocumentClickListener,
    initApp,
    initOfflineQueue,
    startViewportListeners,
    stopViewportListeners,
    startNetworkListeners,
    stopNetworkListeners,
    startParticles,
    stopWatchingTheme,
    tickClock,
    initUser,
    getUserId,
    getUserAlias,
    setAuthorAlias,
    connectRealtime,
    disconnectRealtime,
    fetchUnreadCount,
    setInitialActivityModule,
    trackInitialActivity,
    fetchMessages,
    fetchTrending,
    fetchTagSubscriptions,
    fetchOnlineStats,
    initialFeedDelayMs = 300,
    onlineStatsIntervalMs = 5000
}: HomeRuntimeOptions) {
    let clockTimer: ReturnType<typeof globalThis.setInterval> | null = null
    let onlineStatsTimer: ReturnType<typeof globalThis.setInterval> | null = null
    let initialFeedTimer: ReturnType<typeof globalThis.setTimeout> | null = null
    let started = false

    function loadInitialFeed(): void {
        initialFeedTimer = globalThis.setTimeout(() => {
            void fetchMessages()
            void fetchTrending()
            void fetchTagSubscriptions()
            initialFeedTimer = null
        }, initialFeedDelayMs)
        void fetchOnlineStats()
        onlineStatsTimer = globalThis.setInterval(() => {
            void fetchOnlineStats()
        }, onlineStatsIntervalMs)
    }

    function startHomeRuntime(): void {
        if (started) return
        started = true

        addDocumentClickListener()
        initApp()
        initOfflineQueue()
        startViewportListeners()
        clockTimer = globalThis.setInterval(tickClock, 60000)

        initUser()
        setAuthorAlias(getUserAlias())

        connectRealtime(getUserId())
        void fetchUnreadCount()
        setInitialActivityModule()
        trackInitialActivity()

        loadInitialFeed()
        startNetworkListeners()
        startParticles()
    }

    function stopHomeRuntime(): void {
        if (!started) return
        started = false

        removeDocumentClickListener()
        disconnectRealtime()
        stopViewportListeners()
        stopWatchingTheme()
        stopNetworkListeners()
        if (clockTimer) globalThis.clearInterval(clockTimer)
        if (onlineStatsTimer) globalThis.clearInterval(onlineStatsTimer)
        if (initialFeedTimer) globalThis.clearTimeout(initialFeedTimer)
        clockTimer = null
        onlineStatsTimer = null
        initialFeedTimer = null
    }

    return {
        startHomeRuntime,
        stopHomeRuntime
    }
}
