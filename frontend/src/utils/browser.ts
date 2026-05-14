export function openExternalImage(url: string): void {
  window.open(url, '_blank')
}

export function reloadPage(delay = 0): void {
  if (delay > 0) {
    setTimeout(() => window.location.reload(), delay)
    return
  }
  window.location.reload()
}

export function scrollToTop(options: ScrollToOptions = { behavior: 'smooth' }): void {
  window.scrollTo({ top: 0, ...options })
}
