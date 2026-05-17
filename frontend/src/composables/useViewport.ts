import { ref } from 'vue'

const MOBILE_BREAKPOINT = 768

export function useViewport() {
    const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT)
    let started = false

    function checkMobile(): void {
        isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
    }

    function startViewportListeners(): void {
        if (started) return
        started = true
        checkMobile()
        window.addEventListener('resize', checkMobile)
    }

    function stopViewportListeners(): void {
        if (!started) return
        started = false
        window.removeEventListener('resize', checkMobile)
    }

    return {
        isMobile,
        checkMobile,
        startViewportListeners,
        stopViewportListeners
    }
}
