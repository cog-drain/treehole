import { ElNotification } from 'element-plus'
import { shallowRef } from 'vue'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { getJson, setJson } from '@/utils/storage'

const QUEUE_KEY = STORAGE_KEYS.offlineMessages

interface OfflineMessagePayload {
    content: string
    authorAlias?: string
    [key: string]: unknown
}

export interface OfflineQueueItem extends OfflineMessagePayload {
    timestamp: number
    id: string
}

interface OfflineSyncApi {
    publishMessage(data: OfflineMessagePayload): Promise<unknown>
}

export const offlineQueueCount = shallowRef(0)

export const offlineQueue = {
    init(): void {
        offlineQueueCount.value = this.get().length
    },

    get(): OfflineQueueItem[] {
        return getJson<OfflineQueueItem[]>(QUEUE_KEY, [])
    },

    push(data: OfflineMessagePayload): void {
        const queue = this.get()
        if (queue.some(item => item.content === data.content && item.authorAlias === data.authorAlias)) {
            return
        }
        queue.push({
            ...data,
            timestamp: Date.now(),
            id: Math.random().toString(36).substring(2, 9)
        })
        setJson(QUEUE_KEY, queue)
        offlineQueueCount.value = queue.length

        ElNotification({
            title: '离线模式',
            message: '网络已断开，留言已暂存至本地，将在恢复后自动发送。',
            type: 'warning',
            duration: 5000
        })
    },

    remove(id: string): void {
        const queue = this.get().filter(item => item.id !== id)
        setJson(QUEUE_KEY, queue)
        offlineQueueCount.value = queue.length
    },

    async sync(api: OfflineSyncApi): Promise<void> {
        const queue = this.get()
        if (queue.length === 0) {
            offlineQueueCount.value = 0
            return
        }

        offlineQueueCount.value = queue.length

        ElNotification({
            title: '同步中',
            message: `检测到网络恢复，正在尝试同步 ${queue.length} 条离线留言...`,
            type: 'info'
        })

        const remaining: OfflineQueueItem[] = []
        for (const item of queue) {
            try {
                const { id: _id, timestamp: _timestamp, ...payload } = item

                await new Promise(resolve => setTimeout(resolve, 300))

                await api.publishMessage(payload)
            } catch (err) {
                console.error('Offline sync failed for item:', item, err)
                remaining.push(item)
            }
        }

        setJson(QUEUE_KEY, remaining)
        offlineQueueCount.value = remaining.length

        if (remaining.length === 0) {
            ElNotification({
                title: '同步成功',
                message: '所有离线留言已成功投入树洞！',
                type: 'success'
            })
        } else {
            ElNotification({
                title: '同步部分失败',
                message: '部分留言未能同步，请检查服务器状态。',
                type: 'error'
            })
        }
    }
}
