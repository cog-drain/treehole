import multiavatar from '@multiavatar/multiavatar'

export function generateDiceBearAvatar(seed: string): string {
    const svgCode = multiavatar(seed || '匿名')
    const base64 = btoa(unescape(encodeURIComponent(svgCode)))
    return `data:image/svg+xml;base64,${base64}`
}
