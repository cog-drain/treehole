import { describe, expect, it } from 'vitest'
import { formatDuration, useRecorder } from './useRecorder'

describe('formatDuration', () => {
  it('formats seconds as mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00')
    expect(formatDuration(5)).toBe('00:05')
    expect(formatDuration(65)).toBe('01:05')
    expect(formatDuration(Number.NaN)).toBe('00:00')
  })
})

describe('useRecorder', () => {
  it('toggles the voice panel', () => {
    const recorder = useRecorder()

    recorder.toggleVoicePanel()
    expect(recorder.showVoicePanel.value).toBe(true)

    recorder.toggleVoicePanel()
    expect(recorder.showVoicePanel.value).toBe(false)
  })

  it('ignores preview controls without an audio element', () => {
    const recorder = useRecorder()

    recorder.togglePreviewPlayback()
    recorder.onPreviewTimeUpdate()
    recorder.seekPreview(12)

    expect(recorder.isPlayingPreview.value).toBe(false)
    expect(recorder.previewCurrentTime.value).toBe(0)
  })

  it('clears audio state', () => {
    const recorder = useRecorder()
    recorder.showVoicePanel.value = true
    recorder.recordingTime.value = 9
    recorder.rawAudioUrl.value = 'blob:raw'
    recorder.maskedAudioUrl.value = 'blob:masked'
    recorder.voiceEffect.value = 'deep'

    recorder.clearAudio()

    expect(recorder.showVoicePanel.value).toBe(false)
    expect(recorder.recordingTime.value).toBe(0)
    expect(recorder.rawAudioUrl.value).toBe('')
    expect(recorder.maskedAudioUrl.value).toBe('')
    expect(recorder.voiceEffect.value).toBe('robot')
  })
})
