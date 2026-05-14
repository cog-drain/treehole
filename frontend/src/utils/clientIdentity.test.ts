import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '@/constants/storageKeys'
import { generateRandomAlias, getOrCreateAlias, getOrCreateUserIdentity } from './clientIdentity'

describe('client identity utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('creates and reuses a stable user identity', () => {
    const first = getOrCreateUserIdentity()
    const second = getOrCreateUserIdentity()

    expect(first.userId).toBeTruthy()
    expect(second).toEqual(first)
  })

  it('creates and reuses a local alias', () => {
    const alias = getOrCreateAlias()

    expect(alias).toMatch(/_.{4}$/)
    expect(getOrCreateAlias()).toBe(alias)
    expect(localStorage.getItem(STORAGE_KEYS.alias)).toBe(alias)
  })

  it('generates random aliases with the expected shape', () => {
    expect(generateRandomAlias()).toMatch(/_.{4}$/)
  })
})
