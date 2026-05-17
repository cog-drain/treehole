import { beforeEach, describe, expect, it } from 'vitest'
import { CMT_TOKEN_KEY, getToken, hasCmtToken, hasMsgToken, MSG_TOKEN_KEY, removeToken, saveToken } from './index'

describe('api token helpers', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('saves and reads message tokens', () => {
        saveToken(MSG_TOKEN_KEY, 1, 'msg-token')

        expect(getToken(MSG_TOKEN_KEY, 1)).toBe('msg-token')
        expect(hasMsgToken(1)).toBe(true)
    })

    it('saves and reads comment tokens', () => {
        saveToken(CMT_TOKEN_KEY, 'c1', 'comment-token')

        expect(getToken(CMT_TOKEN_KEY, 'c1')).toBe('comment-token')
        expect(hasCmtToken('c1')).toBe(true)
    })

    it('removes tokens', () => {
        saveToken(MSG_TOKEN_KEY, 1, 'msg-token')
        removeToken(MSG_TOKEN_KEY, 1)

        expect(getToken(MSG_TOKEN_KEY, 1)).toBeNull()
        expect(hasMsgToken(1)).toBe(false)
    })
})
