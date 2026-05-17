import { beforeEach, describe, expect, it } from 'vitest'
import { getJson, getString, remove, setJson, setString } from './storage'

describe('storage utils', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('stores and reads json values', () => {
        setJson('treehole:test-json', { ok: true })
        expect(getJson('treehole:test-json', null)).toEqual({ ok: true })
    })

    it('returns fallback for missing or malformed json', () => {
        localStorage.setItem('treehole:bad-json', '{')
        expect(getJson('treehole:missing', { fallback: true })).toEqual({ fallback: true })
        expect(getJson('treehole:bad-json', [])).toEqual([])
    })

    it('stores strings and removes keys', () => {
        setString('treehole:test-string', 42)
        expect(getString('treehole:test-string')).toBe('42')
        remove('treehole:test-string')
        expect(getString('treehole:test-string', 'fallback')).toBe('fallback')
    })
})
