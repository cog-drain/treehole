<script setup>
import { Hash } from 'lucide-vue-next'

defineProps({
  tags: {
    type: Array,
    default: () => []
  },
  activeTag: {
    type: String,
    default: ''
  }
})

defineEmits(['tag-click'])
</script>

<template>
  <div v-if="tags.length > 0 && !activeTag" class="space-y-4">
    <div class="flex items-center gap-2 ml-1">
      <h3 class="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">热门共鸣</h3>
      <span class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50/70 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-emerald-600">
        Redis Rank
      </span>
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="tag in tags"
        :key="tag.id || tag.name"
        @click="$emit('tag-click', tag.name)"
        class="px-4 py-2 rounded-full text-xs font-medium bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all flex items-center gap-2 text-slate-400 hover:text-slate-200"
      >
        <Hash :size="12" class="opacity-50" />
        {{ tag.name }}
        <span class="opacity-30 font-mono">{{ tag.usageCount }}</span>
      </button>
    </div>
  </div>
</template>
