export function openExternalImage(url) {
  window.open(url, '_blank')
}

export function reloadPage(delay = 0) {
  if (delay > 0) {
    setTimeout(() => window.location.reload(), delay)
    return
  }
  window.location.reload()
}

export function scrollToTop(options = { behavior: 'smooth' }) {
  window.scrollTo({ top: 0, ...options })
}
