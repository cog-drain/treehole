<template>
  <div class="group/comment relative" :class="{ 'opacity-40 grayscale-[0.5] blur-[1px]': isCollapsed }">
    <div class="flex gap-4">
      <!-- Left Axis -->
      <div class="flex flex-col items-center">
        <button 
          class="w-8 h-8 rounded-xl bg-white/5 border border-white/10 overflow-hidden hover:border-blue-500/40 transition-all active:scale-90 z-10"
          @click="isCollapsed = !isCollapsed"
        >
          <img :src="generateDiceBearAvatar(comment.authorAlias || '匿名')" class="w-full h-full object-cover" alt="avatar" />
        </button>
        
        <!-- Thread Line -->
        <div 
          v-if="!isCollapsed && (comment.children?.length > 0 || comment.parentId)"
          class="flex-1 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent my-2 hover:bg-blue-500/30 transition-colors cursor-pointer"
          @click="isCollapsed = true"
        ></div>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0 space-y-3 pb-6">
        <div class="flex items-center gap-3">
          <span 
            class="text-[11px] font-bold tracking-wide transition-all"
            :class="comment.authorAlias === '洞主' ? 'text-blue-400' : 'text-slate-400'"
          >
            {{ comment.authorAlias === '洞主' ? 'AUTHOR' : (comment.authorAlias || 'ANON') }}
          </span>
          
          <div v-if="comment.coFrequency" class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Sparkles :size="8" class="text-blue-400" />
            <span class="text-[8px] font-bold text-blue-400 uppercase tracking-tighter">RESONANCE</span>
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

          <!-- Nested -->
          <div v-if="comment.children?.length > 0" class="pt-4 space-y-2">
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
import { ref } from 'vue'
import { generateDiceBearAvatar } from '@/utils/avatar'
import { MessageSquare, Trash2, Sparkles } from 'lucide-vue-next'

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
</script>
