<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  Heart, MessageSquare, Share2, Trash2, ImagePlus, Send, 
  ChevronDown, ChevronUp, Mic, X, MoreHorizontal, Ban, Sparkles, Zap, Hash, Loader2, Play, Pause, Smile, Music
} from 'lucide-vue-next'
import { formatTime } from '@/utils/time.js'
import CommentItem from './CommentItem.vue'
import api, { getToken, MSG_TOKEN_KEY, CMT_TOKEN_KEY } from '@/api'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const audioRef = ref(null)
const now = ref(Date.now())
let countdownTimer = null

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

const emit = defineEmits(['like', 'toggle-comments', 'delete', 'delete-comment', 'publish-comment', 'tag-click', 'admin-ban'])

// --- Resonance State ---
const isResonant = computed(() => props.msg.coFrequency && !props.msg.isOwner)

// --- Comment Tree Logic ---
const commentTree = computed(() => {
  const list = props.msg._comments || []
  const map = {}
  const tree = []
  list.forEach(c => {
    map[c.id] = { ...c, children: [] }
  })
  list.forEach(c => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].children.push(map[c.id])
    } else {
      tree.push(map[c.id])
    }
  })
  return tree
})

// --- Local UI State ---
const toneMap = {
  'whisper': { emoji: '🤫', label: '悄悄话', class: 'tone-whisper' },
  'shout':   { emoji: '📢', label: '大声说', class: 'tone-shout' },
  'dream':   { emoji: '💤', label: '梦话', class: 'tone-dream' },
  'glitch':  { emoji: '👾', label: '电波', class: 'tone-glitch' },
  'poetic':  { emoji: '🌙', label: '诗意', class: 'tone-poetic' }
}
const toneInfo = computed(() => props.msg.mood && toneMap[props.msg.mood] ? toneMap[props.msg.mood] : null)
const isConfession = computed(() => props.msg.messageType === 'confession')
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
const reactionEmojis = ['❤️', '😂', '👍', '🔥', '😭']
const parsedReactions = computed(() => {
  if (!props.msg.reactions) return {}
  try {
    return JSON.parse(props.msg.reactions)
  } catch (e) {
    return {}
  }
})

const reactedKey = computed(() => `treehole_msg_reacted_${props.msg.id}`)
const getReactedEmoji = () => localStorage.getItem(reactedKey.value)
const hasReacted = (emoji) => getReactedEmoji() === emoji

const toggleReaction = async (emoji) => {
  const currentEmoji = getReactedEmoji()
  try {
    await api.reactToMessage(props.msg.id, emoji)
    if (currentEmoji === emoji) {
      localStorage.removeItem(reactedKey.value)
    } else {
      localStorage.setItem(reactedKey.value, emoji)
    }
  } catch (e) {
    console.error('Reaction error:', e)
  }
}

// --- Comment Sorting ---
const commentSort = ref('oldest')
const sortedCommentTree = computed(() => {
  const tree = [...commentTree.value]
  if (commentSort.value === 'newest') {
    tree.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
  } else if (commentSort.value === 'hottest') {
    tree.sort((a, b) => (b.children?.length || 0) - (a.children?.length || 0))
  }
  return tree
})

// --- Reply-to State ---
const replyTarget = computed(() => {
  if (!props.msg._replyToId) return null
  const list = props.msg._comments || []
  return list.find(c => c.id === props.msg._replyToId) || null
})

