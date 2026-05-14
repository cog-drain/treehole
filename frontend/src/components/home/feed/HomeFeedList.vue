<template>
  <div v-if="viewMode === 'list'" class="space-y-12">
    <div v-if="total > 0" class="space-y-12">
      <TransitionGroup name="msg-list">
        <MessageCard
          v-for="(msg, index) in messages"
          :key="msg.id"
          :msg="msg"
          :liked="likedIds.has(msg.id)"
          :class="['theme-' + (msg.theme || 'default'), 'animate__animated animate__fadeInUp']"
          :style="{ animationDelay: (index * 100) + 'ms' }"
          :is-admin="isAdmin"
          @like="$emit('like', $event)"
          @toggle-comments="$emit('toggle-comments', $event)"
          @delete="$emit('delete', $event)"
          @delete-comment="$emit('delete-comment', $event)"
          @publish-comment="$emit('publish-comment', $event)"
          @react="$emit('react')"
          @witness="$emit('witness')"
          @tag-click="$emit('tag-click', $event)"
          @admin-ban="$emit('admin-ban', $event)"
        />
      </TransitionGroup>

      <div class="flex justify-center pt-16 pb-32">
        <nav class="flex items-center gap-1 p-2 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
          <button
            class="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 group disabled:opacity-20 disabled:cursor-not-allowed hover:bg-blue-500/10"
            :disabled="pageNum <= 1"
            @click="$emit('page-change', pageNum - 1)"
          >
            <ChevronLeft :size="18" class="text-slate-400 group-hover:text-blue-400 transition-colors" />
          </button>

          <div class="flex items-center gap-1">
            <button
              v-for="p in totalPages"
              :key="p"
              class="w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-500 relative group"
              :class="pageNum === p ? 'text-white' : 'text-slate-500 hover:text-slate-200'"
              @click="$emit('page-change', p)"
            >
              <div
                v-if="pageNum === p"
                class="absolute inset-0 rounded-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/50 animate-in zoom-in duration-300"
              ></div>
              <span class="relative z-10">{{ p }}</span>
            </button>
          </div>

          <button
            class="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 group disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5"
            :disabled="pageNum >= totalPages"
            @click="$emit('page-change', pageNum + 1)"
          >
            <ChevronRight :size="18" class="text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </nav>
      </div>
    </div>

    <div v-else class="py-24 text-center space-y-6">
      <div class="text-6xl opacity-20 grayscale">🌌</div>
      <div class="space-y-2">
        <h4 class="text-slate-400 font-medium">这里还是一片虚无</h4>
        <p class="text-xs text-slate-600">你是第一个发现这里的人吗？</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import MessageCard from '@/components/business/MessageCard.vue'

defineProps({
  viewMode: { type: String, required: true },
  messages: { type: Array, default: () => [] },
  likedIds: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false },
  pageNum: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
  totalPages: { type: Number, default: 1 }
})

defineEmits([
  'like',
  'toggle-comments',
  'delete',
  'delete-comment',
  'publish-comment',
  'react',
  'witness',
  'tag-click',
  'admin-ban',
  'page-change'
])
</script>
