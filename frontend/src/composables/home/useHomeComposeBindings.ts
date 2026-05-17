import { computed, type Ref } from 'vue'
import type { ComposeFormDraft, ThemeKey, ToneKey, VoiceEffectKey, VoiceEffectOption } from '@/types'

interface HomeComposeSource {
    form: ComposeFormDraft
    showTonePanel: Ref<boolean>
    toneSelectorRef: Ref<HTMLElement | null>
    imagePreview: Ref<string | null>
    isConfessionMode: Ref<boolean>
    isMidnight: Ref<boolean>
}

interface HomeRecorderSource {
    showVoicePanel: Ref<boolean>
    isRecording: Ref<boolean>
    recordingTime: Ref<number>
    recordedBlob: Ref<Blob | null>
    rawAudioUrl: Ref<string | null>
    maskedAudioUrl: Ref<string | null>
    isPlayingPreview: Ref<boolean>
    previewCurrentTime: Ref<number>
    previewDuration: Ref<number>
    audioPreviewRef: Ref<HTMLAudioElement | null>
    voiceEffect: Ref<VoiceEffectKey>
    voiceEffects: VoiceEffectOption[]
}

export interface HomeComposeBindingsOptions {
    compose: HomeComposeSource
    recorder: HomeRecorderSource
    isZenMode: Ref<boolean>
    adminLoginVisible: Ref<boolean>
    isMobile: Ref<boolean>
    isOnline: Ref<boolean>
    publishing: Ref<boolean>
    offlineQueueCount: Ref<number>
}

export function useHomeComposeBindings({
    compose,
    recorder,
    isZenMode,
    adminLoginVisible,
    isMobile,
    isOnline,
    publishing,
    offlineQueueCount
}: HomeComposeBindingsOptions) {
    const composeState = computed(() => ({
        form: compose.form,
        isConfessionMode: compose.isConfessionMode.value,
        isMidnight: compose.isMidnight.value,
        isZenMode: isZenMode.value,
        adminLoginVisible: adminLoginVisible.value,
        isMobile: isMobile.value,
        isOnline: isOnline.value,
        publishing: publishing.value,
        offlineQueueCount: offlineQueueCount.value,
        imagePreview: compose.imagePreview.value,
        showTonePanel: compose.showTonePanel.value,
        toneSelectorRef: compose.toneSelectorRef
    }))

    const voiceState = computed(() => ({
        showVoicePanel: recorder.showVoicePanel.value,
        isRecording: recorder.isRecording.value,
        recordingTime: recorder.recordingTime.value,
        recordedBlob: recorder.recordedBlob.value,
        rawAudioUrl: recorder.rawAudioUrl.value ?? '',
        maskedAudioUrl: recorder.maskedAudioUrl.value ?? '',
        isPlayingPreview: recorder.isPlayingPreview.value,
        previewCurrentTime: recorder.previewCurrentTime.value,
        previewDuration: recorder.previewDuration.value,
        audioPreviewRef: recorder.audioPreviewRef,
        voiceEffect: recorder.voiceEffect.value,
        voiceEffects: recorder.voiceEffects
    }))

    function setTonePanel(visible: boolean): void {
        compose.showTonePanel.value = visible
    }

    function setToneSelectorRef(element: HTMLElement | null): void {
        compose.toneSelectorRef.value = element
    }

    function setAuthorAlias(value: string): void {
        compose.form.authorAlias = value
    }

    function setComposeContent(value: string): void {
        compose.form.content = value
    }

    function setTone(tone: ToneKey): void {
        compose.form.mood = tone
    }

    function setTheme(theme: ThemeKey): void {
        compose.form.theme = theme
    }

    function toggleConfession(): void {
        compose.isConfessionMode.value = !compose.isConfessionMode.value
    }

    function setVoiceEffect(effect: VoiceEffectKey): void {
        recorder.voiceEffect.value = effect
    }

    function setAudioPreviewRef(element: HTMLAudioElement | null): void {
        recorder.audioPreviewRef.value = element
    }

    return {
        composeState,
        voiceState,
        setTonePanel,
        setToneSelectorRef,
        setAuthorAlias,
        setComposeContent,
        setTone,
        setTheme,
        toggleConfession,
        setVoiceEffect,
        setAudioPreviewRef
    }
}
