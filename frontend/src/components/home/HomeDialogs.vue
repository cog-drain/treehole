<template>
    <IdentityVaultModal
        :visible="identityState.showIdentityModal"
        :recovery-key="identityState.recoveryKey"
        :input-key="identityState.inputKey"
        @close="$emit('close-identity')"
        @open-store="$emit('open-store')"
        @backup="$emit('backup')"
        @restore="$emit('restore')"
        @copy-key="$emit('copy-key')"
        @update:input-key="$emit('update:input-key', $event)"
    />

    <DriftBottleDialog
        v-model="bottleModel"
        :picked-data="bottleState.pickedBottle"
        :user-id="bottleState.userId"
        @on-throw="$emit('throw-bottle', $event)"
        @on-pick="$emit('pick-bottle')"
        @on-reply="$emit('reply-bottle', $event)"
        @on-return="$emit('return-bottle')"
    />

    <AdminLoginModal
        :visible="adminState.adminLoginVisible"
        :password="adminState.adminPassword"
        @update:password="$emit('update:admin-password', $event)"
        @login="$emit('admin-login')"
        @close="$emit('close-admin-login')"
    />

    <AdminDock
        :visible="adminState.isAdmin"
        @open-blacklist="$emit('open-blacklist')"
        @open-password="$emit('open-password')"
        @exit="$emit('exit-admin')"
    />

    <BlacklistDialog
        v-model:visible="blacklistModel"
        :blacklist="adminState.blacklist"
        @unban="$emit('unban', $event)"
    />

    <PasswordDialog
        v-model:visible="passwordModel"
        :form="adminState.pwdForm"
        @update:old-password="$emit('update:old-password', $event)"
        @update:new-password="$emit('update:new-password', $event)"
        @submit="$emit('change-password')"
    />

    <OfflineQueueDialog
        v-model:visible="offlineDialogModel"
        :is-online="offlineState.isOnline"
        :offline-list="offlineState.offlineList"
        :offline-queue-count="offlineState.offlineQueueCount"
        @sync="$emit('sync-offline')"
        @edit="$emit('edit-offline', $event)"
        @remove="$emit('remove-offline', $event)"
    />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import AdminDock from '@/components/home/admin/AdminDock.vue'
import AdminLoginModal from '@/components/home/admin/AdminLoginModal.vue'
import BlacklistDialog from '@/components/home/admin/BlacklistDialog.vue'
import IdentityVaultModal from '@/components/home/IdentityVaultModal.vue'
import OfflineQueueDialog from '@/components/home/OfflineQueueDialog.vue'
import PasswordDialog from '@/components/home/admin/PasswordDialog.vue'
import type { BlacklistItem, Bottle } from '@/types'
import type { OfflineQueueItem } from '@/utils/offlineQueue'

const DriftBottleDialog = defineAsyncComponent(() => import('@/components/business/DriftBottleDialog.vue'))

export interface IdentityVaultDialogState {
    showIdentityModal: boolean
    recoveryKey: string
    inputKey: string
}

export interface DriftBottleDialogState {
    bottleVisible: boolean
    pickedBottle: Bottle | null
    userId: string
}

export interface PasswordFormState {
    oldPassword: string
    newPassword: string
}

export interface AdminDialogState {
    adminLoginVisible: boolean
    adminPassword: string
    isAdmin: boolean
    showBlacklistModal: boolean
    showPasswordModal: boolean
    blacklist: BlacklistItem[]
    pwdForm: PasswordFormState
}

export interface OfflineQueueDialogState {
    offlineDialogVisible: boolean
    isOnline: boolean
    offlineList: OfflineQueueItem[]
    offlineQueueCount: number
}

const props = defineProps<{
    identityState: IdentityVaultDialogState
    bottleState: DriftBottleDialogState
    adminState: AdminDialogState
    offlineState: OfflineQueueDialogState
}>()

const emit = defineEmits([
    'close-identity',
    'open-store',
    'backup',
    'restore',
    'copy-key',
    'update:input-key',
    'update:bottle-visible',
    'throw-bottle',
    'pick-bottle',
    'reply-bottle',
    'return-bottle',
    'update:admin-password',
    'update:old-password',
    'update:new-password',
    'admin-login',
    'close-admin-login',
    'open-blacklist',
    'open-password',
    'exit-admin',
    'update:blacklist-visible',
    'update:password-visible',
    'unban',
    'change-password',
    'update:offline-dialog-visible',
    'sync-offline',
    'edit-offline',
    'remove-offline'
])

const bottleModel = computed({
    get: () => props.bottleState.bottleVisible,
    set: value => emit('update:bottle-visible', value)
})

const blacklistModel = computed({
    get: () => props.adminState.showBlacklistModal,
    set: value => emit('update:blacklist-visible', value)
})

const passwordModel = computed({
    get: () => props.adminState.showPasswordModal,
    set: value => emit('update:password-visible', value)
})

const offlineDialogModel = computed({
    get: () => props.offlineState.offlineDialogVisible,
    set: value => emit('update:offline-dialog-visible', value)
})
</script>
