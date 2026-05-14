<script setup>
import { ref, computed } from 'vue'
import { 
  Send, X, Loader2
} from 'lucide-vue-next'
import CommentItem from './CommentItem.vue'
import ConfessionPanel from './ConfessionPanel.vue'
import MessageActionBar from './message/MessageActionBar.vue'
import MessageBody from './message/MessageBody.vue'
import MessageHeader from './message/MessageHeader.vue'
import { useAppStore } from '@/stores/app'
import { TONE_MODES } from '@/constants/toneModes'

const appStore = useAppStore()

const props = defineProps({
  msg: Object,
  liked: Boolean,
  isAdmin: Boolean
})

const emit = defineEmits(['like', 'toggle-comments', 'delete', 'delete-comment', 'publish-comment', 'tag-click', 'admin-ban', 'react', 'witness'])

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
const toneMap = TONE_MODES
const toneInfo = computed(() => props.msg.mood && toneMap[props.msg.mood] ? toneMap[props.msg.mood] : null)
const isConfession = computed(() => props.msg.messageType === 'confession')
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
    
    <MessageHeader
      :msg="msg"
      :is-admin="isAdmin"
      :is-confession="isConfession"
      :is-resonant="isResonant"
      :tone-info="toneInfo"
      @delete="$emit('delete', $event)"
      @admin-ban="$emit('admin-ban', $event)"
    />

    <MessageBody :msg="msg" :tone-info="toneInfo" @tag-click="$emit('tag-click', $event)" />

    <ConfessionPanel v-if="isConfession" :msg="msg" @witness="$emit('witness')" />

    <MessageActionBar
      v-if="!isConfession"
      :msg="msg"
      @toggle-comments="$emit('toggle-comments', $event)"
      @react="$emit('react')"
    />

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
          @react="$emit('react')"
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

</style>
