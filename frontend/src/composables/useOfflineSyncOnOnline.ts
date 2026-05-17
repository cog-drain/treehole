import { messageApi } from '@/api/modules/message'
import { offlineQueue } from '@/utils/offlineQueue'

export function useOfflineSyncOnOnline() {
    let started = false

    function syncOfflineQueue(): void {
        offlineQueue.sync(messageApi)
    }

    function startOfflineSync(): void {
        if (started) return
        started = true
        window.addEventListener('online', syncOfflineQueue)
        if (window.navigator.onLine) syncOfflineQueue()
    }

    function stopOfflineSync(): void {
        if (!started) return
        started = false
        window.removeEventListener('online', syncOfflineQueue)
    }

    return {
        startOfflineSync,
        stopOfflineSync
    }
}
