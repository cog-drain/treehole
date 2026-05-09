<template>
  <div class="space-y-8">
    <div v-if="trendingTags.length > 0 && !activeTag" class="space-y-4">
      <h3 class="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold ml-1">热门共鸣</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in trendingTags"
          :key="tag.id"
          @click="$emit('tag-click', tag.name)"
          class="px-4 py-2 rounded-full text-xs font-medium bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all flex items-center gap-2 text-slate-400 hover:text-slate-200"
        >
          <Hash :size="12" class="opacity-50" />
          {{ tag.name }}
          <span class="opacity-30 font-mono">{{ tag.usageCount }}</span>
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between pt-8">
      <div class="flex items-center gap-6">
        <button
          v-for="modeOption in ['list', 'graph']"
          :key="modeOption"
          @click="$emit('update:viewMode', modeOption)"
          class="text-xs font-bold tracking-widest transition-all relative py-2"
          :class="viewMode === modeOption ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'"
        >
          {{ modeOption === 'list' ? 'FEED' : 'CONSCIOUSNESS' }}
          <span v-if="viewMode === modeOption" class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Hash } from 'lucide-vue-next'

defineProps({
  trendingTags: { type: Array, default: () => [] },
  activeTag: { type: String, default: '' },
  viewMode: { type: String, default: 'list' }
})

defineEmits(['tag-click', 'update:viewMode'])
</script>
