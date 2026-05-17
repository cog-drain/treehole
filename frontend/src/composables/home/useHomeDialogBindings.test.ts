import { describe, expect, it } from 'vitest'
import { reactive, ref } from 'vue'
import { useHomeDialogBindings } from './useHomeDialogBindings'

describe('useHomeDialogBindings', () => {
    function createBindings() {
        const pwdForm = reactive({ oldPassword: '', newPassword: '' })

        return {
            pwdForm,
            bindings: useHomeDialogBindings({
                identityVault: {
                    showIdentityModal: ref(false),
                    recoveryKey: ref('key'),
                    inputKey: ref('')
                },
                driftBottle: {
                    bottleVisible: ref(false),
                    pickedBottle: ref(null)
                },
                adminPanel: {
                    adminLoginVisible: ref(true),
                    adminPassword: ref(''),
                    isAdmin: ref(false),
                    showBlacklistModal: ref(false),
                    showPasswordModal: ref(false),
                    blacklist: ref([]),
                    pwdForm
                },
                offlineBox: {
                    offlineDialogVisible: ref(false),
                    offlineList: ref([])
                },
                userId: ref('u1'),
                isOnline: ref(true),
                offlineQueueCount: ref(1)
            })
        }
    }

    it('maps dialog state objects', () => {
        const { bindings } = createBindings()

        expect(bindings.identityState.value.recoveryKey).toBe('key')
        expect(bindings.bottleState.value.userId).toBe('u1')
        expect(bindings.offlineState.value.offlineQueueCount).toBe(1)
    })

    it('routes dialog setters to their source refs and forms', () => {
        const { bindings, pwdForm } = createBindings()

        bindings.openIdentity()
        bindings.setInputKey('restore-key')
        bindings.setBottleVisible(true)
        bindings.setAdminPassword('secret')
        bindings.setOldPassword('old')
        bindings.setNewPassword('new')
        bindings.openBlacklist()
        bindings.openPassword()
        bindings.setOfflineDialogVisible(true)

        expect(bindings.identityState.value.showIdentityModal).toBe(true)
        expect(bindings.identityState.value.inputKey).toBe('restore-key')
        expect(bindings.bottleState.value.bottleVisible).toBe(true)
        expect(bindings.adminState.value.adminPassword).toBe('secret')
        expect(pwdForm).toEqual({ oldPassword: 'old', newPassword: 'new' })
        expect(bindings.adminState.value.showBlacklistModal).toBe(true)
        expect(bindings.adminState.value.showPasswordModal).toBe(true)
        expect(bindings.offlineState.value.offlineDialogVisible).toBe(true)
    })
})
