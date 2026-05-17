import { ref, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { messageApi } from '@/api/modules/message'
import { offlineQueue } from '@/utils/offlineQueue'
import type { OfflineQueueItem } from '@/utils/offlineQueue'

interface DialogForm {
    content: string
    theme: string
    mood: string
    authorAlias: string
}

interface DialogUserStore {
    alias: string
}

interface DialogParams {
    form: DialogForm
    userStore: DialogUserStore
}

export { type OfflineQueueItem }

export function useOfflineQueueDialog({ form, userStore }: DialogParams) {
    const offlineList: Ref<OfflineQueueItem[]> = ref([])
    const offlineDialogVisible: Ref<boolean> = ref(false)

    function openOfflineBox(): void {
        offlineList.value = offlineQueue.get()
        offlineDialogVisible.value = true
    }

    function removeOfflineItem(id: string): void {
        offlineQueue.remove(id)
        offlineList.value = offlineQueue.get()
        if (offlineList.value.length === 0) offlineDialogVisible.value = false
    }

    function editOfflineItem(item: OfflineQueueItem): void {
        form.content = (item.content as string) || ''
        form.theme = (item.theme as string) || 'default'
        form.mood = (item.mood as string) || '0'
        form.authorAlias = item.authorAlias || userStore.alias
        removeOfflineItem(item.id)
        ElMessage.success('已载入编辑区，修改后可再次发送')
    }

    async function syncOfflineQueue(): Promise<void> {
        await offlineQueue.sync(messageApi)
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
