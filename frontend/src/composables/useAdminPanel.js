import { reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import { STORAGE_KEYS } from '@/constants/storageKeys'

export function useAdminPanel() {
  const isAdmin = ref(!!localStorage.getItem(STORAGE_KEYS.adminToken))
  const adminLoginVisible = ref(false)
  const adminPassword = ref('')
  const showBlacklistModal = ref(false)
  const showPasswordModal = ref(false)
  const blacklist = ref([])
  const pwdForm = reactive({ oldPassword: '', newPassword: '' })

  function handleCommand(content, clearContent) {
    const command = content?.trim()
    if (command === 'sudo su - root') {
      adminLoginVisible.value = true
      adminPassword.value = ''
      clearContent?.()
    } else if (command === 'exit' && isAdmin.value) {
      exitAdmin()
      clearContent?.()
    }
  }

  async function handleAdminLogin() {
    const pwd = adminPassword.value.trim()
    if (!pwd) return
    try {
      const res = await api.adminLogin(pwd)
      if (res.data) {
        isAdmin.value = true
        localStorage.setItem(STORAGE_KEYS.adminToken, res.data)
        adminLoginVisible.value = false
        ElMessage({ message: '👑 ACCESS GRANTED.', type: 'success', duration: 3000 })
        fetchBlacklist()
      }
    } catch {
      adminPassword.value = ''
    }
  }

  async function fetchBlacklist() {
    try {
      blacklist.value = (await api.getBlacklist()).data || []
    } catch {}
  }

  async function handleUnban(ip) {
    try {
      await api.unbanIP(ip)
      ElMessage.success('IP 已解封')
      fetchBlacklist()
    } catch {}
  }

  async function handleChangePassword() {
    const oldPassword = (pwdForm.oldPassword || '').trim()
    const newPassword = (pwdForm.newPassword || '').trim()
    if (!oldPassword || !newPassword) return
    try {
      await api.resetAdminPassword(oldPassword, newPassword)
      ElMessage.success('密码修改成功')
      exitAdmin()
    } catch {}
  }

  function exitAdmin() {
    isAdmin.value = false
    localStorage.removeItem(STORAGE_KEYS.adminToken)
    showBlacklistModal.value = false
    showPasswordModal.value = false
    ElMessage.info('管理员模式已退出')
  }

  async function handleBanIP(ip) {
    try {
      const { value } = await ElMessageBox.prompt('请输入封禁理由', '封禁操作', {
        confirmButtonText: '确定封禁',
        cancelButtonText: '取消',
        inputPlaceholder: '违反社区守则'
      })
      await api.banIP(ip, value || '违反社区守则')
      ElMessage.success('已封禁该 IP')
      fetchBlacklist()
    } catch {}
  }

  return {
    isAdmin,
    adminLoginVisible,
    adminPassword,
    showBlacklistModal,
    showPasswordModal,
    blacklist,
    pwdForm,
    handleCommand,
    handleAdminLogin,
    fetchBlacklist,
    handleUnban,
    handleChangePassword,
    exitAdmin,
    handleBanIP
  }
}