const clearReply = () => {
  props.msg._replyToId = null
  props.msg._commentText = ''
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

const witnessCount = computed(() => Number(props.msg.witnessCount || 0))
const expiresAtMs = computed(() => props.msg.expiresAt ? new Date(props.msg.expiresAt).getTime() : 0)
const remainingMs = computed(() => Math.max(0, expiresAtMs.value - now.value))
const remainingLabel = computed(() => {
  if (!isConfession.value || !expiresAtMs.value) return ''
  const totalMinutes = Math.ceil(remainingMs.value / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours <= 0) return `${minutes}m left`
  return `${hours}h ${minutes.toString().padStart(2, '0')}m left`
})
const candleBurnPercent = computed(() => {
  if (!isConfession.value || !props.msg.createTime || !expiresAtMs.value) return 0
  const created = new Date(props.msg.createTime).getTime()
  const total = Math.max(1, expiresAtMs.value - created)
  return Math.min(100, Math.max(0, ((now.value - created) / total) * 100))
})

async function witnessConfession() {
  if (!isConfession.value || props.msg.witnessedByMe) return
  try {
    const res = await api.witnessMessage(props.msg.id)
    props.msg.witnessCount = res.data?.witnessCount ?? witnessCount.value + 1
    props.msg.witnessedByMe = true
  } catch (e) {
    console.error('Witness error:', e)
  }
}

onMounted(() => {
  countdownTimer = window.setInterval(() => { now.value = Date.now() }, 60000)
})

onUnmounted(() => {
  if (countdownTimer) window.clearInterval(countdownTimer)
})

// --- Message Actions ---
</script>

<template>
  <div 
    :id="'msg-' + msg.id"
    class="glass-card p-5 sm:p-8 group/card overflow-hidden relative transition-all duration-700" 
    :class="[
      'theme-' + (msg.theme || 'default'),
      isConfession ? 'confession-card' : '',
      isResonant ? 'shadow-[0_0_50px_rgba(139,92,246,0.2)] border-purple-500/30 scale-[1.01]' : '',
      msg.isOwner && appStore.camoEnabled ? 'camo-effect' : ''
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
            <span v-if="isConfession" class="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center gap-0.5">
              <span class="text-xs">🕯️</span>告解
            </span>
            <span v-if="toneInfo" class="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400 flex items-center gap-0.5">
              <span class="text-xs">{{ toneInfo.emoji }}</span>{{ toneInfo.label }}
            </span>
          </div>
          <span class="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{{ formatTime(msg.createTime) }}</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <div v-if="isConfession" class="hidden sm:flex flex-col items-end gap-1 mr-2">
          <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-700">{{ remainingLabel }}</span>
          <span class="text-[10px] text-slate-500">{{ witnessCount }} candles lit</span>
        </div>
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
      <div class="text-lg leading-relaxed text-slate-200/90 whitespace-pre-wrap break-words font-light" :class="toneInfo?.class">
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
          <el-slider 
            v-model="currentTime" 
            :max="duration || 1" 
            :show-tooltip="false" 
            @input="seek"
            @click.stop
            size="small"
            class="cyber-slider-mini"
          />
        </div>
      </div>
      <div v-if="msg.imageUrl" class="relative group/img">
        <img :src="msg.imageUrl" class="w-full rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-zoom-in shadow-lg" @click="openImage(msg.imageUrl)" />
      </div>
    </div>

    <div v-if="isConfession" class="confessor-panel">
      <div class="confessor-label">CYBER CONFESSOR</div>
      <p>{{ msg.confessorReply || '神父仍在烛光后聆听。' }}</p>
    </div>

    <div v-if="isConfession" class="confession-candle" :title="remainingLabel">
      <div class="candle-flame"></div>
      <div class="candle-body">
        <div class="candle-burn" :style="{ height: candleBurnPercent + '%' }"></div>
      </div>
      <span>{{ remainingLabel }}</span>
    </div>

    <!-- Unified Footer: Reactions + Comment Toggle -->
    <div v-if="!isConfession" class="action-bar">
      <!-- Left: Reaction Pills -->
      <div class="action-bar-left">
        <div 
          v-for="(count, emoji) in parsedReactions" 
          :key="emoji"
          class="reaction-pill"
          :class="{ 'is-own': hasReacted(emoji) }"
          @click.stop="toggleReaction(emoji)"
        >
          <span class="reaction-emoji">{{ emoji }}</span>
          <span class="reaction-count">{{ count }}</span>
        </div>

        <!-- Add Reaction -->
        <el-popover placement="top" :width="240" trigger="click" popper-class="reaction-popover">
          <template #reference>
            <button class="add-reaction-trigger">
              <Smile :size="14" />
            </button>
          </template>
          <div class="reaction-picker-grid">
            <button 
              v-for="e in reactionEmojis" 
              :key="e"
              class="reaction-picker-cell"
              :class="{ 'is-selected': hasReacted(e) }"
              @click="toggleReaction(e)"
            >
              {{ e }}
            </button>
          </div>
        </el-popover>
      </div>

      <!-- Right: Comment Toggle -->
      <button 
        class="comment-toggle-btn"
        @click="$emit('toggle-comments', msg)"
      >
        <div class="relative">
          <MessageSquare :size="16" />
          <span v-if="msg.commentCount > 0 && !msg._read" class="unread-dot"></span>
        </div>
        <span class="comment-toggle-label">{{ msg._showComments ? 'CLOSE' : 'REPLY' }}</span>
        <span v-if="msg.commentCount > 0" class="comment-toggle-count">{{ msg.commentCount }}</span>
      </button>
    </div>

    <div v-else class="action-bar confession-action-bar">
      <button
        class="witness-btn"
        :class="{ 'is-witnessed': msg.witnessedByMe }"
        @click.stop="witnessConfession"
      >
        <span class="text-base">🕯️</span>
        <span>{{ msg.witnessedByMe ? '已见证' : '见证' }}</span>
        <span class="witness-count">{{ witnessCount }}</span>
      </button>
    </div>

    <!-- Comments Section (Visually Separated) -->
    <div v-if="!isConfession && msg._showComments" class="comment-section">
      <!-- Comment Section Header with Sort -->
      <div class="comment-section-header">
        <span class="comment-section-title">
          {{ sortedCommentTree.length }} {{ sortedCommentTree.length === 1 ? 'Comment' : 'Comments' }}
        </span>
        <div class="comment-sort-group">
          <button 
            v-for="s in [{key:'oldest',label:'最早'},{key:'newest',label:'最新'},{key:'hottest',label:'最热'}]" 
            :key="s.key"
            class="comment-sort-btn"
            :class="{ 'is-active': commentSort === s.key }"
            @click="commentSort = s.key"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="sortedCommentTree.length === 0" class="comment-empty">
        <p>Silence is a message too...</p>
      </div>
      
      <!-- Comment Tree -->
      <div class="comment-tree">
        <CommentItem 
          v-for="cmt in sortedCommentTree" 
          :key="cmt.id" 
          :comment="cmt"
          :isAdmin="isAdmin"
          :depth="0"
          :maxDepth="4"
          :defaultExpanded="true"
          @reply="(c) => { msg._replyToId = c.id; msg._commentText = `@${c.authorAlias} ` }"
          @delete="(c) => $emit('delete-comment', {msg, comment: c})"
        />
      </div>

      <!-- Reply Quote Bar (Telegram-style) -->
      <div v-if="replyTarget" class="reply-quote-bar">
        <div class="reply-quote-line"></div>
        <div class="reply-quote-content">
          <span class="reply-quote-name">{{ replyTarget.authorAlias || 'ANON' }}</span>
          <span class="reply-quote-text">{{ replyTarget.content?.substring(0, 60) }}{{ replyTarget.content?.length > 60 ? '...' : '' }}</span>
        </div>
        <button class="reply-quote-close" @click.stop="clearReply">
          <X :size="14" />
        </button>
      </div>

      <!-- Comment Input -->
      <div class="comment-input-row">
        <div class="comment-input-wrap">
          <textarea 
            v-model="msg._commentText" 
            class="comment-input" 
            :placeholder="replyTarget ? `回复 ${replyTarget.authorAlias}...` : '写下你的回响...'" 
            rows="1"
            @keyup.enter.ctrl="() => $emit('publish-comment', msg)"
            @keyup.enter.meta="() => $emit('publish-comment', msg)"
          ></textarea>
        </div>
        <button 
          class="comment-send-btn"
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

<style scoped>
.confession-card {
  border-color: rgba(201, 149, 42, 0.4) !important;
  background:
    radial-gradient(circle at 82% 18%, rgba(245, 158, 11, 0.16), transparent 34%),
    linear-gradient(135deg, rgba(255, 251, 235, 0.88), rgba(255, 255, 255, 0.72)) !important;
  box-shadow:
    0 24px 60px -24px rgba(180, 83, 9, 0.35),
    inset 0 1px 0 rgba(255, 236, 179, 0.65) !important;
}

.confessor-panel {
  margin-top: 22px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(201, 149, 42, 0.24);
  background: rgba(255, 248, 222, 0.62);
  color: #78350f;
}

.confessor-label {
  margin-bottom: 8px;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.18em;
  color: #b45309;
}

.confessor-panel p {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
}

.confession-candle {
  position: absolute;
  right: 24px;
  bottom: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #b45309;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  pointer-events: none;
}

.candle-flame {
  width: 10px;
  height: 14px;
  border-radius: 50% 50% 45% 45%;
  background: radial-gradient(circle at 50% 70%, #fff7ad 0 22%, #f59e0b 45%, #ef4444 100%);
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.7));
  animation: candle-flicker 1.6s ease-in-out infinite alternate;
}

