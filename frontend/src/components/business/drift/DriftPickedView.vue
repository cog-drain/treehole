<template>
  <div class="relative z-10 space-y-6 animate-in zoom-in-95 duration-500">
    <div class="flex items-center justify-between p-4 rounded-2xl border bg-black/[0.02] border-black/5">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white shadow-sm">✉️</div>
        <div>
          <el-text class="font-bold block !text-slate-800">来自 {{ pickedData.authorAlias }} 的漂流瓶</el-text>
          <el-text size="small" class="!text-slate-400">{{ formatTime(pickedData.createTime) }}</el-text>
        </div>
      </div>
    </div>

    <div
      class="p-8 rounded-[2.5rem] border italic text-sm leading-loose tracking-wide min-h-[100px] flex items-center justify-center text-center transition-all duration-500"
      :class="[
        'bg-black/[0.04] border-black/5 text-slate-800 shadow-inner',
        isReplying ? 'scale-95 opacity-60 blur-[1px]' : ''
      ]"
    >
      <span v-if="pickedData.content && String(pickedData.content).trim()">"{{ pickedData.content }}"</span>
      <span v-else class="opacity-40 not-italic">这个瓶子里空无一物，只留下了海浪的气息...</span>
    </div>

    <Transition name="page">
      <div v-if="isReplying" class="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
        <div class="glass-card !p-1 overflow-hidden bg-black/5 border-black/5">
          <el-input
            :model-value="replyContent"
            type="textarea"
            :rows="4"
            placeholder="给予这段缘分一份温热的回响..."
            class="zen-textarea-light"
            resize="none"
            autofocus
            @update:model-value="$emit('update:replyContent', $event)"
          />
        </div>
      </div>
    </Transition>

    <div class="flex gap-4">
      <template v-if="!isReplying">
        <el-button
          class="!w-12 !h-12 !p-0 !border-none !rounded-xl !bg-black/[0.05] !text-slate-500 hover:!bg-black/10"
          title="换一个"
          @click="$emit('pick')"
        >
          <RefreshCw class="w-5 h-5" />
        </el-button>
        <el-button
          class="flex-1 !border-none !rounded-xl !h-12 !bg-black/[0.05] !text-slate-500 hover:!bg-black/10"
          @click="$emit('return')"
        >放回大海</el-button>
        <el-button class="flex-[2] !bg-cyan-600 hover:!bg-cyan-500 !border-none !text-white !rounded-xl !h-12 shadow-lg shadow-cyan-600/20" @click="$emit('start-reply')">
          回信给 Ta
        </el-button>
      </template>
      <template v-else>
        <el-button
          class="flex-1 !border-none !rounded-xl !h-12 !bg-black/[0.05] !text-slate-500 hover:!bg-black/10"
          @click="$emit('cancel-reply')"
        >取消</el-button>
        <el-button
          class="flex-[2] !bg-cyan-600 hover:!bg-cyan-500 !border-none !text-white !rounded-xl !h-12 shadow-lg shadow-cyan-600/20"
          :disabled="!replyContent.trim()"
          @click="$emit('reply')"
        >发送回响</el-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'
import { formatTime } from '@/utils/time'
import type { Bottle } from '@/types'

withDefaults(defineProps<{
  pickedData: Bottle
  replyContent?: string
  isReplying?: boolean
}>(), {
  replyContent: '',
  isReplying: false
})

defineEmits<{
  (event: 'update:replyContent', value: string): void
  (event: 'pick'): void
  (event: 'return'): void
  (event: 'start-reply'): void
  (event: 'cancel-reply'): void
  (event: 'reply'): void
}>()
</script>
