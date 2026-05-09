<template>
  <article
    class="comment-item group/comment rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 transition-all"
    :class="isReply ? 'shadow-none' : 'shadow-[0_12px_32px_-24px_rgba(15,23,42,0.45)]'"
  >
    <div class="flex gap-3">
      <div class="shrink-0">
        <div class="h-9 w-9 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <img :src="generateDiceBearAvatar(comment.authorAlias || '匿名')" class="h-full w-full object-cover" alt="avatar" />
        </div>
      </div>

      <div class="min-w-0 flex-1 space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="text-[11px] font-bold uppercase tracking-[0.18em]"
            :class="comment.authorAlias === '洞主' ? 'text-blue-400' : 'text-slate-500'"
          >
            {{ comment.authorAlias === '洞主' ? 'AUTHOR' : (comment.authorAlias || 'ANON') }}
          </span>

          <div
            v-if="comment.coFrequency"
            class="inline-flex items-center gap-1 rounded-full border border-amber-200/40 bg-amber-50/70 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-amber-900 shadow-[0_8px_20px_-18px_rgba(245,158,11,0.6)]"
          >
            <Zap :size="10" />
            <span>Resonance</span>
          </div>

          <span class="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
            {{ formatRelativeTime(comment.createTime) }}
          </span>
        </div>

        <div v-if="isReply && comment.replyToAuthorAlias" class="text-[11px] font-medium text-slate-500">
          回复
          <span class="text-blue-400">@{{ comment.replyToAuthorAlias }}</span>
        </div>

        <p class="break-words text-sm leading-7 text-slate-200/90">
          {{ comment.content }}
        </p>

        <div v-if="comment.imageUrl" class="relative inline-block max-w-[220px] overflow-hidden rounded-2xl border border-white/10">
          <img :src="comment.imageUrl" class="w-full cursor-zoom-in transition-all hover:scale-[1.02]" @click.stop="openImage(comment.imageUrl)" />
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <ReactionBar
            compact
            :reactions="comment.reactions"
            @react="(emoji) => $emit('react', { comment, emoji })"
          />

          <div class="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <button class="transition-colors hover:text-blue-400" @click.stop="$emit('reply', comment)">
              Reply
            </button>
            <button
              v-if="comment.isOwner || isAdmin"
              class="transition-colors hover:text-red-400"
              @click.stop="$emit('delete', comment)"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { Zap } from 'lucide-vue-next'
import { generateDiceBearAvatar } from '@/utils/avatar'
import ReactionBar from '@/components/common/ReactionBar.vue'

const props = defineProps({
  comment: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false },
  isReply: { type: Boolean, default: false }
})

defineEmits(['reply', 'delete', 'react'])

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
