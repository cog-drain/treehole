<script setup>
import { Activity } from 'lucide-vue-next'

defineProps({
  viewMode: {
    type: String,
    required: true
  },
  onlineCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['set-view-mode'])
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-8">
    <div class="flex items-center gap-6">
      <button
        v-for="mode in ['list', 'graph']"
        :key="mode"
        @click="$emit('set-view-mode', mode)"
        class="text-xs font-bold tracking-widest transition-all relative py-2"
        :class="viewMode === mode ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'"
      >
        {{ mode === 'list' ? 'FEED' : 'CONSCIOUSNESS' }}
        <span v-if="viewMode === mode" class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
      </button>
    </div>
    <div class="inline-flex w-full sm:w-auto items-center justify-between sm:justify-start gap-3 rounded-full border border-slate-200 bg-white/60 px-3 py-2 text-slate-500 shadow-sm backdrop-blur-xl">
      <div class="flex items-center gap-2">
        <span class="relative flex h-2.5 w-2.5">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50"></span>
          <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        </span>
        <Activity :size="14" class="text-emerald-500" />
        <span class="text-[9px] font-bold uppercase tracking-[0.18em]">Online</span>
      </div>
      <div class="flex items-baseline gap-2">
        <span class="font-mono text-sm font-bold text-slate-800">{{ onlineCount }}</span>
        <span class="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">Redis ZSet</span>
      </div>
    </div>
  </div>
</template>
