import { describe, expect, it, vi } from 'vitest'
import { useViewport } from './useViewport'

describe('useViewport', () => {
    it('reads initial mobile state from window width', () => {
        vi.stubGlobal('window', { innerWidth: 320 })
        const { isMobile } = useViewport()
        expect(isMobile.value).toBe(true)
    })

    it('reads non-mobile state for wide windows', () => {
        vi.stubGlobal('window', { innerWidth: 1024 })
        const { isMobile } = useViewport()
        expect(isMobile.value).toBe(false)
    })

    it('startViewportListeners adds resize listener', () => {
        const addSpy = vi.fn()
        vi.stubGlobal('window', { innerWidth: 1024, addEventListener: addSpy })

        const { startViewportListeners } = useViewport()
        startViewportListeners()

        expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('stopViewportListeners removes resize listener', () => {
        const addSpy = vi.fn()
        const removeSpy = vi.fn()
        vi.stubGlobal('window', {
            innerWidth: 1024,
            addEventListener: addSpy,
            removeEventListener: removeSpy
        })

        const { startViewportListeners, stopViewportListeners } = useViewport()
        startViewportListeners()
        stopViewportListeners()

        expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('startViewportListeners is idempotent', () => {
        const addSpy = vi.fn()
        vi.stubGlobal('window', { innerWidth: 1024, addEventListener: addSpy })

        const { startViewportListeners } = useViewport()
        startViewportListeners()
        startViewportListeners()

        expect(addSpy).toHaveBeenCalledTimes(1)
    })
})
