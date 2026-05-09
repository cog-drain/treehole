<script setup>
import { ref, computed } from 'vue'
import { motion } from 'motion-v'
import { 
  MessageSquare, Trash2, Ban, Zap, Loader2, Play, Pause, X, Send
} from 'lucide-vue-next'
import { formatTime } from '@/utils/time.js'
import api from '@/api'
import { useAppStore } from '@/stores/app'
import { useUiStore } from '@/stores/ui'
import CommentThread from './CommentThread.vue'
import ReactionBar from '@/components/common/ReactionBar.vue'
import UiSlider from '@/components/ui/Slider.vue'
import { buildCommentThreads } from '@/utils/commentThreads'
import { getMessageSkinClass, normalizeMessageSkin } from '@/utils/messageSkins'

const appStore = useAppStore()
const uiStore = useUiStore()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const audioRef = ref(null)

const formatDuration = (s) => {
  if (!s || isNaN(s)) return '00:00'
  const min = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

function togglePlayback() {
  if (!audioRef.value) return
  if (isPlaying.value) audioRef.value.pause()
  else audioRef.value.play()
  isPlaying.value = !isPlaying.value
}

function onTimeUpdate() {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime
  duration.value = audioRef.value.duration
}

function onEnded() { isPlaying.value = false; currentTime.value = 0 }

function seek(val) {
  if (!audioRef.value) return
  audioRef.value.currentTime = val
}

const props = defineProps({
  msg: Object,
  liked: Boolean,
  isAdmin: Boolean
})

const emit = defineEmits([
  'like',
  'toggle-comments',
  'delete',
  'delete-comment',
  'publish-comment',
  'tag-click',
  'admin-ban',
  'react-comment'
])

// --- Resonance State ---
const isResonant = computed(() => props.msg.coFrequency && !props.msg.isOwner)
const effectiveSkin = computed(() => normalizeMessageSkin(props.msg.skin || props.msg.theme))

const commentThreads = computed(() => buildCommentThreads(props.msg._comments || []))

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

// --- Reactions Logic ---
const parsedReactions = computed(() => {
  if (!props.msg.reactions) return {}
  try {
    return JSON.parse(props.msg.reactions)
  } catch (e) {
    return {}
  }
})

const addReaction = async (emoji) => {
  try {
    await api.reactToMessage(props.msg.id, emoji)
  } catch (e) {
    console.error('Reaction error:', e)
  }
}

// --- Audio Message Filtering ---
const blockedDomains = ['pixabay.com', 'githubusercontent.com', 'archive.org']
const isUrlBlocked = (url) => {
  if (!url) return true
  return blockedDomains.some(domain => url.includes(domain))
}

const safeAudioUrl = computed(() => {
  return isUrlBlocked(props.msg.audioUrl) ? null : props.msg.audioUrl
})

// --- Message Actions ---
</script>

<template>
  <motion.div 
    :id="'msg-' + msg.id"
    class="glass-card p-5 sm:p-8 group/card overflow-hidden relative transition-all duration-700" 
    :class="[
      getMessageSkinClass(uiStore.colorMode, effectiveSkin),
      isResonant ? 'shadow-[0_0_50px_rgba(139,92,246,0.2)] border-purple-500/30 scale-[1.01]' : '',
      msg.isOwner && appStore.camoEnabled ? 'camo-effect' : ''
    ]"
    :initial="{ opacity: 0, y: 22, scale: 0.98 }"
    :animate="{ opacity: 1, y: 0, scale: 1 }"
    :while-hover="{ y: -6, scale: 1.012 }"
    :transition="{ type: 'spring', stiffness: 210, damping: 22, mass: 0.8 }"
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
          <!-- Resonance Indicator (The Lightning Bolt) -->
          <div 
            v-if="isResonant"
            class="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-500 z-10 bg-gradient-to-tr from-purple-600 to-amber-400 border-amber-200/50 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse"
            title="与您深度同频的灵魂"
          >
            <Zap :size="12" fill="currentColor" />
          </div>
        </div>
        
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold tracking-tight text-slate-200 truncate max-w-[120px] sm:max-w-none">{{ msg.authorAlias || '匿名用户' }}</span>
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

      <div v-if="msg.audioUrl" class="mt-4 p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 group/audio max-w-md mx-auto">
        <audio 
          ref="audioRef" 
          :src="safeAudioUrl" 
          @timeupdate="onTimeUpdate" 
          @ended="onEnded"
          @error="(e) => console.log('Audio suppressed or unreachable')"
          class="hidden"
        ></audio>

        <button 
          @click.stop="togglePlayback" 
          class="w-10 h-10 rounded-full bg-blue-500/80 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-90 transition-all hover:bg-blue-500"
        >
          <Play v-if="!isPlaying" :size="16" fill="currentColor" />
          <Pause v-else :size="16" fill="currentColor" />
        </button>

        <div class="flex-1 space-y-1">
          <div class="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            <span>{{ formatDuration(currentTime) }}</span>
            <div class="flex gap-0.5">
              <div v-for="i in 8" :key="i" 
                class="w-0.5 bg-blue-400/40 rounded-full transition-all"
                :class="{ 'animate-[bounce_0.6s_infinite]': isPlaying }"
                :style="{ 
                  height: (Math.sin(i) * 6 + 8) + 'px', 
                  animationDelay: (i * 0.1) + 's',
                  opacity: isPlaying ? 0.8 : 0.2
                }"
              ></div>
            </div>
            <span>{{ formatDuration(duration) }}</span>
          </div>
          <UiSlider
            v-model="currentTime" 
            :max="duration || 1" 
            @input="seek"
            class="cyber-slider-mini"
          />
        </div>
      </div>
      <div v-if="msg.imageUrl" class="relative group/img">
        <img :src="msg.imageUrl" class="w-full rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-zoom-in shadow-lg" @click="openImage(msg.imageUrl)" />
      </div>
    </div>

    <!-- Footer Action Bar -->
    <div class="mt-8 flex flex-col gap-4 border-t border-white/5 pt-6">
      <ReactionBar
        :reactions="parsedReactions"
        show-resonance
        :resonance-count="msg.likes || 0"
        :resonated="liked"
        @react="addReaction"
        @resonate="$emit('like', msg)"
      />

      <button 
        class="inline-flex w-fit items-center gap-2 sm:gap-3 rounded-full border border-transparent bg-white/5 px-4 py-2.5 text-slate-400 transition-all hover:bg-white/10 hover:text-slate-200 active:scale-95"
        @click="$emit('toggle-comments', msg)"
      >
        <div class="relative">
          <MessageSquare :size="18" />
          <span v-if="msg.commentCount > 0 && !msg._read" class="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
        </div>
        <span class="text-[10px] sm:text-xs font-bold tracking-widest uppercase">{{ msg._showComments ? 'CLOSE' : 'REPLY' }}</span>
        <span v-if="msg.commentCount > 0" class="text-[10px] font-mono opacity-40">[{{ msg.commentCount }}]</span>
      </button>
    </div>

    <!-- Comments Section -->
    <div v-if="msg._showComments" class="mt-8 pt-8 border-t border-white/5 space-y-6 animate-in slide-in-from-top-4 duration-500">
      <div v-if="commentThreads.length === 0" class="py-10 text-center">
        <p class="text-xs font-bold tracking-widest text-slate-600 uppercase italic">Silence is a message too...</p>
      </div>
      
      <div class="space-y-5">
        <CommentThread
          v-for="thread in commentThreads"
          :key="thread.rootComment.id"
          :thread="thread"
          :isAdmin="isAdmin"
          @reply="(c) => { msg._replyToId = c.id; msg._commentText = `@${c.authorAlias} ` }"
          @delete="(c) => $emit('delete-comment', {msg, comment: c})"
          @react="({ comment, emoji }) => $emit('react-comment', { msg, comment, emoji })"
        />
      </div>

      <!-- Comment Input -->
      <div class="pt-4 flex gap-3">
        <div class="flex-1 relative">
          <div
            v-if="msg._replyToId"
            class="mb-2 flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/8 px-3 py-2 text-[11px] font-medium text-blue-400"
          >
            <span class="truncate">正在回复 {{ msg._commentText.split(' ')[0] }}</span>
            <button class="rounded-full p-1 transition-colors hover:bg-blue-500/10 hover:text-blue-300" @click="msg._replyToId = null; msg._commentText = ''">
              <X :size="12" />
            </button>
          </div>
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
  </motion.div>
