import { beforeEach, describe, expect, it, vi } from 'vitest'

const { message, messageBox } = vi.hoisted(() => ({
    message: Object.assign(vi.fn(), {
        success: vi.fn(),
        info: vi.fn()
    }),
    messageBox: {
        prompt: vi.fn()
    }
}))

vi.mock('element-plus', () => ({
    ElMessage: message,
    ElMessageBox: messageBox
}))

vi.mock('@/api/modules/identity', () => ({
    identityApi: {
        adminLogin: vi.fn(),
        getBlacklist: vi.fn(),
        unbanIP: vi.fn(),
        resetAdminPassword: vi.fn(),
        banIP: vi.fn()
    }
}))

import { identityApi } from '@/api/modules/identity'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { useAdminPanel } from './useAdminPanel'

describe('useAdminPanel', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('opens the admin login command and clears command content', () => {
        const admin = useAdminPanel()
        const clearContent = vi.fn()

        admin.handleCommand(' sudo su - root ', clearContent)

        expect(admin.adminLoginVisible.value).toBe(true)
        expect(admin.adminPassword.value).toBe('')
        expect(clearContent).toHaveBeenCalled()
    })

    it('logs in, stores the admin token, and fetches blacklist data', async () => {
        vi.mocked(identityApi.adminLogin).mockResolvedValue({ code: 200, data: 'token-1' })
        vi.mocked(identityApi.getBlacklist).mockResolvedValue({ code: 200, data: [{ ip: '127.0.0.1' }] })
        const admin = useAdminPanel()
        admin.adminLoginVisible.value = true
        admin.adminPassword.value = 'secret'

        await admin.handleAdminLogin()

        expect(admin.isAdmin.value).toBe(true)
        expect(localStorage.getItem(STORAGE_KEYS.adminToken)).toBe('token-1')
        expect(admin.adminLoginVisible.value).toBe(false)
        expect(admin.blacklist.value).toEqual([{ ip: '127.0.0.1' }])
        expect(message).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }))
    })

    it('clears password input after failed login', async () => {
        vi.mocked(identityApi.adminLogin).mockRejectedValue(new Error('bad password'))
        const admin = useAdminPanel()
        admin.adminPassword.value = 'wrong'

        await admin.handleAdminLogin()

        expect(admin.isAdmin.value).toBe(false)
        expect(admin.adminPassword.value).toBe('')
        expect(localStorage.getItem(STORAGE_KEYS.adminToken)).toBeNull()
    })

    it('exits admin mode through the command and clears modal state', () => {
        localStorage.setItem(STORAGE_KEYS.adminToken, 'token-1')
        const admin = useAdminPanel()
        const clearContent = vi.fn()
        admin.showBlacklistModal.value = true
        admin.showPasswordModal.value = true

        admin.handleCommand('exit', clearContent)

        expect(admin.isAdmin.value).toBe(false)
        expect(localStorage.getItem(STORAGE_KEYS.adminToken)).toBeNull()
        expect(admin.showBlacklistModal.value).toBe(false)
        expect(admin.showPasswordModal.value).toBe(false)
        expect(clearContent).toHaveBeenCalled()
        expect(message.info).toHaveBeenCalledWith('管理员模式已退出')
    })

    it('changes password only when both fields are present, then exits', async () => {
        localStorage.setItem(STORAGE_KEYS.adminToken, 'token-1')
        vi.mocked(identityApi.resetAdminPassword).mockResolvedValue({ code: 200, data: null })
        const admin = useAdminPanel()
        admin.pwdForm.oldPassword = 'old'

        await admin.handleChangePassword()
        expect(identityApi.resetAdminPassword).not.toHaveBeenCalled()

        admin.pwdForm.newPassword = 'new'
        await admin.handleChangePassword()

        expect(identityApi.resetAdminPassword).toHaveBeenCalledWith('old', 'new')
        expect(admin.isAdmin.value).toBe(false)
        expect(localStorage.getItem(STORAGE_KEYS.adminToken)).toBeNull()
    })

    it('uses the prompt reason when banning an IP and refreshes blacklist', async () => {
        messageBox.prompt.mockResolvedValue({ value: 'spam' })
        vi.mocked(identityApi.banIP).mockResolvedValue({ code: 200, data: null })
        vi.mocked(identityApi.getBlacklist).mockResolvedValue({ code: 200, data: [{ ip: '10.0.0.1' }] })
        const admin = useAdminPanel()

        await admin.handleBanIP('10.0.0.1')

        expect(identityApi.banIP).toHaveBeenCalledWith('10.0.0.1', 'spam')
        expect(admin.blacklist.value).toEqual([{ ip: '10.0.0.1' }])
        expect(message.success).toHaveBeenCalledWith('已封禁该 IP')
    })
})
