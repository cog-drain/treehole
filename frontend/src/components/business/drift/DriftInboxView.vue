<template>
  <div class="relative z-10 space-y-4 animate-in slide-in-from-left-4 duration-500">
    <div class="flex items-center gap-2 mb-2">
      <el-button link class="!text-slate-500" @click="$emit('back')">
        <ChevronLeft class="w-4 h-4 mr-1" /> 返回
      </el-button>
    </div>

    <div class="max-h-[350px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
      <div v-if="bottles.length === 0" class="py-12 text-center opacity-30 text-sm italic">
        海面上静悄悄的，还没有回响...
      </div>
      <div
        v-for="bottle in bottles"
        :key="bottle.id"
        class="p-5 rounded-3xl border transition-all hover:border-cyan-500/30 bg-white border-black/5 shadow-sm hover:shadow-md"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg">✉️</div>
            <div class="flex flex-col">
              <span class="text-[10px] uppercase tracking-widest opacity-40 leading-none">My Message</span>
              <span class="text-[10px] font-bold text-emerald-600"># {{ bottle.id }}</span>
            </div>
          </div>
          <el-text size="small" class="opacity-20 text-[9px]">{{ formatTime(bottle.createTime) }}</el-text>
        </div>

        <div class="text-sm px-4 py-3 rounded-2xl bg-black/[0.02] border border-black/5 mb-4 italic opacity-80">
          “ {{ bottle.content }} ”
        </div>

        <div v-if="bottle.replyContent" class="relative mt-6 pt-6 border-t border-dashed border-black/10">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-lg shadow-cyan-500/20">
            REPLY RECEIVED
          </div>

          <div class="flex items-center gap-2 mb-3">
            <div class="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-sm">👤</div>
            <div class="flex flex-col">
              <span class="text-[9px] uppercase tracking-tighter opacity-40 leading-none">From Echo</span>
              <span class="text-xs font-bold text-cyan-600">{{ bottle.replyAuthorAlias || '一位不愿透露姓名的路人' }}</span>
            </div>
          </div>

          <div class="text-sm px-4 py-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-900 leading-relaxed font-medium">
            “ {{ bottle.replyContent }} ”
          </div>
          <div class="text-[9px] text-right mt-2 opacity-30 italic">{{ formatTime(bottle.replyTime) }}</div>
        </div>
        <div v-else class="text-center py-4 opacity-20 text-[10px] italic tracking-widest">
          漂流中，等待跨越海洋的回响...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
import { formatTime } from '@/utils/time'
import type { Bottle } from '@/types'

withDefaults(defineProps<{
  bottles?: Bottle[]
}>(), {
  bottles: () => []
})

defineEmits<{
  (event: 'back'): void
}>()
</script>
