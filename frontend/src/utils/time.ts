type TimeInput = string | number | Date | null | undefined

export function formatTime(t: TimeInput): string {
    if (!t) return ''
    const d = new Date(t)
    if (isNaN(d.getTime())) return ''
    const p = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function formatRelativeTime(time: TimeInput): string {
    if (!time) return ''
    const diff = Math.floor((Date.now() - new Date(time).getTime()) / 1000)
    if (diff < 60) return 'NOW'
    if (diff < 3600) return `${Math.floor(diff / 60)}M AGO`
    if (diff < 86400) return `${Math.floor(diff / 3600)}H AGO`
    return `${Math.floor(diff / 86400)}D AGO`
}

export function formatDuration(seconds: number | null | undefined): string {
    if (!seconds || isNaN(seconds)) return '00:00'
    const min = Math.floor(seconds / 60)
    const sec = Math.floor(seconds % 60)
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}
