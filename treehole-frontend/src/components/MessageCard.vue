<script setup>
import { ref, computed } from 'vue'
import { 
  Heart, MessageSquare, Share2, Trash2, ImagePlus, Send, 
  ChevronDown, ChevronUp, Mic, X, MoreHorizontal, Ban, Sparkles, Zap, Hash, Loader2
} from 'lucide-vue-next'
import { formatTime } from '@/utils/time.js'
import api, { getToken, MSG_TOKEN_KEY, CMT_TOKEN_KEY } from '@/api'

const props = defineProps({
  msg: Object,
  liked: Boolean,
  isAdmin: Boolean
})

const emit = defineEmits(['like', 'toggle-comments', 'delete', 'delete-comment', 'publish-comment', 'tag-click', 'admin-ban'])

// --- Card Style State ---
const cardStyle = ref(localStorage.getItem(`card_pref_${props.msg.id}`) || 'default')
const cycleStyle = () => {
  const styles = ['default', 'luminous', 'minimal']
  const next = styles[(styles.indexOf(cardStyle.value) + 1) % styles.length]
  cardStyle.value = next
  localStorage.setItem(`card_pref_${props.msg.id}`, next)
}

// --- Local UI State ---
const moodMap = { '开心': '😄', '难过': '😢', '愤怒': '😡', '平静': '😌', '迷茫': '🤔' }
function generateDiceBearAvatar(seed) {
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`
}

const parseContent = (content) => {
  if (!content) return []
  const parts = []
  const regex = /(#[^\s#]+)/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: content.substring(lastIndex, match.index), isTag: false })
    }
    parts.push({ text: match[0], isTag: true })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < content.length) {
    parts.push({ text: content.substring(lastIndex), isTag: false })
  }
  return parts
}

const openImage = (url) => { window.open(url, '_blank') }
</script>

<template>
  <div 
    :id="'msg-' + msg.id"
    class="glass-card !p-8 group/card overflow-hidden relative transition-all duration-700" 
    :class="[
      'theme-' + (msg.theme || 'default'),
      cardStyle === 'luminous' ? 'shadow-[0_0_50px_rgba(59,130,246,0.15)] border-white/20 scale-[1.01]' : '',
      cardStyle === 'minimal' ? 'backdrop-blur-sm bg-white/[0.02] border-white/5 opacity-90' : ''
    ]"
  >
    <div v-if="msg.isOwner" class="owner-indicator-line absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-60"></div>
    
    <!-- Msg Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <div class="relative group/avatar">
          <img
            :src="generateDiceBearAvatar(msg.authorAlias || '匿名')"
            class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 p-1 transition-transform group-hover/avatar:scale-105 duration-500"
            alt="avatar"
          />
          <button 
            @click.stop="cycleStyle"
            class="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-500 z-10"
            :class="[
              msg.commentCount > 0 && !msg._read 
                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse' 
                : 'bg-slate-900 border-white/10 text-slate-500 hover:text-white hover:border-white/30',
              cardStyle !== 'default' ? 'rotate-12 scale-110' : ''
            ]"
          >
            <Zap :size="12" :fill="cardStyle === 'luminous' ? 'currentColor' : 'none'" />
          </button>
        </div>
        
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold tracking-tight text-slate-200">{{ msg.authorAlias || '匿名用户' }}</span>
            <span class="text-lg" v-if="msg.mood && moodMap[msg.mood]">{{ moodMap[msg.mood] }}</span>
          </div>
          <span class="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{{ formatTime(msg.createTime) }}</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="isAdmin"
          class="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500/40 border border-red-500/10 hover:bg-red-500/10 hover:text-red-400 transition-all"
          @click.stop="$emit('admin-ban', msg.ipAddress)"
        >
          <Ban :size="16" />
        </button>
        <button 
          v-if="msg.isOwner || isAdmin" 
          class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-slate-500 border border-white/5 hover:bg-red-500/10 hover:text-red-400 transition-all active:scale-90" 
          @click.stop="$emit('delete', msg)"
        >
          <Trash2 :size="16" />
        </button>
      </div>
    </div>

    <!-- Msg Content -->
    <div class="space-y-6">
      <div class="text-lg leading-relaxed text-slate-200/90 whitespace-pre-wrap break-words font-light">
        <template v-for="(part, index) in parseContent(msg.content)" :key="index">
          <span v-if="part.isTag" class="text-blue-400 font-bold hover:underline cursor-pointer" @click.stop="$emit('tag-click', part.text.substring(1))">{{ part.text }}</span>
          <span v-else>{{ part.text }}</span>
        </template>
      </div>
      <div v-if="msg.audioUrl" class="p-2 rounded-2xl bg-white/5 border border-white/5">
        <audio controls :src="msg.audioUrl" class="w-full h-8 filter invert opacity-60"></audio>
      </div>
      <div v-if="msg.imageUrl" class="relative group/img">
        <img :src="msg.imageUrl" class="w-full rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-zoom-in shadow-lg" @click="openImage(msg.imageUrl)" />
      </div>
    </div>

    <!-- Footer Action Bar -->
    <div class="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
      <button
        class="flex items-center gap-3 px-5 py-2.5 rounded-full transition-all active:scale-95 group/hug"
        :class="liked ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'"
        @click="$emit('like', msg)"
      >
        <span class="text-lg group-hover/hug:scale-125 transition-transform" :class="{ 'animate-pulse': liked }">🫂</span>
        <span class="text-xs font-bold font-mono tracking-widest">{{ msg.likes || 0 }}</span>
      </button>

      <button 
        class="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-all active:scale-95"
        @click="$emit('toggle-comments', msg)"
      >
        <div class="relative">
          <MessageSquare :size="18" />
          <span v-if="msg.commentCount > 0 && !msg._read" class="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
        </div>
        <span class="text-xs font-bold tracking-widest uppercase">{{ msg._showComments ? 'CLOSE' : 'REPLY' }}</span>
        <span v-if="msg.commentCount > 0" class="text-[10px] font-mono opacity-40">[{{ msg.commentCount }}]</span>
      </button>
    </div>

    <!-- Comments Section -->
    <div v-if="msg._showComments" class="mt-8 pt-8 border-t border-white/5 space-y-6 animate-in slide-in-from-top-4 duration-500">
      <div v-for="cmt in msg._comments" :key="cmt.id" class="group/cmt flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all relative">
        <img :src="generateDiceBearAvatar(cmt.authorAlias || '匿名')" class="w-10 h-10 rounded-xl bg-white/5 p-1 flex-shrink-0" />
        <div class="flex-1 space-y-1">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-300">{{ cmt.authorAlias }}</span>
              <span v-if="cmt.isOwner" class="px-1.5 py-0.5 rounded text-[7px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">Author</span>
            </div>
            <span class="text-[9px] font-mono text-slate-600">{{ formatTime(cmt.createTime) }}</span>
          </div>
          <p class="text-sm text-slate-400 leading-relaxed">{{ cmt.content }}</p>
          <img v-if="cmt.imageUrl" :src="cmt.imageUrl" class="mt-2 max-w-[200px] rounded-lg border border-white/5" @click="openImage(cmt.imageUrl)" />
        </div>
        <button 
          v-if="cmt.isOwner || isAdmin || getToken(CMT_TOKEN_KEY, cmt.id)" 
          @click="$emit('delete-comment', {msg, comment: cmt})"
          class="absolute top-4 right-4 opacity-0 group-hover/cmt:opacity-100 p-1.5 text-slate-600 hover:text-red-400 transition-all"
        >
          <Trash2 :size="12" />
        </button>
      </div>

      <!-- Comment Input -->
      <div class="pt-4 flex gap-3">
        <div class="flex-1 relative">
          <textarea 
            v-model="msg._commentText" 
            class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 resize-none" 
            placeholder="写下你的回响..." 
            rows="1"
            @keyup.enter.ctrl="() => $emit('publish-comment', msg)"
          ></textarea>
        </div>
        <button 
          class="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-600 text-white hover:bg-blue-500 transition-all active:scale-90 disabled:opacity-50"
          :disabled="msg._commenting || (!msg._commentText && !msg._commentImage)"
          @click="$emit('publish-comment', msg)"
        >
          <Loader2 v-if="msg._commenting" class="animate-spin" :size="18" />
          <Send v-else :size="18" />
        </button>
      </div>
    </div>
  </div>
</template>
