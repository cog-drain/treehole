<template>
  <section
    class="glass-card group relative animate__animated animate__backInUp"
    :class="[
      getMessageSkinClass(form.skin),
      { 'opacity-20 blur-[20px] pointer-events-none scale-95': disabled }
    ]"
  >
    <div class="space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="relative flex-1 group/input w-full">
          <input
            class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
            :value="form.authorAlias"
            type="text"
            placeholder="👤 你的匿名昵称"
            maxlength="20"
            @input="$emit('update:authorAlias', $event.target.value)"
            @focus="$emit('focus-alias')"
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
              v-for="skin in availableSkins"
              :key="skin"
              class="group/dot relative flex items-center justify-center transition-all duration-500"
              @click="$emit('select-skin', skin)"
            >
              <div
                class="absolute inset-0 rounded-full transition-all duration-700 blur-[4px]"
                :class="form.skin === skin ? 'bg-white/20 scale-150 animate-pulse' : 'bg-transparent scale-100 group-hover/dot:bg-white/10 group-hover/dot:scale-125'"
              ></div>

              <div
                class="relative w-4 h-4 rounded-full border transition-all duration-500"
                :class="[
                  form.skin === skin ? 'scale-110 border-white theme-dot-active' : 'border-white/20 opacity-40 group-hover/dot:opacity-100',
                  messageSkinMeta[skin]?.dotClass || 'theme-dot-default'
                ]"
              ></div>
            </button>
          </div>
        </div>
      </div>

      <div class="relative">
        <textarea
          class="w-full bg-transparent border-none text-lg leading-relaxed placeholder:text-slate-600 focus:outline-none resize-none min-h-[120px]"
          :value="form.content"
          placeholder="说点什么吧……你的秘密在这里很安全 🤫"
          maxlength="500"
          rows="4"
          @input="$emit('update:content', $event.target.value)"
          @paste="$emit('paste', $event)"
        ></textarea>
        <div class="absolute bottom-0 right-0 text-[10px] font-mono text-slate-600 tracking-tighter">
          {{ form.content.length }} / 500
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-6 border-t border-white/5">
        <div class="flex flex-wrap items-center gap-3">
          <label class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] sm:text-xs text-slate-400 hover:bg-white/10 hover:text-slate-200 cursor-pointer transition-all active:scale-95">
            <ImagePlus :size="14" />
            <span class="whitespace-nowrap">{{ imagePreview ? (isMobile ? '换图' : '更换图片') : '图片' }}</span>
            <input type="file" accept="image/*" class="hidden" @change="$emit('image-select', $event)" />
          </label>

          <button
            v-if="!recorderState.recordedBlob && !recorderState.isRecording"
            class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] sm:text-xs text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-all active:scale-95"
            @click="recorderState.toggleVoicePanel"
          >
            <Mic :size="14" />
            <span class="whitespace-nowrap">{{ isMobile ? '语音' : '语音留言' }}</span>
          </button>

          <div class="flex items-center gap-1 sm:gap-2">
            <button
              v-for="(emoji, mood) in moodMap"
              :key="mood"
              class="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-transparent transition-all hover:border-white/20 active:scale-90"
              :class="{ 'bg-blue-500/20 border-blue-500/40 scale-110': form.mood === mood }"
              @click="$emit('toggle-mood', mood)"
            >
              <span class="text-sm sm:text-base grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" :class="{ 'grayscale-0 opacity-100': form.mood === mood }">
                {{ emoji }}
              </span>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
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
            class="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-sm tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
            :class="isOnline ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 text-white' : 'bg-slate-800 text-slate-400 border border-white/5'"
            :disabled="publishing"
            @click="$emit('publish')"
          >
            <Loader2 v-if="publishing" class="animate-spin" :size="16" />
            <Send v-else :size="16" />
            <span class="whitespace-nowrap">{{ publishing ? '发射中' : (isOnline ? '投入树洞' : '封存胶囊') }}</span>
          </button>
        </div>
      </div>

      <TransitionGroup name="page">
        <div v-if="imagePreview" key="img" class="relative group/img inline-block mt-4">
          <img :src="imagePreview" class="w-24 h-24 object-cover rounded-xl border border-white/10" />
          <button @click="$emit('clear-image')" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover/img:opacity-100 transition-opacity">✕</button>
        </div>

        <div v-if="recorderState.showVoicePanel || recorderState.isRecording || recorderState.recordedBlob" key="voice" class="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div v-if="!recorderState.recordedBlob" class="flex flex-col items-center gap-4">
            <button
              class="w-full py-3 rounded-xl transition-all font-medium text-sm border border-dashed border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5"
              :class="{ 'animate-pulse text-red-400 border-red-500/50 bg-red-500/5': recorderState.isRecording }"
              @click="recorderState.toggleRecording"
            >
              {{ recorderState.isRecording ? `⏹ 停止录音 (${recorderState.recordingTime}s)` : '⏺ 点击开始录制 (60s)' }}
            </button>
          </div>

          <div v-else class="space-y-4">
            <div class="flex items-center justify-between px-2">
              <div class="flex gap-2">
                <button
                  v-for="effect in recorderState.voiceEffects"
                  :key="effect.id"
                  @click="$emit('select-voice-effect', effect.id)"
                  class="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all"
                  :class="recorderState.voiceEffect === effect.id ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'"
                >
                  <span class="text-lg">{{ effect.icon }}</span>
                  <span class="text-[9px] font-bold uppercase tracking-tighter">{{ effect.name }}</span>
                </button>
              </div>
              <button @click="recorderState.clearAudio" class="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"><Trash2 :size="18" /></button>
            </div>

            <div class="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 relative overflow-hidden group/player max-w-md mx-auto">
              <audio
                ref="audioPreviewRef"
                :src="recorderState.maskedAudioUrl || recorderState.rawAudioUrl"
                @timeupdate="recorderState.onPreviewTimeUpdate"
                @ended="recorderState.onPreviewEnded"
                class="hidden"
              ></audio>

              <button
                @click="recorderState.togglePreviewPlayback"
                class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-90 transition-all"
              >
                <Play v-if="!recorderState.isPlayingPreview" :size="18" fill="currentColor" />
                <Pause v-else :size="18" fill="currentColor" />
              </button>

              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>{{ recorderState.formatDuration(recorderState.previewCurrentTime) }}</span>
                  <div class="flex gap-0.5 items-center">
                    <div
                      v-for="i in 12"
                      :key="i"
                      class="w-0.5 bg-blue-500/30 rounded-full transition-all"
                      :class="{ 'animate-[bounce_0.8s_infinite]': recorderState.isPlayingPreview }"
                      :style="{
                        height: Math.random() * 12 + 4 + 'px',
                        animationDelay: (i * 0.1) + 's',
                        opacity: recorderState.isPlayingPreview ? 0.8 : 0.2
                      }"
                    ></div>
                  </div>
                  <span>{{ recorderState.formatDuration(recorderState.previewDuration || 0) }}</span>
                </div>
                <UiSlider
                  v-model="recorderState.previewCurrentTime"
                  :max="recorderState.previewDuration || 1"
                  @input="recorderState.seekPreview"
                  class="cyber-slider"
                />
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </section>
</template>

<script setup>
import { Dices, ImagePlus, Mic, Archive, Send, Loader2, Trash2, Play, Pause } from 'lucide-vue-next'
import UiSlider from '@/components/ui/Slider.vue'
import { getMessageSkinClass } from '@/utils/messageSkins'

defineProps({
  form: { type: Object, required: true },
  moodMap: { type: Object, required: true },
  availableSkins: { type: Array, required: true },
  messageSkinMeta: { type: Object, required: true },
  publishing: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: true },
  isMobile: { type: Boolean, default: false },
  offlineQueueCount: { type: Number, default: 0 },
  imagePreview: { type: String, default: '' },
  recorderState: { type: Object, required: true },
  disabled: { type: Boolean, default: false }
})

defineEmits([
  'update:authorAlias',
  'update:content',
  'refresh-identity',
  'focus-alias',
  'select-skin',
  'paste',
  'image-select',
  'clear-image',
  'toggle-mood',
  'open-offline-box',
  'publish',
  'select-voice-effect'
])
</script>
