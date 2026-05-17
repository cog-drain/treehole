import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyVoiceMask } from './audioProcessor'

describe('audio processor', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('returns the original blob when no voice effect is selected', async () => {
        const blob = new Blob(['audio'], { type: 'audio/webm' })

        await expect(applyVoiceMask(blob)).resolves.toBe(blob)
        await expect(applyVoiceMask(blob, 'original')).resolves.toBe(blob)
    })

    it('falls back to the original blob when Web Audio is unavailable', async () => {
        const blob = new Blob(['audio'], { type: 'audio/webm' })
        vi.stubGlobal('window', {
            AudioContext: undefined,
            webkitAudioContext: undefined
        })

        await expect(applyVoiceMask(blob, 'robot')).resolves.toBe(blob)
    })
})
