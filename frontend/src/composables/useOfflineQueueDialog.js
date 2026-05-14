import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
import { offlineQueue } from '@/utils/offlineQueue'

export function useOfflineQueueDialog({ form, userStore }) {
  const offlineList = ref([])
  const offlineDialogVisible = ref(false)

  function openOfflineBox() {
    offlineList.value = offlineQueue.get()
    offlineDialogVisible.value = true
  }

  function removeOfflineItem(id) {
    offlineQueue.remove(id)
    offlineList.value = offlineQueue.get()
    if (offlineList.value.length === 0) offlineDialogVisible.value = false
  }

  function editOfflineItem(item) {
    form.content = item.content || ''
    form.theme = item.theme || 'default'
    form.mood = item.mood || '0'
    form.authorAlias = item.authorAlias || userStore.alias
    removeOfflineItem(item.id)
    ElMessage.success('已载入编辑区，修改后可再次发送')
  }

  async function syncOfflineQueue() {
    await offlineQueue.sync(api)
    offlineList.value = offlineQueue.get()
    if (offlineList.value.length === 0) offlineDialogVisible.value = false
  }

  return {
    offlineList,
    offlineDialogVisible,
    openOfflineBox,
    editOfflineItem,
    removeOfflineItem,
    syncOfflineQueue
  }
}
