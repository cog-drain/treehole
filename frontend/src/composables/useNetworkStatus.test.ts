import { describe, expect, it, vi } from 'vitest'
import { useNetworkStatus } from './useNetworkStatus'

describe('useNetworkStatus', () => {
    it('reads initial online state from navigator', () => {
        vi.stubGlobal('navigator', { onLine: true })
        const { isOnline } = useNetworkStatus()
        expect(isOnline.value).toBe(true)
    })

    it('startNetworkListeners adds online and offline listeners', () => {
        const addSpy = vi.fn()
        vi.stubGlobal('window', { addEventListener: addSpy })

        const { startNetworkListeners } = useNetworkStatus()
        startNetworkListeners()

        expect(addSpy).toHaveBeenCalledWith('online', expect.any(Function))
        expect(addSpy).toHaveBeenCalledWith('offline', expect.any(Function))
        expect(addSpy).toHaveBeenCalledTimes(2)
    })

    it('stopNetworkListeners removes online and offline listeners', () => {
        const removeSpy = vi.fn()
        vi.stubGlobal('window', {
            addEventListener: vi.fn(),
            removeEventListener: removeSpy
        })

        const { startNetworkListeners, stopNetworkListeners } = useNetworkStatus()
        startNetworkListeners()
        stopNetworkListeners()

        expect(removeSpy).toHaveBeenCalledWith('online', expect.any(Function))
        expect(removeSpy).toHaveBeenCalledWith('offline', expect.any(Function))
        expect(removeSpy).toHaveBeenCalledTimes(2)
    })

    it('startNetworkListeners is idempotent', () => {
        const addSpy = vi.fn()
        vi.stubGlobal('window', { addEventListener: addSpy })

        const { startNetworkListeners } = useNetworkStatus()
        startNetworkListeners()
        startNetworkListeners()

        expect(addSpy).toHaveBeenCalledTimes(2)
    })
})
