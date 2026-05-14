<script setup>
import { Archive, Dices, ImagePlus, Loader2, Mic, Send } from 'lucide-vue-next'
import ToneSelector from '@/components/home/compose/ToneSelector.vue'
import VoicePanel from '@/components/home/compose/VoicePanel.vue'

const props = defineProps({
  form: { type: Object, required: true },
  themesList: { type: Array, default: () => [] },
  toneMap: { type: Object, default: () => ({}) },
  isConfessionMode: { type: Boolean, default: false },
  isMidnight: { type: Boolean, default: false },
  isZenMode: { type: Boolean, default: false },
  adminLoginVisible: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: true },
  publishing: { type: Boolean, default: false },
  offlineQueueCount: { type: Number, default: 0 },
  imagePreview: { type: String, default: '' },
  showTonePanel: { type: Boolean, default: false },
  toneSelectorRef: { type: Object, default: null },
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
  'refresh-identity',
  'image-select',
  'paste',
  'publish',
  'publish-button-click',
  'toggle-voice-panel',
  'toggle-tone-panel',
  'set-tone',
  'set-theme',
  'toggle-confession',
  'open-offline-box',
  'clear-image',
  'toggle-recording',
  'set-voice-effect',
  'reapply-voice-mask',
  'clear-audio',
  'toggle-preview-playback',
  'preview-time-update',
  'preview-ended',
  'seek-preview'
])

</script>

