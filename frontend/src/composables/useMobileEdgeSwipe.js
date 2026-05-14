import { reactive } from 'vue'

const EDGE_SWIPE_ZONE = 28
const EDGE_SWIPE_DISTANCE = 72
const EDGE_SWIPE_MAX_VERTICAL = 80

export function useMobileEdgeSwipe({ isMobile, getMode, setMode }) {
  const edgeSwipe = reactive({ active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 })

  function resetEdgeSwipe() {
    edgeSwipe.active = false
    edgeSwipe.startX = 0
    edgeSwipe.startY = 0
    edgeSwipe.currentX = 0
    edgeSwipe.currentY = 0
  }

  function handleEdgeSwipeStart(event) {
    if (!isMobile.value || getMode() !== 'graph' || event.touches.length !== 1) return
    const touch = event.touches[0]
    if (touch.clientX > EDGE_SWIPE_ZONE) return
    edgeSwipe.active = true
    edgeSwipe.startX = touch.clientX
    edgeSwipe.startY = touch.clientY
    edgeSwipe.currentX = touch.clientX
    edgeSwipe.currentY = touch.clientY
  }

  function handleEdgeSwipeMove(event) {
    if (!edgeSwipe.active || event.touches.length !== 1) return
    const touch = event.touches[0]
    edgeSwipe.currentX = touch.clientX
    edgeSwipe.currentY = touch.clientY
  }

  function handleEdgeSwipeEnd() {
    if (!edgeSwipe.active) return
    const deltaX = edgeSwipe.currentX - edgeSwipe.startX
    const deltaY = Math.abs(edgeSwipe.currentY - edgeSwipe.startY)
    if (deltaX >= EDGE_SWIPE_DISTANCE && deltaY <= EDGE_SWIPE_MAX_VERTICAL) {
      setMode('list')
    }
    resetEdgeSwipe()
  }

  return {
    resetEdgeSwipe,
    handleEdgeSwipeStart,
    handleEdgeSwipeMove,
    handleEdgeSwipeEnd
  }
}
