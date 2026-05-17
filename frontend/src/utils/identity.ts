import { generateRandomAlias, getOrCreateAlias } from '@/utils/clientIdentity'

export function generateRandomIdentity(): string {
    return generateRandomAlias()
}

export function getOrGenerateIdentity(): string {
    return getOrCreateAlias()
}

export function getAvatarColor(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase()
    return '#' + '00000'.substring(0, 6 - c.length) + c
}
