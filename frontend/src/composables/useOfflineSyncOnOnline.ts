import api from '@/api'
import { offlineQueue } from '@/utils/offlineQueue'

export function useOfflineSyncOnOnline() {
  function syncOfflineQueue(): void {
    offlineQueue.sync(api)
  }

  function startOfflineSync(): void {
    window.addEventListener('online', syncOfflineQueue)
    if (window.navigator.onLine) syncOfflineQueue()
  }

  function stopOfflineSync(): void {
    window.removeEventListener('online', syncOfflineQueue)
  }

  return {
    startOfflineSync,
    stopOfflineSync
  }
}
