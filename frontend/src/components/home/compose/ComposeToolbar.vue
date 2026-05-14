<template>
  <div class="flex flex-col gap-4 pt-6 border-t border-white/5">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2 min-w-0">
        <label class="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-400 hover:bg-white/10 hover:text-slate-200 cursor-pointer transition-all active:scale-95">
          <ImagePlus :size="14" />
          <span class="whitespace-nowrap">{{ composeState.imagePreview ? (composeState.isMobile ? '换图' : '更换图片') : '图片' }}</span>
          <input type="file" accept="image/*" class="hidden" @change="$emit('image-select', $event)" />
        </label>

        <button
          v-if="!voiceState.recordedBlob && !voiceState.isRecording"
          class="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-all active:scale-95"
          @click="$emit('toggle-voice-panel')"
        >
          <Mic :size="14" />
          <span class="whitespace-nowrap">{{ composeState.isMobile ? '语音' : '语音留言' }}</span>
        </button>

        <ToneSelector
          :form="composeState.form"
          :tone-map="toneMap"
          :show-tone-panel="composeState.showTonePanel"
          :tone-selector-ref="composeState.toneSelectorRef"
          :is-mobile="composeState.isMobile"
          @toggle-tone-panel="$emit('toggle-tone-panel', $event)"
          @set-tone="$emit('set-tone', $event)"
        />

        <button
          class="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full border text-[11px] transition-all active:scale-95"
          :class="composeState.isConfessionMode ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 shadow-sm shadow-amber-500/10' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'"
          :title="composeState.isMidnight ? '深夜了，有什么话想说吗？' : '切换告解模式'"
          @click="$emit('toggle-confession')"
        >
          <span class="text-sm">🕯️</span>
          <span class="whitespace-nowrap">告解</span>
        </button>
      </div>

      <div class="flex w-full sm:w-auto items-center gap-3">
        <button
          v-if="composeState.offlineQueueCount > 0 || !composeState.isOnline"
          class="p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all group/archive"
          :title="composeState.isOnline ? '查看离线暂存箱' : '网络已断开，留言将暂存'"
          @click="$emit('open-offline-box')"
        >
          <div class="relative">
            <Archive :size="18" :class="{ 'animate-bounce': !composeState.isOnline && composeState.offlineQueueCount > 0 }" />
            <span v-if="composeState.offlineQueueCount > 0" class="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
          </div>
        </button>

        <button
          class="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
          :class="composeState.isConfessionMode && composeState.isOnline ? 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/20 text-white' : (composeState.isOnline ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 text-white' : 'bg-slate-800 text-slate-400 border border-white/5')"
          :disabled="composeState.publishing"
          :title="composeState.isMidnight && !composeState.isConfessionMode ? '深夜了，有什么话想说吗？' : ''"
          @click="$emit('publish-button-click')"
        >
          <Loader2 v-if="composeState.publishing" class="animate-spin" :size="16" />
          <span v-else-if="composeState.isConfessionMode || composeState.isMidnight" class="text-base leading-none">🕯️</span>
          <Send v-else :size="16" />
          <span class="whitespace-nowrap">{{ composeState.publishing ? '发射中' : (composeState.isConfessionMode ? '忏悔' : (composeState.isOnline ? '投入树洞' : '封存胶囊')) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Archive, ImagePlus, Loader2, Mic, Send } from 'lucide-vue-next'
import ToneSelector from '@/components/home/compose/ToneSelector.vue'

defineProps({
  composeState: { type: Object, required: true },
  voiceState: { type: Object, required: true },
  toneMap: { type: Object, default: () => ({}) }
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
