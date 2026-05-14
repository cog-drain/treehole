<template>
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
          :title="isOnline ? '查看离线暂存箱' : '网络已断开，留言将暂存'"
          @click="$emit('open-offline-box')"
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
          :title="isMidnight && !isConfessionMode ? '深夜了，有什么话想说吗？' : ''"
          @click="$emit('publish-button-click')"
        >
          <Loader2 v-if="publishing" class="animate-spin" :size="16" />
          <span v-else-if="isConfessionMode || isMidnight" class="text-base leading-none">🕯️</span>
          <Send v-else :size="16" />
          <span class="whitespace-nowrap">{{ publishing ? '发射中' : (isConfessionMode ? '忏悔' : (isOnline ? '投入树洞' : '封存胶囊')) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Archive, ImagePlus, Loader2, Mic, Send } from 'lucide-vue-next'
import ToneSelector from '@/components/home/compose/ToneSelector.vue'

defineProps({
  form: { type: Object, required: true },
  toneMap: { type: Object, default: () => ({}) },
  isConfessionMode: { type: Boolean, default: false },
  isMidnight: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: true },
  publishing: { type: Boolean, default: false },
  offlineQueueCount: { type: Number, default: 0 },
  imagePreview: { type: String, default: '' },
  showTonePanel: { type: Boolean, default: false },
  toneSelectorRef: { type: Object, default: null },
  recordedBlob: { default: null },
  isRecording: { type: Boolean, default: false }
})

defineEmits([
  'image-select',
  'toggle-voice-panel',
  'toggle-tone-panel',
  'set-tone',
  'toggle-confession',
  'open-offline-box',
  'publish-button-click'
])
</script>
