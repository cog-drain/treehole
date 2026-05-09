<template>
  <UiModal v-model="visibleProxy" max-width="31.25rem">
    <div class="py-6 space-y-6">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h2 class="text-sm font-bold tracking-widest uppercase text-amber-400">离线暂存胶囊</h2>
          <p class="text-[10px] text-slate-500 uppercase">Offline Message Buffer ({{ offlineQueueCount }} items)</p>
        </div>
        <button v-if="isOnline" @click="$emit('sync')" class="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/20 transition-all">立即同步</button>
      </div>

      <div class="max-h-[350px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        <div v-for="item in items" :key="item.id" class="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
          <div class="flex justify-between items-start mb-2">
            <span class="text-[10px] font-bold text-blue-400/60 uppercase tracking-tighter">{{ item.authorAlias || '匿名访客' }}</span>
            <div class="flex gap-3">
              <button @click="$emit('edit', item)" class="text-slate-500 hover:text-blue-400 transition-colors" title="载入并编辑">
                <Edit2 :size="14" />
              </button>
              <button @click="$emit('remove', item.id)" class="text-slate-500 hover:text-red-400 transition-colors" title="删除">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
          <p class="text-sm text-slate-300 leading-relaxed mb-3">{{ item.content }}</p>
          <div class="flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <span>{{ formatTime(item.timestamp) }}</span>
            <span class="px-2 py-0.5 rounded-full bg-slate-800 border border-white/5 uppercase">{{ item.skin || item.theme }}</span>
          </div>
        </div>
      </div>

      <div v-if="!isOnline" class="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3 items-start">
        <ShieldAlert class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p class="text-[10px] text-amber-600/80 leading-relaxed font-medium">
          当前处于离线状态。留言已安全加密暂存在浏览器本地，待网络恢复后我们将自动尝试为您发射。
        </p>
      </div>
    </div>
  </UiModal>
</template>

<script setup>
import { computed } from 'vue'
import UiModal from '@/components/ui/Modal.vue'
import { Edit2, ShieldAlert, Trash2 } from 'lucide-vue-next'
import { formatTime } from '@/utils/time.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  offlineQueueCount: { type: Number, default: 0 },
  items: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:visible', 'sync', 'edit', 'remove'])

const visibleProxy = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})
</script>