</template>

<style scoped>
/* Camo Effect */
.camo-effect {
  position: relative;
  opacity: 0.85;
  filter: saturate(0.5) contrast(1.3) brightness(1.1);
  animation: thermoptic-camo 8s infinite;
}

:global(.dark) .camo-effect {
  filter: saturate(0.6) contrast(1.2) brightness(1.3);
}

.camo-effect::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(transparent, transparent 2px, rgba(99, 102, 241, 0.1) 3px, rgba(99, 102, 241, 0.15) 4px);
  pointer-events: none;
  z-index: 10;
  opacity: 0.7;
  animation: scanline-shift 10s linear infinite;
}

:global(.dark) .camo-effect::before {
  background: repeating-linear-gradient(transparent, transparent 2px, rgba(167, 139, 250, 0.15) 3px, rgba(167, 139, 250, 0.2) 4px);
}

.camo-effect::after {
  content: "";
  position: absolute;
  inset: -2px;
  background: linear-gradient(
    45deg, 
    transparent 40%, 
    rgba(56, 189, 248, 0.4) 47%, 
    rgba(255, 255, 255, 0.9) 50%, 
    rgba(168, 85, 247, 0.4) 53%, 
    transparent 60%
  );
  background-size: 200% 200%;
  z-index: 20;
  pointer-events: none;
  mix-blend-mode: hard-light;
  animation: camo-glare 6s infinite ease-in-out;
}

:global(.dark) .camo-effect::after {
  background: linear-gradient(45deg, transparent 40%, rgba(139, 92, 246, 0.2) 45%, rgba(139, 92, 246, 0.5) 50%, rgba(139, 92, 246, 0.2) 55%, transparent 60%);
  mix-blend-mode: color-dodge;
}

@keyframes thermoptic-camo {
  0% { opacity: 0.85; filter: blur(0px) hue-rotate(0deg); transform: skewX(0deg); }
  94% { opacity: 0.85; filter: blur(0px) hue-rotate(0deg); transform: skewX(0deg); }
  95% { opacity: 0.4; filter: blur(2px) hue-rotate(90deg); transform: skewX(2deg) translateX(2px); }
  96% { opacity: 0.9; filter: blur(0px) hue-rotate(-90deg); transform: skewX(-2deg) translateX(-2px); }
  97% { opacity: 0.85; filter: blur(0px) hue-rotate(0deg); transform: skewX(0deg); }
  100% { opacity: 0.85; filter: blur(0px) hue-rotate(0deg); transform: skewX(0deg); }
}

@keyframes scanline-shift {
  0% { background-position: 0 0; }
  100% { background-position: 0 100px; }
}

@keyframes camo-glare {
  0% { background-position: 200% 200%; opacity: 0; }
  10% { opacity: 1; }
  20% { background-position: -50% -50%; opacity: 0; }
  100% { background-position: -50% -50%; opacity: 0; }
}
</style>
