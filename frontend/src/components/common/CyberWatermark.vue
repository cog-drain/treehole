<template>
  <div 
    ref="watermarkRef" 
    class="watermark-overlay"
    aria-hidden="true"
  ></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getOrGenerateIdentity } from '@/utils/identity'
import { useUiStore } from '@/stores/ui'

const watermarkRef = ref(null)
let observer = null
const uiStore = useUiStore()

const createWatermark = () => {
  const identity = getOrGenerateIdentity()
  if (!identity || !identity.userId) return // 容错处理
  const userId = identity.userId.substring(0, 8) 
  
  const canvas = document.createElement('canvas')
  canvas.width = 300
  canvas.height = 200
  
  const ctx = canvas.getContext('2d')
  ctx.rotate(-20 * Math.PI / 180)
  ctx.font = '12px Courier New'
  
  // 关键：使用极低透明度的颜色，肉眼几乎不可见
  // 在暗色模式下使用亮色，亮色模式下使用暗色
  const isDark = uiStore.isDark
  ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.006)' : 'rgba(0, 0, 0, 0.006)'
  
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(`ID: ${userId}`, 30, 100)
  ctx.fillText(`${new Date().toLocaleDateString()}`, 30, 120)

  if (watermarkRef.value) {
    watermarkRef.value.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`
  }
}

// 防篡改逻辑：监控 DOM 变化
const initProtection = () => {
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // 如果水印层被修改或移除，立即重建
      if (mutation.type === 'childList' || mutation.type === 'attributes') {
        const target = watermarkRef.value
        if (!target || !document.body.contains(target)) {
          window.location.reload() // 暴力重载作为最终防御
        } else {
          // 检查样式是否被篡改（如隐藏、改透明度）
          const style = window.getComputedStyle(target)
          if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.1) {
             createWatermark() // 恢复
          }
        }
      }
    })
  })

  observer.observe(document.body, {
    childList: true,
    attributes: true,
    subtree: true
  })
}

onMounted(() => {
  createWatermark()
  initProtection()
  // 窗口缩放时重绘以保持覆盖
  window.addEventListener('resize', createWatermark)
})

watch(() => uiStore.isDark, () => {
  createWatermark()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  window.removeEventListener('resize', createWatermark)
})
</script>

<style scoped>
.watermark-overlay {
  position: fixed;
  inset: 0;
  z-index: 1500;
  pointer-events: none; /* 确保不影响点击交互 */
  background-repeat: repeat;
  opacity: 1;
  transition: none;
}
</style>
