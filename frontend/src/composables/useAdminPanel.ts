import { reactive, ref, type Ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { getString, remove, setString } from '@/utils/storage'
import type { BlacklistItem } from '@/types'

interface PasswordForm {
    oldPassword: string
    newPassword: string
}

export function useAdminPanel() {
    const isAdmin: Ref<boolean> = ref(!!getString(STORAGE_KEYS.adminToken))
    const adminLoginVisible: Ref<boolean> = ref(false)
    const adminPassword: Ref<string> = ref('')
    const showBlacklistModal: Ref<boolean> = ref(false)
    const showPasswordModal: Ref<boolean> = ref(false)
    const blacklist: Ref<BlacklistItem[]> = ref([])
    const pwdForm = reactive<PasswordForm>({ oldPassword: '', newPassword: '' })

    function handleCommand(content: string | undefined, clearContent?: () => void): void {
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

    async function handleAdminLogin(): Promise<void> {
        const pwd = adminPassword.value.trim()
        if (!pwd) return
        try {
            const res = await api.adminLogin(pwd)
            if (res.data) {
                isAdmin.value = true
                setString(STORAGE_KEYS.adminToken, res.data as string)
                adminLoginVisible.value = false
                ElMessage({ message: '👑 ACCESS GRANTED.', type: 'success', duration: 3000 })
                fetchBlacklist()
            }
        } catch {
            adminPassword.value = ''
        }
    }

    async function fetchBlacklist(): Promise<void> {
        try {
            blacklist.value = (await api.getBlacklist()).data || []
        } catch {
            /* network error */
        }
    }

    async function handleUnban(ip: string): Promise<void> {
        try {
            await api.unbanIP(ip)
            ElMessage.success('IP 已解封')
            fetchBlacklist()
        } catch {
            /* network error */
        }
    }

    async function handleChangePassword(): Promise<void> {
        const oldPassword = (pwdForm.oldPassword || '').trim()
        const newPassword = (pwdForm.newPassword || '').trim()
        if (!oldPassword || !newPassword) return
        try {
            await api.resetAdminPassword(oldPassword, newPassword)
            ElMessage.success('密码修改成功')
            exitAdmin()
        } catch {
            /* network error */
        }
    }

    function exitAdmin(): void {
        isAdmin.value = false
        remove(STORAGE_KEYS.adminToken)
        showBlacklistModal.value = false
        showPasswordModal.value = false
        ElMessage.info('管理员模式已退出')
    }

    async function handleBanIP(ip: string): Promise<void> {
        try {
            const { value } = await ElMessageBox.prompt('请输入封禁理由', '封禁操作', {
                confirmButtonText: '确定封禁',
                cancelButtonText: '取消',
                inputPlaceholder: '违反社区守则'
            })
            await api.banIP(ip, value || '违反社区守则')
            ElMessage.success('已封禁该 IP')
            fetchBlacklist()
        } catch {
            /* user cancelled */
        }
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
