import { STORAGE_KEYS } from '@/constants/storageKeys'
import { getJson, getString, setJson, setString } from '@/utils/storage'
import type { UserIdentity } from '@/types'

const ADJECTIVES = ['深海', '星际', '赛博', '荒野', '幻梦', '虚空', '极光', '迷雾', '雷鸣', '永恒']
const NOUNS = ['居民', '浪人', '访客', '幽灵', '观察者', '行者', '先驱', '诗人', '信徒', '极客']

export function createClientId(): string {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function getOrCreateUserIdentity(): UserIdentity {
    let identity = getJson<UserIdentity | null>(STORAGE_KEYS.identity, null)
    if (!identity?.userId) {
        identity = { userId: createClientId(), createdAt: Date.now() }
        setJson(STORAGE_KEYS.identity, identity)
    }
    return identity
}

export function generateRandomAlias(): string {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
    const randomId = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${adj}${noun}_${randomId}`
}

export function getOrCreateAlias(): string {
    let alias = getString(STORAGE_KEYS.alias)
    if (!alias) {
        alias = generateRandomAlias()
        setString(STORAGE_KEYS.alias, alias)
    }
    return alias
}
