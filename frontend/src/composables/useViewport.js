import { ref } from 'vue'

const MOBILE_BREAKPOINT = 768

export function useViewport() {
  const isMobile = ref(window.innerWidth < MOBILE_BREAKPOINT)

  function checkMobile() {
    isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
  }

  function startViewportListeners() {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  }

  function stopViewportListeners() {
    window.removeEventListener('resize', checkMobile)
  }

  return {
    isMobile,
    checkMobile,
    startViewportListeners,
    stopViewportListeners
  }
}
