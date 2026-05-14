import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { backupIdentity, restoreIdentity } from '@/api'
import { STORAGE_KEYS } from '@/constants/storageKeys'

export function useIdentityVault() {
  const showIdentityModal = ref(false)
  const recoveryKey = ref('')
  const inputKey = ref('')

  async function handleBackup() {
    try {
      const res = await backupIdentity()
      recoveryKey.value = res.data
      ElMessage.success('备份密钥已生成')
    } catch {}
  }

  async function handleRestore() {
    try {
      const res = await restoreIdentity(inputKey.value)
      if (res.code === 0 || res.code === 200) {
        localStorage.setItem(STORAGE_KEYS.identity, JSON.stringify({ userId: res.data, createdAt: Date.now() }))
        ElMessage.success('身份还原成功，正在重载...')
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch {}
  }

  function copyKey() {
    const text = recoveryKey.value
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
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
