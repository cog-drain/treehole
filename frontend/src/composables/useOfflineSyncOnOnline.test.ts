import { describe, expect, it, vi } from 'vitest'
import { useOfflineSyncOnOnline } from './useOfflineSyncOnOnline'

describe('useOfflineSyncOnOnline', () => {
    it('startOfflineSync adds online listener', () => {
        const addSpy = vi.fn()
        vi.stubGlobal('window', {
            addEventListener: addSpy,
            navigator: { onLine: false }
        })

        const { startOfflineSync } = useOfflineSyncOnOnline()
        startOfflineSync()

        expect(addSpy).toHaveBeenCalledWith('online', expect.any(Function))
    })

    it('stopOfflineSync removes online listener', () => {
        const addSpy = vi.fn()
        const removeSpy = vi.fn()
        vi.stubGlobal('window', {
            addEventListener: addSpy,
            removeEventListener: removeSpy,
            navigator: { onLine: false }
        })

        const { startOfflineSync, stopOfflineSync } = useOfflineSyncOnOnline()
        startOfflineSync()
        stopOfflineSync()

        expect(removeSpy).toHaveBeenCalledWith('online', expect.any(Function))
    })

    it('startOfflineSync is idempotent', () => {
        const addSpy = vi.fn()
        vi.stubGlobal('window', {
            addEventListener: addSpy,
            navigator: { onLine: false }
        })

        const { startOfflineSync } = useOfflineSyncOnOnline()
        startOfflineSync()
        startOfflineSync()

        expect(addSpy).toHaveBeenCalledTimes(1)
    })

    it('stopOfflineSync is idempotent', () => {
        const removeSpy = vi.fn()
        vi.stubGlobal('window', {
            addEventListener: vi.fn(),
            removeEventListener: removeSpy,
            navigator: { onLine: false }
        })

        const { startOfflineSync, stopOfflineSync } = useOfflineSyncOnOnline()
        startOfflineSync()
        stopOfflineSync()
        stopOfflineSync()

        expect(removeSpy).toHaveBeenCalledTimes(1)
    })
})
