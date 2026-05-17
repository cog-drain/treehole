<script setup>
import { Pause, Play, Trash2 } from 'lucide-vue-next'

const props = defineProps({
    showVoicePanel: { type: Boolean, default: false },
    isRecording: { type: Boolean, default: false },
    recordingTime: { type: Number, default: 0 },
    recordedBlob: { default: null },
    rawAudioUrl: { type: String, default: '' },
    maskedAudioUrl: { type: String, default: '' },
    isPlayingPreview: { type: Boolean, default: false },
    previewCurrentTime: { type: Number, default: 0 },
    previewDuration: { type: Number, default: 0 },
    audioPreviewRef: { type: Object, default: null },
    voiceEffect: { type: String, default: 'robot' },
    voiceEffects: { type: Array, default: () => [] },
    formatDuration: { type: Function, required: true }
})

const emit = defineEmits([
    'toggle-recording',
    'set-voice-effect',
    'reapply-voice-mask',
    'clear-audio',
    'toggle-preview-playback',
    'preview-time-update',
    'preview-ended',
    'seek-preview'
])

const waveformBars = [8, 14, 10, 16, 7, 18, 12, 15, 9, 17, 11, 13]

function bindAudioPreview(el) {
    if (props.audioPreviewRef) props.audioPreviewRef.value = el
}

function setVoiceEffect(effectId) {
    emit('set-voice-effect', effectId)
    emit('reapply-voice-mask')
}
</script>

<template>
    <TransitionGroup name="page">
        <div
            v-if="showVoicePanel || isRecording || recordedBlob"
            key="voice"
            class="mt-4 p-4 rounded-xl bg-white/5 border border-white/10"
        >
            <div v-if="!recordedBlob" class="flex flex-col items-center gap-4">
                <button
                    class="w-full py-3 rounded-xl transition-all font-medium text-sm border border-dashed border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5"
                    :class="{ 'animate-pulse text-red-400 border-red-500/50 bg-red-500/5': isRecording }"
                    @click="$emit('toggle-recording')"
                >
                    {{ isRecording ? `⏹ 停止录音 (${recordingTime}s)` : '⏺ 点击开始录制 (60s)' }}
                </button>
            </div>

            <div v-else class="space-y-4">
                <div class="flex items-center justify-between px-2">
                    <div class="flex gap-2">
                        <button
                            v-for="eff in voiceEffects"
                            :key="eff.id"
                            @click="setVoiceEffect(eff.id)"
                            class="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all"
                            :class="
                                voiceEffect === eff.id
                                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                                    : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                            "
                        >
                            <span class="text-lg">{{ eff.icon }}</span>
                            <span class="text-[9px] font-bold uppercase tracking-tighter">{{ eff.name }}</span>
                        </button>
                    </div>
                    <button
                        @click="$emit('clear-audio')"
                        class="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                        <Trash2 :size="18" />
                    </button>
                </div>

                <div
                    class="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 relative overflow-hidden group/player max-w-md mx-auto"
                >
                    <audio
                        :ref="bindAudioPreview"
                        :src="maskedAudioUrl || rawAudioUrl"
                        @timeupdate="$emit('preview-time-update')"
                        @ended="$emit('preview-ended')"
                        class="hidden"
                    ></audio>

                    <button
                        @click="$emit('toggle-preview-playback')"
                        class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-90 transition-all"
                    >
                        <Play v-if="!isPlayingPreview" :size="18" fill="currentColor" />
                        <Pause v-else :size="18" fill="currentColor" />
                    </button>

                    <div class="flex-1 space-y-1">
                        <div
                            class="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest"
                        >
                            <span>{{ formatDuration(previewCurrentTime) }}</span>
                            <div class="flex gap-0.5 items-center">
                                <div
                                    v-for="(height, index) in waveformBars"
                                    :key="index"
                                    class="w-0.5 bg-blue-500/30 rounded-full transition-all"
                                    :class="{ 'animate-[bounce_0.8s_infinite]': isPlayingPreview }"
                                    :style="{
                                        height: height + 'px',
                                        animationDelay: index * 0.1 + 's',
                                        opacity: isPlayingPreview ? 0.8 : 0.2
                                    }"
                                ></div>
                            </div>
                            <span>{{ formatDuration(previewDuration || 0) }}</span>
                        </div>
                        <el-slider
                            :model-value="previewCurrentTime"
                            :max="previewDuration || 1"
                            :show-tooltip="false"
                            @update:model-value="$emit('seek-preview', $event)"
                            size="small"
                            class="cyber-slider"
                        />
                    </div>
                </div>
            </div>
        </div>
    </TransitionGroup>
</template>
