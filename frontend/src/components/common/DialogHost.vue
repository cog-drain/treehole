<template>
  <UiModal
    :model-value="!!dialogStore.activeDialog"
    max-width="28rem"
    @update:modelValue="handleClose"
  >
    <div
      v-if="dialogStore.activeDialog"
      class="space-y-6 rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 text-slate-100 shadow-[0_28px_90px_-40px_rgba(2,6,23,0.95)] backdrop-blur-2xl"
    >
      <div class="space-y-2">
        <h2 class="text-sm font-semibold uppercase tracking-[0.2em]" :class="titleClass">
          {{ dialogStore.activeDialog.title }}
        </h2>
        <p class="text-sm leading-7 text-slate-300 whitespace-pre-wrap">
          {{ dialogStore.activeDialog.message }}
        </p>
      </div>

      <UiInput
        v-if="dialogStore.activeDialog.kind === 'prompt'"
        v-model="promptValue"
        :placeholder="dialogStore.activeDialog.placeholder"
      />

      <div class="flex gap-3">
        <UiButton variant="secondary" class="flex-1" @click="handleCancel">
          {{ dialogStore.activeDialog.cancelText }}
        </UiButton>
        <UiButton :variant="confirmVariant" class="flex-1" @click="handleConfirm">
          {{ dialogStore.activeDialog.confirmText }}
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useDialogStore } from '@/stores/dialog'
import UiButton from '@/components/ui/Button.vue'
import UiInput from '@/components/ui/Input.vue'
import UiModal from '@/components/ui/Modal.vue'

const dialogStore = useDialogStore()
const promptValue = ref('')

watch(() => dialogStore.activeDialog, (dialog) => {
  promptValue.value = dialog?.initialValue || ''
}, { immediate: true })

const confirmVariant = computed(() => {
  return dialogStore.activeDialog?.tone === 'danger' ? 'danger' : 'primary'
})

const titleClass = computed(() => {
  return dialogStore.activeDialog?.tone === 'danger' ? 'text-red-400' : 'text-blue-400'
})

function handleClose(visible) {
  if (!visible) {
    handleCancel()
  }
}

function handleCancel() {
  dialogStore.rejectDialog()
}

function handleConfirm() {
  if (dialogStore.activeDialog?.kind === 'prompt') {
    dialogStore.resolveDialog({ value: promptValue.value })
    return
  }

  dialogStore.resolveDialog(true)
}
</script>
