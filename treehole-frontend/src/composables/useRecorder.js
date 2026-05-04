/**
 * 录音与变声 Composable — 从 Home.vue 中提取的 MediaRecorder 逻辑
 */
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { applyVoiceMask } from '@/utils/audioProcessor'

export function useRecorder() {
  const showVoicePanel = ref(false)
  const isRecording = ref(false)
  const recordingTime = ref(0)
  const recordedBlob = ref(null)
  const rawAudioUrl = ref('')
  const maskedAudioBlob = ref(null)
  const maskedAudioUrl = ref('')
  const isPlayingPreview = ref(false)
  const previewCurrentTime = ref(0)
  const previewDuration = ref(0)
  const audioPreviewRef = ref(null)
  const voiceEffect = ref('robot')

  const voiceEffects = [
    { id: 'original', name: '原音', icon: '👤' },
    { id: 'robot', name: '机器人', icon: '🤖' },
    { id: 'deep', name: '低沉', icon: '🌑' },
    { id: 'ethereal', name: '空灵', icon: '✨' }
  ]

  let mediaRecorder = null
  let recordingTimer = null

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream)
      const chunks = []

      mediaRecorder.ondataavailable = e => chunks.push(e.data)
      mediaRecorder.onstop = async () => {
        recordedBlob.value = new Blob(chunks, { type: 'audio/wav' })
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
    } catch (err) {
      ElMessage.error('无法访问麦克风，请检查浏览器权限设置 🎙️')
      console.error('Recording error:', err)
    }
  }

  function stopRecording() {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
      isRecording.value = false
      clearInterval(recordingTimer)
    }
  }

  function toggleRecording() {
    if (isRecording.value) stopRecording()
    else startRecording()
  }

  async function reapplyVoiceMask() {
    if (!recordedBlob.value) return
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

  function seekPreview(val) {
    if (audioPreviewRef.value) audioPreviewRef.value.currentTime = val
  }

  function onPreviewEnded() {
    isPlayingPreview.value = false
    previewCurrentTime.value = 0
  }

  function clearAudio() {
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

  const formatDuration = (s) => {
    if (!s || isNaN(s)) return '00:00'
    const min = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  return {
    showVoicePanel, isRecording, recordingTime, recordedBlob,
    rawAudioUrl, maskedAudioBlob, maskedAudioUrl,
    isPlayingPreview, previewCurrentTime, previewDuration, audioPreviewRef,
    voiceEffect, voiceEffects,
    toggleRecording, reapplyVoiceMask,
    togglePreviewPlayback, onPreviewTimeUpdate, seekPreview, onPreviewEnded,
    clearAudio, toggleVoicePanel, formatDuration
  }
}
