import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  DEFAULT_MESSAGE_SKIN,
  getAvailableMessageSkins
} from '@/utils/messageSkins'

const COLOR_MODE_KEY = 'theme'
const MESSAGE_SKIN_KEY = 'treehole_message_skin'

function applyColorModeClass(colorMode) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', colorMode === 'dark')
}

export const useUiStore = defineStore('ui', () => {
  const colorMode = ref('light')
  const selectedMessageSkin = ref(DEFAULT_MESSAGE_SKIN)
  const initialized = ref(false)

  const isDark = computed(() => colorMode.value === 'dark')
  const availableMessageSkins = computed(() => getAvailableMessageSkins(colorMode.value))

  function ensureValidMessageSkin() {
    if (!availableMessageSkins.value.includes(selectedMessageSkin.value)) {
      selectedMessageSkin.value = DEFAULT_MESSAGE_SKIN
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(MESSAGE_SKIN_KEY, selectedMessageSkin.value)
      }
    }
  }

  function init() {
    if (typeof localStorage !== 'undefined') {
      colorMode.value = localStorage.getItem(COLOR_MODE_KEY) === 'dark' ? 'dark' : 'light'
      selectedMessageSkin.value = localStorage.getItem(MESSAGE_SKIN_KEY) || DEFAULT_MESSAGE_SKIN
    }

    applyColorModeClass(colorMode.value)
    ensureValidMessageSkin()
    initialized.value = true
  }

  function setColorMode(mode) {
    colorMode.value = mode === 'dark' ? 'dark' : 'light'
    applyColorModeClass(colorMode.value)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(COLOR_MODE_KEY, colorMode.value)
    }
    ensureValidMessageSkin()
  }

  function toggleColorMode() {
    setColorMode(isDark.value ? 'light' : 'dark')
  }

  function setMessageSkin(skin) {
    selectedMessageSkin.value = skin || DEFAULT_MESSAGE_SKIN
    ensureValidMessageSkin()
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(MESSAGE_SKIN_KEY, selectedMessageSkin.value)
    }
  }

  return {
    colorMode,
    selectedMessageSkin,
    availableMessageSkins,
    initialized,
    isDark,
    init,
    setColorMode,
    toggleColorMode,
    setMessageSkin
  }
})
