<template>
  <div class="group/comment relative" :class="{ 'opacity-40 grayscale-[0.5] blur-[1px]': isCollapsed }">
    <div class="flex gap-4">
      <!-- Left Axis -->
      <div class="flex flex-col items-center flex-shrink-0 w-8 relative">
        <button 
          class="w-8 h-8 rounded-xl bg-white border border-slate-200 overflow-hidden hover:border-blue-500/40 transition-all active:scale-90 z-20 shrink-0 relative"
          @click="isCollapsed = !isCollapsed"
        >
          <img :src="generateDiceBearAvatar(comment.authorAlias || '匿名')" class="w-full h-full object-cover" alt="avatar" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0 space-y-3">
        <div class="flex items-center gap-3">
          <span 
            class="text-[11px] font-bold tracking-wide transition-all"
            :class="comment.authorAlias === '洞主' ? 'text-blue-400' : 'text-slate-400'"
          >
            {{ comment.authorAlias === '洞主' ? 'AUTHOR' : (comment.authorAlias || 'ANON') }}
          </span>
          
          <div v-if="comment.coFrequency" class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-orange-200/50 shadow-[0_2px_10px_rgba(251,191,36,0.15)]" style="background: rgba(255, 247, 237, 0.8); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
            <Zap :size="10" fill="#f97316" stroke="#f97316" />
            <span class="text-[9px] font-black uppercase tracking-widest" style="color: #7c2d12 !important; text-shadow: 0 0 10px rgba(251, 191, 36, 0.2);">RESONANCE</span>
          </div>

          <span class="text-[10px] font-mono text-slate-600">{{ formatRelativeTime(comment.createTime) }}</span>
          
          <button v-if="isCollapsed" @click="isCollapsed = false" class="text-[10px] font-bold text-blue-500 hover:underline uppercase tracking-widest">
            + {{ comment.children?.length || 0 }} reflections
          </button>
        </div>

        <template v-if="!isCollapsed">
          <p class="text-sm leading-relaxed text-slate-300 font-light break-words">{{ comment.content }}</p>

          <div v-if="comment.imageUrl" class="relative inline-block group/img mt-2">
            <img :src="comment.imageUrl" class="max-w-[200px] rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-zoom-in" @click.stop="openImage(comment.imageUrl)" />
          </div>

          <!-- Reactions Section -->
          <div class="flex flex-wrap items-center gap-2 mt-2">
            <div v-for="(count, emoji) in parsedReactions" :key="emoji" 
              class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-500 hover:bg-white/10 transition-all cursor-pointer select-none active:scale-95"
              @click.stop="addReaction(emoji)"
            >
              <span>{{ emoji }}</span>
              <span class="font-bold">{{ count }}</span>
            </div>

            <el-popover
              placement="top"
              :width="220"
              trigger="click"
              effect="dark"
              popper-class="cyber-popover"
            >
              <template #reference>
                <button class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-500 hover:text-blue-400 hover:bg-white/10 transition-all active:scale-90 group/react">
                  <Smile :size="12" />
                  <span class="text-[9px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all">React</span>
                </button>
              </template>
              <div class="flex justify-between gap-1 p-1">
                <button v-for="e in ['❤️', '😂', '👍', '🔥', '😭']" :key="e"
                  class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all text-lg active:scale-150"
                  @click="addReaction(e)"
                >
                  {{ e }}
                </button>
              </div>
            </el-popover>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-6 pt-2 opacity-0 group-hover/comment:opacity-100 transition-opacity">
            <button 
              class="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest"
              @click.stop="$emit('reply', comment)"
            >
              <MessageSquare :size="12" />
              <span>Reply</span>
            </button>
            <button 
              v-if="comment.isOwner || isAdmin"
              class="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest"
              @click.stop="$emit('delete', comment)"
            >
              <Trash2 :size="12" />
              <span>Remove</span>
            </button>
          </div>

          <!-- Nested (使用左边框实现完美的引导线，不再有尾巴) -->
          <div 
            v-if="comment.children?.length > 0" 
            class="pt-2 border-l-2 border-slate-200/40 dark:border-slate-700/30 pl-6 ml-[-20px] space-y-8"
          >
            <CommentItem
              v-for="child in comment.children"
              :key="child.id"
              :comment="child"
              :isAdmin="isAdmin"
              @reply="$emit('reply', $event)"
              @delete="$emit('delete', $event)"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { generateDiceBearAvatar } from '@/utils/avatar'
import { MessageSquare, Trash2, Zap, Smile } from 'lucide-vue-next'
import api from '@/api'

const props = defineProps({
  comment: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false }
})

const emit = defineEmits(['reply', 'delete'])
const isCollapsed = ref(false)

const formatRelativeTime = (time) => {
  if (!time) return ''
  const diff = Math.floor((new Date() - new Date(time)) / 1000)
  if (diff < 60) return 'NOW'
  if (diff < 3600) return `${Math.floor(diff / 60)}M AGO`
  if (diff < 86400) return `${Math.floor(diff / 3600)}H AGO`
  return `${Math.floor(diff / 86400)}D AGO`
}

const openImage = (url) => window.open(url, '_blank')

// --- Reactions Logic ---
const parsedReactions = computed(() => {
  if (!props.comment.reactions) return {}
  try {
    return JSON.parse(props.comment.reactions)
  } catch (e) {
    return {}
  }
})

const addReaction = async (emoji) => {
  try {
    await api.post(`/comment/react/${props.comment.id}?emoji=${encodeURIComponent(emoji)}`)
  } catch (e) {
    console.error('Comment reaction error:', e)
  }
}
</script>
