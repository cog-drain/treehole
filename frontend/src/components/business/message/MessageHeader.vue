<script setup>
import { Ban, Trash2, Zap } from 'lucide-vue-next'
import { formatTime } from '@/utils/time'

defineProps({
  msg: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false },
  isConfession: { type: Boolean, default: false },
  isResonant: { type: Boolean, default: false },
  toneInfo: { type: Object, default: null }
})

defineEmits(['delete', 'admin-ban'])

function generateDiceBearAvatar(seed) {
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`
}
</script>

<template>
  <div class="flex items-center justify-between mb-8">
    <div class="flex items-center gap-4">
      <div class="relative group/avatar">
        <img
          :src="generateDiceBearAvatar(msg.authorAlias || '匿名')"
          class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 p-1 transition-transform group-hover/avatar:scale-105 duration-500"
          alt="avatar"
        />
        <div
          v-if="isResonant"
          class="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-500 z-10 bg-gradient-to-tr from-purple-600 to-amber-400 border-amber-200/50 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse"
          title="与您深度同频的灵魂"
        >
          <Zap :size="12" fill="currentColor" />
        </div>
      </div>

      <div class="flex flex-col min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold tracking-tight text-slate-200 truncate max-w-[120px] sm:max-w-none">{{ msg.authorAlias || '匿名用户' }}</span>
          <span v-if="isConfession" class="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center gap-0.5">
            <span class="text-xs">🕯️</span>告解
          </span>
          <span v-if="toneInfo" class="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400 flex items-center gap-0.5">
            <span class="text-xs">{{ toneInfo.emoji }}</span>{{ toneInfo.label }}
          </span>
        </div>
        <span class="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{{ formatTime(msg.createTime) }}</span>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <div v-if="isConfession" class="hidden sm:flex flex-col items-end gap-1 mr-2">
        <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-700">24h confession</span>
        <span class="text-[10px] text-slate-500">{{ Number(msg.witnessCount || 0) }} candles lit</span>
      </div>
      <button
        v-if="isAdmin"
        class="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500/40 border border-red-500/10 hover:bg-red-500/10 hover:text-red-400 transition-all"
        @click.stop="$emit('admin-ban', msg.ipAddress)"
      >
        <Ban :size="16" />
      </button>
      <button
        v-if="msg.isOwner || isAdmin"
        class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 border border-white/5 hover:bg-red-500/10 hover:text-red-400 transition-all active:scale-90"
        @click.stop="$emit('delete', msg)"
      >
        <Trash2 :size="16" />
      </button>
    </div>
  </div>
</template>
