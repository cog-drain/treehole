import api from '@/api'
import { offlineQueue } from '@/utils/offlineQueue'

export function useOfflineSyncOnOnline() {
  function syncOfflineQueue() {
    offlineQueue.sync(api)
  }

  function startOfflineSync() {
    window.addEventListener('online', syncOfflineQueue)
    if (window.navigator.onLine) syncOfflineQueue()
  }

  function stopOfflineSync() {
    window.removeEventListener('online', syncOfflineQueue)
  }

  return {
    startOfflineSync,
    stopOfflineSync
  }
}
