import { useDialogStore } from '@/stores/dialog'

function getStore() {
  return useDialogStore()
}

export function confirmDialog(options) {
  const config = typeof options === 'string'
    ? { title: '请确认', message: options }
    : options

  return getStore().openDialog({
    kind: 'confirm',
    title: config.title || '请确认',
    message: config.message || '',
    confirmText: config.confirmText || '确认',
    cancelText: config.cancelText || '取消',
    tone: config.tone || 'default'
  })
}

export async function promptDialog(options) {
  const config = typeof options === 'string'
    ? { title: '请输入', message: options }
    : options

  return getStore().openDialog({
    kind: 'prompt',
    title: config.title || '请输入',
    message: config.message || '',
    placeholder: config.placeholder || '',
    confirmText: config.confirmText || '确认',
    cancelText: config.cancelText || '取消',
    tone: config.tone || 'default',
    initialValue: config.initialValue || ''
  })
}
