import { toast as sonnerToast } from 'vue-sonner'

function normalizeOptions(messageOrOptions, fallbackType) {
  if (typeof messageOrOptions === 'string') {
    return {
      message: messageOrOptions,
      type: fallbackType
    }
  }

  return {
    message: messageOrOptions?.message || '',
    title: messageOrOptions?.title || '',
    description: messageOrOptions?.description || '',
    type: messageOrOptions?.type || fallbackType,
    duration: messageOrOptions?.duration
  }
}

function showToast(messageOrOptions, fallbackType = 'info') {
  const options = normalizeOptions(messageOrOptions, fallbackType)
  const handler = sonnerToast[options.type] || sonnerToast
  return handler(options.title || options.message, {
    description: options.title ? options.message || options.description : options.description,
    duration: options.duration
  })
}

export const toast = Object.assign(
  (messageOrOptions) => showToast(messageOrOptions, 'info'),
  {
    success: (messageOrOptions) => showToast(messageOrOptions, 'success'),
    error: (messageOrOptions) => showToast(messageOrOptions, 'error'),
    warning: (messageOrOptions) => showToast(messageOrOptions, 'warning'),
    info: (messageOrOptions) => showToast(messageOrOptions, 'info')
  }
)
