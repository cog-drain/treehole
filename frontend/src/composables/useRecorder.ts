/**
 * 录音与变声 Composable — 从 Home.vue 中提取的 MediaRecorder 逻辑
 */
import { onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { applyVoiceMask } from '@/utils/audioProcessor'
import type { VoiceEffectKey, VoiceEffectOption } from '@/types'

export function formatDuration(s: number): string {
    if (!s || Number.isNaN(s)) return '00:00'
    const min = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

export function useRecorder() {
    const showVoicePanel = ref(false)
    const isRecording = ref(false)
    const recordingTime = ref(0)
    const recordedBlob = ref<Blob | null>(null)
    const rawAudioUrl = ref('')
    const maskedAudioBlob = ref<Blob | null>(null)
    const maskedAudioUrl = ref('')
    const isPlayingPreview = ref(false)
    const previewCurrentTime = ref(0)
    const previewDuration = ref(0)
    const audioPreviewRef = ref<HTMLAudioElement | null>(null)
    const voiceEffect = ref<VoiceEffectKey>('robot')

    const voiceEffects: VoiceEffectOption[] = [
        { id: 'original', name: '原音', icon: '👤' },
        { id: 'robot', name: '机器人', icon: '🤖' },
        { id: 'deep', name: '低沉', icon: '🌑' },
        { id: 'ethereal', name: '空灵', icon: '✨' }
    ]

    let mediaRecorder: MediaRecorder | null = null
    let recordingTimer: ReturnType<typeof setInterval> | null = null

    async function startRecording() {
        if (isRecording.value) return
        if (!window.isSecureContext) {
            ElMessage.error('录音仅支持 HTTPS 或 localhost，请先启用 HTTPS 🔒')
            return
        }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            ElMessage.error('当前浏览器不支持麦克风接口，请更换浏览器或检查安全策略')
            return
        }
        if (typeof MediaRecorder === 'undefined') {
            ElMessage.error('当前浏览器不支持录音（MediaRecorder）')
            return
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const preferredType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : ''
            mediaRecorder = preferredType
                ? new MediaRecorder(stream, { mimeType: preferredType })
                : new MediaRecorder(stream)
            const chunks: BlobPart[] = []

            mediaRecorder.ondataavailable = e => chunks.push(e.data)
            mediaRecorder.onstop = async () => {
                if (rawAudioUrl.value) URL.revokeObjectURL(rawAudioUrl.value)
                if (maskedAudioUrl.value) URL.revokeObjectURL(maskedAudioUrl.value)
                recordedBlob.value = new Blob(chunks, { type: mediaRecorder?.mimeType || 'audio/webm' })
                rawAudioUrl.value = URL.createObjectURL(recordedBlob.value)
                maskedAudioBlob.value = await applyVoiceMask(recordedBlob.value, voiceEffect.value)
                maskedAudioUrl.value = URL.createObjectURL(maskedAudioBlob.value)
                stream.getTracks().forEach(t => t.stop())
            }

            mediaRecorder.start()
            isRecording.value = true
            recordingTime.value = 0
            recordingTimer = setInterval(() => {
                recordingTime.value++
                if (recordingTime.value >= 60) stopRecording()
            }, 1000)
        } catch (err: unknown) {
            const errorName = err instanceof DOMException ? err.name : ''
            if (errorName === 'NotAllowedError') {
                ElMessage.error('麦克风权限被拒绝，请在浏览器地址栏授权后重试 🎙️')
            } else if (errorName === 'NotFoundError') {
                ElMessage.error('未检测到麦克风设备，请检查硬件连接')
            } else {
                ElMessage.error('无法访问麦克风，请检查浏览器权限与 HTTPS 设置 🎙️')
            }
            console.error('Recording error:', err)
        }
    }

    function stopRecording() {
        if (mediaRecorder && isRecording.value) {
            mediaRecorder.stop()
            isRecording.value = false
            if (recordingTimer) clearInterval(recordingTimer)
            recordingTimer = null
        }
    }

    function cleanup() {
        stopRecording()
        if (rawAudioUrl.value) URL.revokeObjectURL(rawAudioUrl.value)
        if (maskedAudioUrl.value) URL.revokeObjectURL(maskedAudioUrl.value)
        rawAudioUrl.value = ''
        maskedAudioUrl.value = ''
    }

    onUnmounted(cleanup)

    function toggleRecording() {
        if (isRecording.value) stopRecording()
        else startRecording()
    }

    async function reapplyVoiceMask() {
        if (!recordedBlob.value) return
        if (maskedAudioUrl.value) URL.revokeObjectURL(maskedAudioUrl.value)
        maskedAudioBlob.value = await applyVoiceMask(recordedBlob.value, voiceEffect.value)
        maskedAudioUrl.value = URL.createObjectURL(maskedAudioBlob.value)
    }

    function togglePreviewPlayback() {
        if (!audioPreviewRef.value) return
        if (isPlayingPreview.value) audioPreviewRef.value.pause()
        else audioPreviewRef.value.play()
        isPlayingPreview.value = !isPlayingPreview.value
    }

    function onPreviewTimeUpdate() {
        if (!audioPreviewRef.value) return
        previewCurrentTime.value = audioPreviewRef.value.currentTime
        previewDuration.value = audioPreviewRef.value.duration
    }

    function seekPreview(val: number) {
        if (audioPreviewRef.value) audioPreviewRef.value.currentTime = val
    }

    function onPreviewEnded() {
        isPlayingPreview.value = false
        previewCurrentTime.value = 0
    }

    function clearAudio() {
        if (rawAudioUrl.value) URL.revokeObjectURL(rawAudioUrl.value)
        if (maskedAudioUrl.value) URL.revokeObjectURL(maskedAudioUrl.value)
        recordedBlob.value = null
        rawAudioUrl.value = ''
        maskedAudioUrl.value = ''
        showVoicePanel.value = false
        recordingTime.value = 0
        voiceEffect.value = 'robot'
    }

    function toggleVoicePanel() {
        showVoicePanel.value = !showVoicePanel.value
    }

    return {
        showVoicePanel,
        isRecording,
        recordingTime,
        recordedBlob,
        rawAudioUrl,
        maskedAudioBlob,
        maskedAudioUrl,
        isPlayingPreview,
        previewCurrentTime,
        previewDuration,
        audioPreviewRef,
        voiceEffect,
        voiceEffects,
        toggleRecording,
        reapplyVoiceMask,
        togglePreviewPlayback,
        onPreviewTimeUpdate,
        seekPreview,
        onPreviewEnded,
        clearAudio,
        toggleVoicePanel,
        formatDuration
    }
}
