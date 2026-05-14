<template>
  <IdentityVaultModal
    :visible="showIdentityModal"
    :recovery-key="recoveryKey"
    :input-key="inputKey"
    @close="$emit('close-identity')"
    @open-store="$emit('open-store')"
    @backup="$emit('backup')"
    @restore="$emit('restore')"
    @copy-key="$emit('copy-key')"
    @update:input-key="$emit('update:input-key', $event)"
  />

  <DriftBottleDialog
    v-model="bottleModel"
    :picked-data="pickedBottle"
    :user-id="userId"
    @on-throw="$emit('throw-bottle', $event)"
    @on-pick="$emit('pick-bottle')"
    @on-reply="$emit('reply-bottle', $event)"
    @on-return="$emit('return-bottle')"
  />

  <AdminLoginModal
    :visible="adminLoginVisible"
    :password="adminPassword"
    @update:password="$emit('update:admin-password', $event)"
    @login="$emit('admin-login')"
    @close="$emit('close-admin-login')"
  />

  <AdminDock
    :visible="isAdmin"
    @open-blacklist="$emit('open-blacklist')"
    @open-password="$emit('open-password')"
    @exit="$emit('exit-admin')"
  />

  <BlacklistDialog
    v-model:visible="blacklistModel"
    :blacklist="blacklist"
    @unban="$emit('unban', $event)"
  />

  <PasswordDialog
    v-model:visible="passwordModel"
    :form="pwdForm"
    @submit="$emit('change-password')"
  />

  <OfflineQueueDialog
    v-model:visible="offlineDialogModel"
    :is-online="isOnline"
    :offline-list="offlineList"
    :offline-queue-count="offlineQueueCount"
    @sync="$emit('sync-offline')"
    @edit="$emit('edit-offline', $event)"
    @remove="$emit('remove-offline', $event)"
  />
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import AdminDock from '@/components/home/admin/AdminDock.vue'
import AdminLoginModal from '@/components/home/admin/AdminLoginModal.vue'
import BlacklistDialog from '@/components/home/admin/BlacklistDialog.vue'
import IdentityVaultModal from '@/components/home/IdentityVaultModal.vue'
import OfflineQueueDialog from '@/components/home/OfflineQueueDialog.vue'
import PasswordDialog from '@/components/home/admin/PasswordDialog.vue'

const DriftBottleDialog = defineAsyncComponent(() => import('@/components/business/DriftBottleDialog.vue'))

const props = defineProps({
  showIdentityModal: { type: Boolean, default: false },
  recoveryKey: { type: String, default: '' },
  inputKey: { type: String, default: '' },
  bottleVisible: { type: Boolean, default: false },
  pickedBottle: { type: Object, default: null },
  userId: { type: String, default: '' },
  adminLoginVisible: { type: Boolean, default: false },
  adminPassword: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  showBlacklistModal: { type: Boolean, default: false },
  showPasswordModal: { type: Boolean, default: false },
  blacklist: { type: Array, default: () => [] },
  pwdForm: { type: Object, required: true },
  offlineDialogVisible: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: true },
  offlineList: { type: Array, default: () => [] },
  offlineQueueCount: { type: Number, default: 0 }
})

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
  get: () => props.bottleVisible,
  set: value => emit('update:bottle-visible', value)
})

const blacklistModel = computed({
  get: () => props.showBlacklistModal,
  set: value => emit('update:blacklist-visible', value)
})

const passwordModel = computed({
  get: () => props.showPasswordModal,
  set: value => emit('update:password-visible', value)
})

const offlineDialogModel = computed({
  get: () => props.offlineDialogVisible,
  set: value => emit('update:offline-dialog-visible', value)
})
</script>