.candle-body {
  position: relative;
  width: 12px;
  height: 42px;
  overflow: hidden;
  border-radius: 5px 5px 3px 3px;
  background: linear-gradient(#fff7ed, #fde68a);
  border: 1px solid rgba(180, 83, 9, 0.2);
}

.candle-burn {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(120, 53, 15, 0.12);
}

@keyframes candle-flicker {
  from { transform: scale(0.92) rotate(-2deg); opacity: 0.85; }
  to { transform: scale(1.08) rotate(2deg); opacity: 1; }
}

.confession-action-bar {
  justify-content: flex-end;
}

.witness-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(201, 149, 42, 0.28);
  background: rgba(255, 248, 222, 0.7);
  color: #92400e;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.12em;
  transition: all 0.2s;
}

.witness-btn:not(.is-witnessed):hover {
  transform: translateY(-1px);
  background: rgba(254, 243, 199, 0.95);
  box-shadow: 0 12px 28px -16px rgba(180, 83, 9, 0.6);
}

.witness-btn.is-witnessed {
  cursor: default;
  opacity: 0.72;
}

.witness-count {
  font-family: 'JetBrains Mono', monospace;
  color: #b45309;
}

@media (max-width: 640px) {
  .confession-candle {
    right: 18px;
    bottom: 78px;
  }
}

