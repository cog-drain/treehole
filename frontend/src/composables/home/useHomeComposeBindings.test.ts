import { describe, expect, it } from 'vitest'
import { reactive, ref } from 'vue'
import { useHomeComposeBindings } from './useHomeComposeBindings'
import type { ComposeFormDraft, VoiceEffectOption } from '@/types'

describe('useHomeComposeBindings', () => {
    function createBindings() {
        const form = reactive<ComposeFormDraft>({
            authorAlias: 'River',
            content: '',
            mood: 'whisper',
            theme: 'default'
        })
        const voiceEffects: VoiceEffectOption[] = [{ id: 'robot', name: 'Robot', icon: 'bot' }]

        return useHomeComposeBindings({
            compose: {
                form,
                showTonePanel: ref(false),
                toneSelectorRef: ref(null),
                imagePreview: ref('preview.png'),
                isConfessionMode: ref(false),
                isMidnight: ref(true)
            },
            recorder: {
                showVoicePanel: ref(false),
                isRecording: ref(false),
                recordingTime: ref(0),
                recordedBlob: ref(null),
                rawAudioUrl: ref(null),
                maskedAudioUrl: ref(null),
                isPlayingPreview: ref(false),
                previewCurrentTime: ref(0),
                previewDuration: ref(0),
                audioPreviewRef: ref(null),
                voiceEffect: ref('robot'),
                voiceEffects
            },
            isZenMode: ref(false),
            adminLoginVisible: ref(false),
            isMobile: ref(false),
            isOnline: ref(true),
            publishing: ref(false),
            offlineQueueCount: ref(2)
        })
    }

    it('maps compose and voice state for the home view', () => {
        const bindings = createBindings()

        expect(bindings.composeState.value.imagePreview).toBe('preview.png')
        expect(bindings.composeState.value.offlineQueueCount).toBe(2)
        expect(bindings.voiceState.value.voiceEffect).toBe('robot')
    })

    it('updates form and recorder fields through stable setters', () => {
        const bindings = createBindings()

        bindings.setAuthorAlias('Echo')
        bindings.setComposeContent('hello')
        bindings.setTone('dream')
        bindings.setTheme('sakura')
        bindings.toggleConfession()
        bindings.setVoiceEffect('deep')

        expect(bindings.composeState.value.form.authorAlias).toBe('Echo')
        expect(bindings.composeState.value.form.content).toBe('hello')
        expect(bindings.composeState.value.form.mood).toBe('dream')
        expect(bindings.composeState.value.form.theme).toBe('sakura')
        expect(bindings.composeState.value.isConfessionMode).toBe(true)
        expect(bindings.voiceState.value.voiceEffect).toBe('deep')
    })
})
