import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, isSameApiId, normalizePageResult, toApiId } from './api'

describe('api type utilities', () => {
    it('normalizes records pagination payloads', () => {
        expect(
            normalizePageResult({
                records: [{ id: 1 }],
                total: 3,
                current: 2,
                size: 1
            })
        ).toEqual({
            records: [{ id: 1 }],
            total: 3,
            current: 2,
            size: 1
        })
    })

    it('normalizes legacy list pagination payloads', () => {
        expect(
            normalizePageResult({
                list: [{ id: 'n1' }],
                total: 1
            })
        ).toEqual({
            records: [{ id: 'n1' }],
            total: 1,
            current: undefined,
            size: undefined
        })
    })

    it('compares numeric and string ids by API identity', () => {
        expect(toApiId(12)).toBe('12')
        expect(isSameApiId(12, '12')).toBe(true)
        expect(isSameApiId('12', '13')).toBe(false)
        expect(isSameApiId(null, '12')).toBe(false)
    })

    it('reads API error messages with a stable fallback', () => {
        expect(getApiErrorMessage({ code: 400, msg: '参数错误' })).toBe('参数错误')
        expect(getApiErrorMessage({ message: 'unauthorized' })).toBe('unauthorized')
        expect(getApiErrorMessage({}, '服务响应异常')).toBe('服务响应异常')
    })
})
