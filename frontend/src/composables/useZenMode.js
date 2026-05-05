/**
 * 禅定模式 Composable — 从 Home.vue 中提取的音频控制逻辑
 */
import { ref } from 'vue'

export function useZenMode() {
  const isZenMode = ref(false)
  const showZenMenu = ref(false)
  const currentZenSound = ref(null)
  const zenVolume = ref(80)

  const zenSounds = [
    { id: 'shiki', name: '四季之歌·悠然', icon: '🍃', url: '/audio/shiki_no_uta.mp3' },
    { id: 'angel', name: '堕天使·梦幻', icon: '🧚', url: '/audio/fallen_angel.mp3' },
    { id: 'zen', name: '禅定旋律', icon: '🧘', url: '/audio/zen.mp3' }
  ]

  let zenAudio = new Audio()
  zenAudio.loop = true

  function updateZenVolume() {
    if (zenAudio) zenAudio.volume = zenVolume.value / 100
  }

  function fadeAudio(targetVolume, duration = 1000) {
    if (!zenAudio) return Promise.resolve()
    return new Promise(resolve => {
      const startVolume = zenAudio.volume
      const steps = 30
      const stepValue = (targetVolume - startVolume) / steps
      let current = 0
      const timer = setInterval(() => {
        current++
        zenAudio.volume = Math.max(0, Math.min(1, startVolume + (stepValue * current)))
        if (current >= steps) {
          clearInterval(timer)
          if (targetVolume === 0) zenAudio.pause()
          resolve()
        }
      }, duration / steps)
    })
  }

  // 完全停止（视觉+听觉）
  function stopZenMode() {
    isZenMode.value = false
    showZenMenu.value = false
    fadeAudio(0).then(() => currentZenSound.value = null)
  }

  // 仅退出视觉（保留听觉）
  function minimizeZen() {
    isZenMode.value = false
    showZenMenu.value = false
  }

  // 返回视觉（恢复石头界面）
  function returnToZen() {
    isZenMode.value = true
    showZenMenu.value = false
  }

  function selectZenSound(sound) {
    if (currentZenSound.value?.id === sound.id) { 
      // 如果点击正在播放的音乐，视为“返回石头界面”或“重新打开全屏”
      isZenMode.value = true
      showZenMenu.value = false
      return 
    }

    isZenMode.value = true
    const performPlay = () => {
      currentZenSound.value = sound
      zenAudio.src = sound.url
      zenAudio.volume = 0
      zenAudio.load()
      zenAudio.oncanplay = () => {
        zenAudio.play()
          .then(() => fadeAudio(zenVolume.value / 100))
          .catch(e => console.warn('Zen Audio Play Blocked:', e))
      }
    }

    if (currentZenSound.value) fadeAudio(0, 300).then(performPlay)
    else performPlay()
  }

  return {
    isZenMode, showZenMenu, currentZenSound, zenVolume, zenSounds,
    updateZenVolume, stopZenMode, minimizeZen, returnToZen, selectZenSound
  }
}
