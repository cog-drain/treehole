import { describe, expect, it } from 'vitest'
import { formatDuration, formatRelativeTime, formatTime } from './time'

describe('time utils', () => {
    it('formats absolute time with padded fields', () => {
        expect(formatTime(new Date('2026-05-04T03:02:00'))).toBe('2026.05.04 03:02')
    })

    it('returns an empty string for invalid absolute time', () => {
        expect(formatTime('not-a-date')).toBe('')
    })

    it('formats duration as mm:ss', () => {
        expect(formatDuration(65)).toBe('01:05')
        expect(formatDuration(0)).toBe('00:00')
    })

    it('formats recent relative time as NOW', () => {
        expect(formatRelativeTime(Date.now())).toBe('NOW')
    })
})
