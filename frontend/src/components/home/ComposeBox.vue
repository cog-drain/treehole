<script setup>
import { Dices } from 'lucide-vue-next'
import ComposeToolbar from '@/components/home/compose/ComposeToolbar.vue'
import VoicePanel from '@/components/home/compose/VoicePanel.vue'

const props = defineProps({
  composeState: { type: Object, required: true },
  voiceState: { type: Object, required: true },
  themesList: { type: Array, default: () => [] },
  toneMap: { type: Object, default: () => ({}) },
  formatDuration: { type: Function, required: true }
})

defineEmits([
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
      'theme-' + composeState.form.theme,
      composeState.isConfessionMode ? 'confession-compose' : '',
      { 'opacity-20 blur-[20px] pointer-events-none scale-95': composeState.isZenMode || composeState.adminLoginVisible }
    ]"
  >
    <div class="space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="relative flex-1 group/input w-full">
          <input
            v-model="composeState.form.authorAlias"
            class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
            type="text"
            placeholder="👤 你的匿名昵称"
            maxlength="20"
          />
          <button
            class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-400 transition-colors"
            title="换一个身份"
            @click="$emit('refresh-identity')"
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
                :class="composeState.form.theme === theme.value ? 'bg-white/20 scale-150 animate-pulse' : 'bg-transparent scale-100 group-hover/dot:bg-white/10 group-hover/dot:scale-125'"
              ></div>
              <div
                class="relative w-4 h-4 rounded-full border transition-all duration-500"
                :class="[
                  composeState.form.theme === theme.value ? 'scale-110 border-white theme-dot-active' : 'border-white/20 opacity-40 group-hover/dot:opacity-100',
                  'theme-dot-' + theme.value
                ]"
              ></div>
            </button>
          </div>
        </div>
      </div>

      <div class="relative">
        <textarea
          v-model="composeState.form.content"
          class="w-full bg-transparent border-none text-lg leading-relaxed placeholder:text-slate-600 focus:outline-none resize-none min-h-[120px]"
          :placeholder="composeState.isConfessionMode ? '这里只有神父能听见...' : '说点什么吧……你的秘密在这里很安全 🤫 (支持 Ctrl+Enter 发送)'"
          maxlength="500"
          rows="4"
          @paste="$emit('paste', $event)"
          @keydown.ctrl.enter="$emit('publish')"
          @keydown.meta.enter="$emit('publish')"
        ></textarea>
        <div class="absolute bottom-0 right-0 text-[10px] font-mono text-slate-600 tracking-tighter">
          {{ composeState.form.content.length }} / 500
        </div>
      </div>

      <ComposeToolbar
        :compose-state="composeState"
        :voice-state="voiceState"
        :tone-map="toneMap"
        @image-select="$emit('image-select', $event)"
        @toggle-voice-panel="$emit('toggle-voice-panel')"
        @toggle-tone-panel="$emit('toggle-tone-panel', $event)"
        @set-tone="$emit('set-tone', $event)"
        @toggle-confession="$emit('toggle-confession')"
        @open-offline-box="$emit('open-offline-box')"
        @publish-button-click="$emit('publish-button-click')"
      />

      <TransitionGroup name="page">
        <div v-if="composeState.imagePreview" key="img" class="relative group/img inline-block mt-4">
          <img :src="composeState.imagePreview" class="w-24 h-24 object-cover rounded-xl border border-white/10" />
          <button class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover/img:opacity-100 transition-opacity" @click="$emit('clear-image')">
            ✕
          </button>
        </div>

        <VoicePanel
          key="voice"
          :show-voice-panel="voiceState.showVoicePanel"
          :is-recording="voiceState.isRecording"
          :recording-time="voiceState.recordingTime"
          :recorded-blob="voiceState.recordedBlob"
          :raw-audio-url="voiceState.rawAudioUrl"
          :masked-audio-url="voiceState.maskedAudioUrl"
          :is-playing-preview="voiceState.isPlayingPreview"
          :preview-current-time="voiceState.previewCurrentTime"
          :preview-duration="voiceState.previewDuration"
          :audio-preview-ref="voiceState.audioPreviewRef"
          :voice-effect="voiceState.voiceEffect"
          :voice-effects="voiceState.voiceEffects"
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
