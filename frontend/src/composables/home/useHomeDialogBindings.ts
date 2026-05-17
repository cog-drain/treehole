import { computed, type Ref } from 'vue'
import type { BlacklistItem, Bottle } from '@/types'

interface IdentityDialogSource {
    showIdentityModal: Ref<boolean>
    recoveryKey: Ref<string>
    inputKey: Ref<string>
}

interface DriftBottleDialogSource {
    bottleVisible: Ref<boolean>
    pickedBottle: Ref<Bottle | null>
}

interface AdminDialogSource {
    adminLoginVisible: Ref<boolean>
    adminPassword: Ref<string>
    isAdmin: Ref<boolean>
    showBlacklistModal: Ref<boolean>
    showPasswordModal: Ref<boolean>
    blacklist: Ref<BlacklistItem[]>
    pwdForm: {
        oldPassword: string
        newPassword: string
    }
}

interface OfflineDialogSource<TOfflineItem = unknown> {
    offlineDialogVisible: Ref<boolean>
    offlineList: Ref<TOfflineItem[]>
}

export interface HomeDialogBindingsOptions<TOfflineItem = unknown> {
    identityVault: IdentityDialogSource
    driftBottle: DriftBottleDialogSource
    adminPanel: AdminDialogSource
    offlineBox: OfflineDialogSource<TOfflineItem>
    userId: Ref<string>
    isOnline: Ref<boolean>
    offlineQueueCount: Ref<number>
}

export function useHomeDialogBindings<TOfflineItem = unknown>({
    identityVault,
    driftBottle,
    adminPanel,
    offlineBox,
    userId,
    isOnline,
    offlineQueueCount
}: HomeDialogBindingsOptions<TOfflineItem>) {
    const identityState = computed(() => ({
        showIdentityModal: identityVault.showIdentityModal.value,
        recoveryKey: identityVault.recoveryKey.value,
        inputKey: identityVault.inputKey.value
    }))

    const bottleState = computed(() => ({
        bottleVisible: driftBottle.bottleVisible.value,
        pickedBottle: driftBottle.pickedBottle.value,
        userId: userId.value
    }))

    const adminState = computed(() => ({
        adminLoginVisible: adminPanel.adminLoginVisible.value,
        adminPassword: adminPanel.adminPassword.value,
        isAdmin: adminPanel.isAdmin.value,
        showBlacklistModal: adminPanel.showBlacklistModal.value,
        showPasswordModal: adminPanel.showPasswordModal.value,
        blacklist: adminPanel.blacklist.value,
        pwdForm: adminPanel.pwdForm
    }))

    const offlineState = computed(() => ({
        offlineDialogVisible: offlineBox.offlineDialogVisible.value,
        isOnline: isOnline.value,
        offlineList: offlineBox.offlineList.value,
        offlineQueueCount: offlineQueueCount.value
    }))

    function openIdentity(): void {
        identityVault.showIdentityModal.value = true
    }

    function closeIdentity(): void {
        identityVault.showIdentityModal.value = false
    }

    function setInputKey(value: string): void {
        identityVault.inputKey.value = value
    }

    function setBottleVisible(visible: boolean): void {
        driftBottle.bottleVisible.value = visible
    }

    function setAdminPassword(value: string): void {
        adminPanel.adminPassword.value = value
    }

    function setOldPassword(value: string): void {
        adminPanel.pwdForm.oldPassword = value
    }

    function setNewPassword(value: string): void {
        adminPanel.pwdForm.newPassword = value
    }

    function closeAdminLogin(): void {
        adminPanel.adminLoginVisible.value = false
    }

    function openBlacklist(): void {
        adminPanel.showBlacklistModal.value = true
    }

    function openPassword(): void {
        adminPanel.showPasswordModal.value = true
    }

    function setBlacklistVisible(visible: boolean): void {
        adminPanel.showBlacklistModal.value = visible
    }

    function setPasswordVisible(visible: boolean): void {
        adminPanel.showPasswordModal.value = visible
    }

    function setOfflineDialogVisible(visible: boolean): void {
        offlineBox.offlineDialogVisible.value = visible
    }

    return {
        identityState,
        bottleState,
        adminState,
        offlineState,
        openIdentity,
        closeIdentity,
        setInputKey,
        setBottleVisible,
        setAdminPassword,
        setOldPassword,
        setNewPassword,
        closeAdminLogin,
        openBlacklist,
        openPassword,
        setBlacklistVisible,
        setPasswordVisible,
        setOfflineDialogVisible
    }
}