<template>
  <section
    class="glass-card group relative animate__animated animate__backInUp"
    :class="[
      'theme-' + form.theme,
      isConfessionMode ? 'confession-compose' : '',
      { 'opacity-20 blur-[20px] pointer-events-none scale-95': isZenMode || adminLoginVisible }
    ]"
  >
    <div class="space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="relative flex-1 group/input w-full">
          <input
            class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
            v-model="form.authorAlias"
            type="text"
            placeholder="👤 你的匿名昵称"
            maxlength="20"
          />
          <button
            class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-400 transition-colors"
            @click="$emit('refresh-identity')"
            title="换一个身份"
          >
            <Dices :size="18" />
          </button>
        </div>

        <div class="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
          <div class="flex items-center p-1.5 gap-3">
            <button
              v-for="theme in themesList"
              :key="theme.value"
              class="group/dot relative flex items-center justify-center transition-all duration-500"
              @click="$emit('set-theme', theme.value)"
            >
              <div
                class="absolute inset-0 rounded-full transition-all duration-700 blur-[4px]"
                :class="form.theme === theme.value ? 'bg-white/20 scale-150 animate-pulse' : 'bg-transparent scale-100 group-hover/dot:bg-white/10 group-hover/dot:scale-125'"
              ></div>
              <div
                class="relative w-4 h-4 rounded-full border transition-all duration-500"
                :class="[
                  form.theme === theme.value ? 'scale-110 border-white theme-dot-active' : 'border-white/20 opacity-40 group-hover/dot:opacity-100',
                  'theme-dot-' + theme.value
                ]"
              ></div>
            </button>
          </div>
        </div>
      </div>

      <div class="relative">
        <textarea
          class="w-full bg-transparent border-none text-lg leading-relaxed placeholder:text-slate-600 focus:outline-none resize-none min-h-[120px]"
          v-model="form.content"
          :placeholder="isConfessionMode ? '这里只有神父能听见...' : '说点什么吧……你的秘密在这里很安全 🤫 (支持 Ctrl+Enter 发送)'"
          maxlength="500"
          rows="4"
          @paste="$emit('paste', $event)"
          @keydown.ctrl.enter="$emit('publish')"
          @keydown.meta.enter="$emit('publish')"
        ></textarea>
        <div class="absolute bottom-0 right-0 text-[10px] font-mono text-slate-600 tracking-tighter">
          {{ form.content.length }} / 500
        </div>
      </div>

      <div class="flex flex-col gap-4 pt-6 border-t border-white/5">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div class="flex flex-wrap items-center gap-2 min-w-0">
            <label class="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-400 hover:bg-white/10 hover:text-slate-200 cursor-pointer transition-all active:scale-95">
              <ImagePlus :size="14" />
              <span class="whitespace-nowrap">{{ imagePreview ? (isMobile ? '换图' : '更换图片') : '图片' }}</span>
              <input type="file" accept="image/*" class="hidden" @change="$emit('image-select', $event)" />
            </label>

            <button
              v-if="!recordedBlob && !isRecording"
              class="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-all active:scale-95"
              @click="$emit('toggle-voice-panel')"
            >
              <Mic :size="14" />
              <span class="whitespace-nowrap">{{ isMobile ? '语音' : '语音留言' }}</span>
            </button>

            <ToneSelector
              :form="form"
              :tone-map="toneMap"
              :show-tone-panel="showTonePanel"
              :tone-selector-ref="toneSelectorRef"
              :is-mobile="isMobile"
              @toggle-tone-panel="$emit('toggle-tone-panel', $event)"
              @set-tone="$emit('set-tone', $event)"
            />

            <button
              class="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full border text-[11px] transition-all active:scale-95"
              :class="isConfessionMode ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 shadow-sm shadow-amber-500/10' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'"
              :title="isMidnight ? '深夜了，有什么话想说吗？' : '切换告解模式'"
              @click="$emit('toggle-confession')"
            >
              <span class="text-sm">🕯️</span>
              <span class="whitespace-nowrap">告解</span>
            </button>
          </div>

          <div class="flex w-full sm:w-auto items-center gap-3">
            <button
              v-if="offlineQueueCount > 0 || !isOnline"
              class="p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all group/archive"
              @click="$emit('open-offline-box')"
              :title="isOnline ? '查看离线暂存箱' : '网络已断开，留言将暂存'"
            >
              <div class="relative">
                <Archive :size="18" :class="{ 'animate-bounce': !isOnline && offlineQueueCount > 0 }" />
                <span v-if="offlineQueueCount > 0" class="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              </div>
            </button>

            <button
              class="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
              :class="isConfessionMode && isOnline ? 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/20 text-white' : (isOnline ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 text-white' : 'bg-slate-800 text-slate-400 border border-white/5')"
              :disabled="publishing"
              @click="$emit('publish-button-click')"
              :title="isMidnight && !isConfessionMode ? '深夜了，有什么话想说吗？' : ''"
            >
              <Loader2 v-if="publishing" class="animate-spin" :size="16" />
              <span v-else-if="isConfessionMode || isMidnight" class="text-base leading-none">🕯️</span>
              <Send v-else :size="16" />
              <span class="whitespace-nowrap">{{ publishing ? '发射中' : (isConfessionMode ? '忏悔' : (isOnline ? '投入树洞' : '封存胶囊')) }}</span>
            </button>
          </div>
        </div>
      </div>

      <TransitionGroup name="page">
        <div v-if="imagePreview" key="img" class="relative group/img inline-block mt-4">
          <img :src="imagePreview" class="w-24 h-24 object-cover rounded-xl border border-white/10" />
          <button @click="$emit('clear-image')" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover/img:opacity-100 transition-opacity">✕</button>
        </div>

        <VoicePanel
          key="voice"
          :show-voice-panel="showVoicePanel"
          :is-recording="isRecording"
          :recording-time="recordingTime"
          :recorded-blob="recordedBlob"
          :raw-audio-url="rawAudioUrl"
          :masked-audio-url="maskedAudioUrl"
          :is-playing-preview="isPlayingPreview"
          :preview-current-time="previewCurrentTime"
          :preview-duration="previewDuration"
          :audio-preview-ref="audioPreviewRef"
          :voice-effect="voiceEffect"
          :voice-effects="voiceEffects"
          :format-duration="formatDuration"
          @toggle-recording="$emit('toggle-recording')"
          @set-voice-effect="$emit('set-voice-effect', $event)"
          @reapply-voice-mask="$emit('reapply-voice-mask')"
          @clear-audio="$emit('clear-audio')"
          @toggle-preview-playback="$emit('toggle-preview-playback')"
          @preview-time-update="$emit('preview-time-update')"
          @preview-ended="$emit('preview-ended')"
          @seek-preview="$emit('seek-preview', $event)"
        />
      </TransitionGroup>
    </div>
  </section>
</template>
