import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api, { pickBottle, returnBottle, throwBottle } from '@/api'

export function useDriftBottle({ userStore, appStore, form }) {
  const bottleVisible = ref(false)
  const bottleState = ref('init')
  const newBottleContent = ref('')
  const pickedBottle = ref(null)
  const replyContent = ref('')
  const replied = ref(false)

  function openBottleCenter() {
    bottleVisible.value = true
    bottleState.value = 'init'
    newBottleContent.value = ''
    replyContent.value = ''
    replied.value = false
  }

  async function handleThrowBottle(content) {
    try {
      await throwBottle({
        content: content || newBottleContent.value,
        authorAlias: userStore.alias,
        theme: form.theme || 'default'
      })
      ElMessage.success('瓶子已随海浪飘向远方... (获得 5 ⚡)')
      appStore.addEnergy(5)
      bottleVisible.value = false
    } catch {}
  }

  async function handlePickBottle() {
    bottleState.value = 'picking'
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const res = await pickBottle()
      if (res.data) {
        pickedBottle.value = res.data
        bottleState.value = 'picked'
      } else {
        ElMessage.info('海面上空荡荡的')
        bottleState.value = 'init'
      }
    } catch {
      bottleState.value = 'init'
    }
  }

  async function handleReplyBottle(content) {
    const finalContent = content || replyContent.value
    if (!finalContent?.trim()) return
    try {
      await api.replyBottle(pickedBottle.value.id, finalContent, userStore.alias)
      ElMessage.success('你的回信已顺着海流出发 ✨ (获得 5 ⚡)')
      appStore.addEnergy(5)
      bottleVisible.value = false
    } catch {}
  }

  async function handleReturnBottle() {
    try {
      await returnBottle(pickedBottle.value.id)
      ElMessage.success('瓶子已重回大海的怀抱')
      bottleVisible.value = false
    } catch {}
  }

  return {
    bottleVisible,
    bottleState,
    newBottleContent,
    pickedBottle,
    replyContent,
    replied,
    openBottleCenter,
    handleThrowBottle,
    handlePickBottle,
    handleReplyBottle,
    handleReturnBottle
  }
}
