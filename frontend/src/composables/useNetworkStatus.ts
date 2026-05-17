import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
import { offlineQueue, offlineQueueCount } from '@/utils/offlineQueue'

export function useNetworkStatus() {
    const isOnline = ref(navigator.onLine)
    let started = false

    function handleOnline(): void {
        isOnline.value = true
        if (offlineQueueCount.value > 0) {
            offlineQueue.sync(api)
        }
    }

    function handleOffline(): void {
        isOnline.value = false
        ElMessage.warning('你已进入离线回声舱')
    }

    function startNetworkListeners(): void {
        if (started) return
        started = true
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
    }

    function stopNetworkListeners(): void {
        if (!started) return
        started = false
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
    }

    return {
        isOnline,
        startNetworkListeners,
        stopNetworkListeners
    }
}
