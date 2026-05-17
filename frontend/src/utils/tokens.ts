import { STORAGE_KEYS } from '@/constants/storageKeys'
import { getJson, setJson } from '@/utils/storage'
import type { Id } from '@/types'

export const MSG_TOKEN_KEY = STORAGE_KEYS.messageTokens
export const CMT_TOKEN_KEY = STORAGE_KEYS.commentTokens

type TokenMap = Record<string, string>

function loadTokenMap(storageKey: string): TokenMap {
    return getJson<TokenMap>(storageKey, {})
}

export function saveToken(storageKey: string, id: Id, token: string): void {
    const map = loadTokenMap(storageKey)
    map[id] = token
    setJson(storageKey, map)
}

export function getToken(storageKey: string, id: Id): string | null {
    return loadTokenMap(storageKey)[id] || null
}

export function removeToken(storageKey: string, id: Id): void {
    const map = loadTokenMap(storageKey)
    delete map[id]
    setJson(storageKey, map)
}

export function hasMsgToken(id: Id): boolean {
    return !!getToken(MSG_TOKEN_KEY, id)
}

export function hasCmtToken(id: Id): boolean {
    return !!getToken(CMT_TOKEN_KEY, id)
}
