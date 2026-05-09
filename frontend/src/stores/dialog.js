import { defineStore } from 'pinia'
import { ref } from 'vue'

let dialogId = 0

export const useDialogStore = defineStore('dialog', () => {
  const activeDialog = ref(null)

  function clearDialog() {
    activeDialog.value = null
  }

  function resolveDialog(value) {
    activeDialog.value?.resolve?.(value)
    clearDialog()
  }

  function rejectDialog(error = new Error('Dialog dismissed')) {
    activeDialog.value?.reject?.(error)
    clearDialog()
  }

  function openDialog(config) {
    return new Promise((resolve, reject) => {
      activeDialog.value = {
        id: ++dialogId,
        ...config,
        resolve,
        reject
      }
    })
  }

  return {
    activeDialog,
    clearDialog,
    resolveDialog,
    rejectDialog,
    openDialog
  }
})