/* Camo Effect */
.camo-effect {
  position: relative;
  opacity: 0.85;
  filter: saturate(0.5) contrast(1.3) brightness(1.1);
  animation: thermoptic-camo 8s infinite;
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

/* ── Unified Action Bar ── */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  gap: 8px;
}

.action-bar-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

/* ── Reaction Pill (Message Level) ── */
.reaction-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.02);
}

.reaction-pill:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.reaction-pill:active {
  transform: scale(0.93);
}

.reaction-pill.is-own {
  border-color: var(--cmt-accent, #3b82f6);
  background: rgba(59, 130, 246, 0.08);
}

.reaction-emoji {
  font-size: 14px;
  line-height: 1;
}

.reaction-count {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
}

/* ── Add Reaction Trigger ── */
.add-reaction-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  border-radius: 999px;
  border: 1px dashed rgba(0, 0, 0, 0.1);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.4;
}

.action-bar:hover .add-reaction-trigger {
  opacity: 0.8;
}

.add-reaction-trigger:hover {
  opacity: 1 !important;
  border-style: solid;
  border-color: var(--cmt-accent, #3b82f6);
  color: var(--cmt-accent, #3b82f6);
  background: rgba(59, 130, 246, 0.05);
}

/* ── Reaction Picker (Popover Content) ── */
.reaction-picker-grid {
  display: flex;
  gap: 4px;
  padding: 6px;
}

.reaction-picker-cell {
  flex: 1;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.reaction-picker-cell:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: scale(1.3);
}

.reaction-picker-cell:active {
  transform: scale(1.5);
}

.reaction-picker-cell.is-selected {
  background: rgba(59, 130, 246, 0.15);
  border-radius: 12px;
  box-shadow: inset 0 0 0 2px rgba(59, 130, 246, 0.3);
}

/* ── Comment Toggle Button ── */
.comment-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: rgba(0, 0, 0, 0.03);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.comment-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--color-text-primary);
}

.comment-toggle-btn:active {
  transform: scale(0.95);
}

