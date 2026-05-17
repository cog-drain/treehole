import { describe, expect, it, vi } from 'vitest'
import { useHomeRuntime } from './useHomeRuntime'

function createRuntime(overrides = {}) {
    const calls: string[] = []
    const fn = (name: string) =>
        vi.fn(() => {
            calls.push(name)
        })
    const runtime = useHomeRuntime({
        addDocumentClickListener: fn('add-click'),
        removeDocumentClickListener: fn('remove-click'),
        initApp: fn('init-app'),
        initOfflineQueue: fn('init-offline'),
        startViewportListeners: fn('start-viewport'),
        stopViewportListeners: fn('stop-viewport'),
        startNetworkListeners: fn('start-network'),
        stopNetworkListeners: fn('stop-network'),
        startParticles: fn('start-particles'),
        stopWatchingTheme: fn('stop-particles'),
        tickClock: fn('tick-clock'),
        initUser: fn('init-user'),
        getUserId: () => 'u1',
        getUserAlias: () => 'alias',
        setAuthorAlias: vi.fn((alias: string) => {
            calls.push(`alias:${alias}`)
        }),
        connectRealtime: vi.fn((userId: string) => {
            calls.push(`connect:${userId}`)
        }),
        disconnectRealtime: fn('disconnect'),
        fetchUnreadCount: fn('fetch-unread'),
        setInitialActivityModule: fn('set-module'),
        trackInitialActivity: fn('track-initial'),
        fetchMessages: fn('fetch-messages'),
        fetchTrending: fn('fetch-trending'),
        fetchTagSubscriptions: fn('fetch-tags'),
        fetchOnlineStats: fn('fetch-online'),
        initialFeedDelayMs: 10,
        onlineStatsIntervalMs: 20,
        ...overrides
    })

    return { runtime, calls }
}

describe('useHomeRuntime', () => {
    it('starts runtime dependencies once and schedules feed bootstrap', () => {
        vi.useFakeTimers()
        const { runtime, calls } = createRuntime()

        runtime.startHomeRuntime()
        runtime.startHomeRuntime()
        vi.advanceTimersByTime(10)

        expect(calls.filter(call => call === 'add-click')).toHaveLength(1)
        expect(calls).toContain('init-app')
        expect(calls).toContain('init-offline')
        expect(calls).toContain('alias:alias')
        expect(calls).toContain('connect:u1')
        expect(calls).toContain('fetch-unread')
        expect(calls).toContain('set-module')
        expect(calls).toContain('track-initial')
        expect(calls).toContain('fetch-online')
        expect(calls).toContain('fetch-messages')
        expect(calls).toContain('fetch-trending')
        expect(calls).toContain('fetch-tags')

        vi.useRealTimers()
    })

    it('stops listeners and clears scheduled work idempotently', () => {
        vi.useFakeTimers()
        const { runtime, calls } = createRuntime()

        runtime.startHomeRuntime()
        runtime.stopHomeRuntime()
        runtime.stopHomeRuntime()
        vi.advanceTimersByTime(100)

        expect(calls.filter(call => call === 'remove-click')).toHaveLength(1)
        expect(calls.filter(call => call === 'disconnect')).toHaveLength(1)
        expect(calls.filter(call => call === 'stop-viewport')).toHaveLength(1)
        expect(calls.filter(call => call === 'stop-network')).toHaveLength(1)
        expect(calls.filter(call => call === 'stop-particles')).toHaveLength(1)
        expect(calls).not.toContain('fetch-messages')

        vi.useRealTimers()
    })
})
