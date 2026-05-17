import { ref } from 'vue'

const MOBILE_BREAKPOINT = 768

export function useViewport() {
    const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT)

    function checkMobile(): void {
        isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
    }

    function startViewportListeners(): void {
        checkMobile()
        window.addEventListener('resize', checkMobile)
    }

    function stopViewportListeners(): void {
        window.removeEventListener('resize', checkMobile)
    }

    return {
        isMobile,
        checkMobile,
        startViewportListeners,
        stopViewportListeners
    }
}
