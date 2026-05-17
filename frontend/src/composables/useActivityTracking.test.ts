import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useActivityTracking } from './useActivityTracking'
import { ACTIVITY_EVENTS, ACTIVITY_MODULES } from '@/constants/activityEvents'

describe('useActivityTracking', () => {
    function createOptions(overrides: Record<string, unknown> = {}) {
        const viewMode = ref('list')
        const calls: string[] = []
        const moduleCalls: string[] = []
        const activityCalls: { event: string; module?: string }[] = []

        return {
            viewMode,
            options: {
                viewMode,
                storeVisible: () => false,
                resolveActivityModule: () =>
                    viewMode.value === 'graph' ? ACTIVITY_MODULES.graph : ACTIVITY_MODULES.feed,
                setActivityModule: vi.fn((m: string) => moduleCalls.push(m)),
                trackActivity: vi.fn((event: string, mod?: string) => activityCalls.push({ event, module: mod })),
                openNotificationCenter: vi.fn(() => {
                    calls.push('open-center')
                    return Promise.resolve()
                }),
                ...overrides
            },
            calls: () => calls,
            moduleCalls: () => moduleCalls,
            activityCalls: () => activityCalls
        }
    }

    it('setViewMode switches mode and tracks activity', () => {
        const { viewMode, options, moduleCalls, activityCalls } = createOptions()
        const { setViewMode } = useActivityTracking(options)

        setViewMode('graph')
        expect(viewMode.value).toBe('graph')
        expect(moduleCalls()).toEqual([ACTIVITY_MODULES.graph])
        expect(activityCalls()).toEqual([{ event: ACTIVITY_EVENTS.viewGraph, module: ACTIVITY_MODULES.graph }])
    })

    it('setViewMode is a no-op when mode unchanged', () => {
        const { options, moduleCalls, activityCalls } = createOptions()
        const { setViewMode } = useActivityTracking(options)

        setViewMode('list')
        expect(moduleCalls()).toHaveLength(0)
        expect(activityCalls()).toHaveLength(0)
    })

    it('openStore sets shop module and tracks', () => {
        const { options, moduleCalls, activityCalls } = createOptions()
        const { openStore } = useActivityTracking(options)

        openStore()
        expect(moduleCalls()).toEqual([ACTIVITY_MODULES.shop])
        expect(activityCalls()).toEqual([{ event: ACTIVITY_EVENTS.openShop, module: ACTIVITY_MODULES.shop }])
    })

    it('openNotificationCenter tracks and delegates to opener', async () => {
        const { options, activityCalls, calls } = createOptions()
        const { openNotificationCenter } = useActivityTracking(options)

        await openNotificationCenter()
        expect(activityCalls()).toEqual([{ event: 'open_notifications', module: ACTIVITY_MODULES.feed }])
        expect(calls()).toContain('open-center')
    })

    it('watches storeVisible getter to update module on change', async () => {
        const viewMode = ref('list')
        const storeVisibleRef = ref(false)
        const moduleCalls: string[] = []
        const activityCalls: { event: string; module?: string }[] = []
        useActivityTracking({
            viewMode,
            storeVisible: () => storeVisibleRef.value,
            resolveActivityModule: () => (viewMode.value === 'graph' ? ACTIVITY_MODULES.graph : ACTIVITY_MODULES.feed),
            setActivityModule: (m: string) => moduleCalls.push(m),
            trackActivity: (event: string, mod?: string) => activityCalls.push({ event, module: mod }),
            openNotificationCenter: vi.fn()
        })

        storeVisibleRef.value = true
        await vi.waitFor(() => {
            expect(moduleCalls).toContain(ACTIVITY_MODULES.shop)
            expect(
                activityCalls.some(c => c.event === ACTIVITY_EVENTS.openShop && c.module === ACTIVITY_MODULES.shop)
            ).toBe(true)
        })
    })

    it('watches storeVisible getter to restore module when store closes', async () => {
        const viewMode = ref('graph')
        const storeVisibleRef = ref(true)
        const moduleCalls: string[] = []
        useActivityTracking({
            viewMode,
            storeVisible: () => storeVisibleRef.value,
            resolveActivityModule: () => (viewMode.value === 'graph' ? ACTIVITY_MODULES.graph : ACTIVITY_MODULES.feed),
            setActivityModule: (m: string) => moduleCalls.push(m),
            trackActivity: vi.fn(),
            openNotificationCenter: vi.fn()
        })

        storeVisibleRef.value = false
        await vi.waitFor(() => {
            expect(moduleCalls).toContain(ACTIVITY_MODULES.graph)
        })
    })
})
