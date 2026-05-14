import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

export function useComposeForm() {
  const form = reactive({ authorAlias: '', content: '', mood: '', theme: 'default' })
  const showTonePanel = ref(false)
  const toneSelectorRef = ref(null)
  const imageFile = ref(null)
  const imagePreview = ref('')
  const isConfessionMode = ref(false)
  const clockNow = ref(new Date())
  const isMidnight = computed(() => {
    const hour = clockNow.value.getHours()
    return hour >= 0 && hour < 4
  })

  function onImageSelect(event) {
    const file = event.target.files[0]
    if (file) {
      imageFile.value = file
      imagePreview.value = URL.createObjectURL(file)
    }
  }

  function clearImage() {
    imageFile.value = null
    imagePreview.value = ''
  }

  function handlePaste(event) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile()
        if (file) {
          imageFile.value = file
          imagePreview.value = URL.createObjectURL(file)
          ElMessage.success('已从剪贴板捕获图片 📸')
        }
      }
    }
  }

  function handleClickOutside(event) {
    if (showTonePanel.value && toneSelectorRef.value && !toneSelectorRef.value.contains(event.target)) {
      showTonePanel.value = false
    }
  }

  function tickClock() {
    clockNow.value = new Date()
  }

  return {
    form,
    showTonePanel,
    toneSelectorRef,
    imageFile,
    imagePreview,
    isConfessionMode,
    clockNow,
    isMidnight,
    onImageSelect,
    clearImage,
    handlePaste,
    handleClickOutside,
    tickClock
  }
}