.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 7px;
  height: 7px;
  background: #3b82f6;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
}

.comment-toggle-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.comment-toggle-count {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  opacity: 0.5;
}

/* ── Comment Section (Visually Separated) ── */
.comment-section {
  margin-top: 16px;
  margin-left: 12px;
  margin-right: 12px;
  padding: 20px 24px;
  background: #f8fafc;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 1.25rem;
  animation: comment-slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes comment-slide-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.comment-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.comment-section-title {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-secondary);
}

.comment-sort-group {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 8px;
}

.comment-sort-btn {
  padding: 3px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.comment-sort-btn:hover {
  background: rgba(0, 0, 0, 0.04);
}

.comment-sort-btn.is-active {
  background: white;
  color: var(--color-text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.comment-empty {
  padding: 32px 0;
  text-align: center;
}

.comment-empty p {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-style: italic;
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.comment-tree {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ── Reply Quote Bar (Telegram-style) ── */
.reply-quote-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin-top: 12px;
  background: rgba(59, 130, 246, 0.06);
  border-radius: 10px;
  animation: quote-slide 0.25s ease;
}

@keyframes quote-slide {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.reply-quote-line {
  width: 3px;
  height: 28px;
  border-radius: 2px;
  background: #3b82f6;
  flex-shrink: 0;
}

.reply-quote-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.reply-quote-name {
  font-size: 10px;
  font-weight: 800;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.reply-quote-text {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reply-quote-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.reply-quote-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* ── Comment Input ── */
.comment-input-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.comment-input-wrap {
  flex: 1;
  position: relative;
}

.comment-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 10px 16px;
  font-size: 13px;
  resize: none;
  outline: none;
  color: var(--color-text-primary);
  transition: all 0.2s;
}

.comment-input:focus {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(0, 0, 0, 0.01);
}

.comment-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.5;
}

.comment-send-btn {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  border: none;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.comment-send-btn:hover:not(:disabled) {
  background: #2563eb;
}

.comment-send-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.comment-send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── Tone Effects ── */

/* 🤫 悄悄话：文字缩小、半透明，悬停显现 */
.tone-whisper {
  font-size: 0.85rem !important;
  opacity: 0.45;
  filter: blur(0.5px);
  transition: all 0.4s ease;
  cursor: default;
}
.tone-whisper:hover {
  opacity: 1;
  filter: blur(0);
}

/* 📢 大声说：文字加粗加大 */
.tone-shout {
  font-size: 1.35rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.03em;
}

/* 💤 梦话：模糊飘忽，悬停聚焦 */
.tone-dream {
  filter: blur(1.5px);
  opacity: 0.7;
  font-style: italic;
  transition: all 0.6s ease;
}
.tone-dream:hover {
  filter: blur(0);
  opacity: 1;
}

/* 👾 电波：赛博毛刺感 */
.tone-glitch {
  font-family: 'Courier New', monospace;
  text-shadow: 
    1px 0 rgba(255, 0, 80, 0.4),
    -1px 0 rgba(0, 255, 200, 0.4);
  animation: glitch-text 4s infinite;
}
@keyframes glitch-text {
  0%, 95%, 100% { text-shadow: 1px 0 rgba(255, 0, 80, 0.4), -1px 0 rgba(0, 255, 200, 0.4); }
  96% { text-shadow: -2px 0 rgba(255, 0, 80, 0.7), 2px 0 rgba(0, 255, 200, 0.7); transform: translateX(1px); }
  97% { text-shadow: 2px 0 rgba(255, 0, 80, 0.7), -2px 0 rgba(0, 255, 200, 0.7); transform: translateX(-1px); }
  98% { text-shadow: 0 0 rgba(255, 0, 80, 0.4), 0 0 rgba(0, 255, 200, 0.4); transform: translateX(0); }
}

/* 🌙 诗意：优雅衬线体 + 柔光 */
.tone-poetic {
  font-family: 'Georgia', 'Noto Serif SC', serif;
  font-style: italic;
  letter-spacing: 0.08em;
  line-height: 2.2 !important;
  text-shadow: 0 0 20px rgba(147, 130, 220, 0.15);
}
</style>
