import { ref, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { identityApi } from '@/api/modules/identity'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { setJson } from '@/utils/storage'
import { reloadPage } from '@/utils/browser'

export function useIdentityVault() {
    const showIdentityModal: Ref<boolean> = ref(false)
    const recoveryKey: Ref<string> = ref('')
    const inputKey: Ref<string> = ref('')

    async function handleBackup(): Promise<void> {
        try {
            const res = await identityApi.backup()
            recoveryKey.value = (res.data as Record<string, string>).recoveryKey ?? ''
            ElMessage.success('备份密钥已生成')
        } catch {
            /* user cancelled or network error */
        }
    }

    async function handleRestore(): Promise<void> {
        try {
            const res = await identityApi.restore(inputKey.value)
            if (res.code === 0 || res.code === 200) {
                setJson(STORAGE_KEYS.identity, { userId: res.data, createdAt: Date.now() })
                ElMessage.success('身份还原成功，正在重载...')
                reloadPage(1500)
            }
        } catch {
            /* user cancelled or network error */
        }
    }

    function copyKey(): void {
        const text = recoveryKey.value
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard
                .writeText(text)
                .then(() => ElMessage.success('已复制'))
                .catch(() => ElMessage.error('复制失败'))
            return
        }

        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand('copy')
        textArea.remove()

        if (successful) ElMessage.success('已复制')
        else ElMessage.error('复制失败')
    }

    return {
        showIdentityModal,
        recoveryKey,
        inputKey,
        handleBackup,
        handleRestore,
        copyKey
    }
}
