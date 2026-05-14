<template>
  <div class="comment-node" :class="{ 'is-collapsed': isCollapsed }">
    <!-- Collapsed State: single-line summary -->
    <div v-if="isCollapsed" class="collapsed-bar" @click="isCollapsed = false">
      <div class="thread-line-collapsed"></div>
      <div class="collapsed-content">
        <span class="collapsed-toggle">+</span>
        <img :src="generateDiceBearAvatar(comment.authorAlias || '匿名')" class="collapsed-avatar" alt="" />
        <span class="collapsed-name" :class="{ 'is-author': comment.authorAlias === '洞主' }">
          {{ comment.authorAlias === '洞主' ? 'AUTHOR' : (comment.authorAlias || 'ANON') }}
        </span>
        <span class="collapsed-meta">·</span>
        <span class="collapsed-meta">{{ formatRelativeTime(comment.createTime) }}</span>
        <span v-if="comment.children?.length" class="collapsed-count">
          {{ comment.children.length }} {{ comment.children.length === 1 ? 'reply' : 'replies' }}
        </span>
      </div>
    </div>

    <!-- Expanded State: full comment -->
    <div v-else class="comment-expanded">
      <!-- Left: Thread Line (clickable to collapse) -->
      <div class="thread-col" @click="isCollapsed = true">
        <div class="thread-line" :style="threadLineStyle"></div>
      </div>

      <!-- Right: Content area -->
      <div class="comment-body">
        <!-- Header -->
        <div class="comment-header">
          <img :src="generateDiceBearAvatar(comment.authorAlias || '匿名')" class="comment-avatar" alt="" />
          <span 
            class="comment-author"
            :class="{ 'is-author': comment.authorAlias === '洞主' }"
          >
            {{ comment.authorAlias === '洞主' ? 'AUTHOR' : (comment.authorAlias || 'ANON') }}
          </span>
          
          <div v-if="comment.coFrequency" class="resonance-badge">
            <Zap :size="10" fill="#f97316" stroke="#f97316" />
            <span>RESONANCE</span>
          </div>

          <span class="comment-time">{{ formatRelativeTime(comment.createTime) }}</span>
        </div>

        <!-- Text Content -->
        <p class="comment-text">{{ comment.content }}</p>

        <!-- Image -->
        <div v-if="comment.imageUrl" class="comment-image-wrap">
          <img :src="comment.imageUrl" class="comment-image" @click.stop="openImage(comment.imageUrl)" />
        </div>

        <!-- Reaction Pills + Actions (merged into one line) -->
        <div class="comment-actions-bar">
          <!-- Existing reaction pills -->
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

          <!-- Add reaction button with popover -->
          <el-popover
            placement="top"
            :width="200"
            trigger="click"
            popper-class="cyber-popover"
          >
            <template #reference>
              <button class="add-reaction-btn" title="添加表情">
                <Smile :size="14" />
              </button>
            </template>
            <div class="reaction-picker">
              <button 
                v-for="e in reactionEmojis" 
                :key="e"
                class="reaction-picker-item"
                @click="toggleReaction(e)"
              >
                {{ e }}
              </button>
            </div>
          </el-popover>

          <span class="actions-divider"></span>

          <!-- Reply -->
          <button class="action-btn" @click.stop="$emit('reply', comment)">
            <MessageSquare :size="12" />
            <span>Reply</span>
          </button>

          <!-- Delete -->
          <button 
            v-if="comment.isOwner || isAdmin"
            class="action-btn action-btn--danger"
            @click.stop="$emit('delete', comment)"
          >
            <Trash2 :size="12" />
            <span>Remove</span>
          </button>
        </div>

        <!-- Nested Children (Reddit-style) -->
        <div v-if="comment.children?.length > 0 && depth < maxDepth" class="children-area">
          <CommentItem
            v-for="child in visibleChildren"
            :key="child.id"
            :comment="child"
            :isAdmin="isAdmin"
            :depth="depth + 1"
            :maxDepth="maxDepth"
            :defaultExpanded="depth + 1 < autoExpandDepth"
            @reply="$emit('reply', $event)"
            @delete="$emit('delete', $event)"
            @react="$emit('react')"
          />
        </div>

        <!-- Depth limit: "Continue this thread" -->
        <div v-if="comment.children?.length > 0 && depth >= maxDepth" class="continue-thread">
          <button class="continue-thread-btn" @click="expandDeep = !expandDeep">
            {{ expandDeep ? '收起深层回复 ↑' : `继续查看 ${comment.children.length} 条回复 →` }}
          </button>
          <div v-if="expandDeep" class="children-area">
            <CommentItem
              v-for="child in comment.children"
              :key="child.id"
              :comment="child"
              :isAdmin="isAdmin"
              :depth="0"
              :maxDepth="maxDepth"
              :defaultExpanded="false"
              @reply="$emit('reply', $event)"
              @delete="$emit('delete', $event)"
              @react="$emit('react')"
            />
          </div>
        </div>
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
  isAdmin: { type: Boolean, default: false },
  depth: { type: Number, default: 0 },
  maxDepth: { type: Number, default: 4 },
  defaultExpanded: { type: Boolean, default: true }
})

const emit = defineEmits(['reply', 'delete', 'react'])

const isCollapsed = ref(!props.defaultExpanded)
const expandDeep = ref(false)
const reactionEmojis = ['❤️', '😂', '👍', '🔥', '😭']

// Depth-based thread line color
const threadLineColors = [
  'var(--thread-color-0, #3b82f6)',
  'var(--thread-color-1, #8b5cf6)',
  'var(--thread-color-2, #06b6d4)',
  'var(--thread-color-3, #f59e0b)',
  'var(--thread-color-4, #ef4444)'
]

const threadLineStyle = computed(() => ({
  '--line-color': threadLineColors[props.depth % threadLineColors.length]
}))

// Auto-expand depth: only first 2 levels expanded by default
const autoExpandDepth = 2

// All children visible (no pagination for now)
const visibleChildren = computed(() => props.comment.children || [])

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

// Track which emoji this user has reacted with (localStorage per comment)
const reactedKey = computed(() => `treehole_cmt_reacted_${props.comment.id}`)

const getReactedEmoji = () => localStorage.getItem(reactedKey.value)

const hasReacted = (emoji) => {
  return getReactedEmoji() === emoji
}

const toggleReaction = async (emoji) => {
  const currentEmoji = getReactedEmoji()
  
  try {
    await api.reactToComment(props.comment.id, emoji)
    
    if (currentEmoji === emoji) {
      // Remove from local tracking
      localStorage.removeItem(reactedKey.value)
    } else {
      // Add or change local tracking
      localStorage.setItem(reactedKey.value, emoji)
    }
    emit('react')
  } catch (e) {
    console.error('Comment reaction error:', e)
  }
}
</script>

<style scoped>
/* ── Comment Node Container ── */
.comment-node {
  position: relative;
}

/* ── Collapsed Bar ── */
.collapsed-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.collapsed-bar:hover {
  background: var(--cmt-hover-bg, rgba(0, 0, 0, 0.03));
}

.thread-line-collapsed {
  width: 2px;
  height: 100%;
  min-height: 20px;
  background: var(--cmt-collapsed-line, #cbd5e1);
  border-radius: 1px;
  flex-shrink: 0;
  margin-left: 14px;
}

.collapsed-content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.collapsed-toggle {
  font-size: 11px;
  font-weight: 900;
  color: var(--cmt-accent, #3b82f6);
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}

.collapsed-avatar {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  flex-shrink: 0;
}

.collapsed-name {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
  letter-spacing: 0.03em;
}

.collapsed-name.is-author {
  color: var(--cmt-accent, #3b82f6);
}

.collapsed-meta {
  font-size: 10px;
  color: var(--color-text-secondary);
  opacity: 0.6;
  font-family: 'JetBrains Mono', monospace;
}

.collapsed-count {
  font-size: 10px;
  font-weight: 700;
  color: var(--cmt-accent, #3b82f6);
  letter-spacing: 0.05em;
}

/* ── Expanded Layout (two-column) ── */
.comment-expanded {
  display: flex;
  gap: 0;
}

/* ── Thread Column (clickable line) ── */
.thread-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30px;
  flex-shrink: 0;
  cursor: pointer;
  padding-top: 32px; /* below avatar */
}

.thread-line {
  width: 2px;
  flex: 1;
  min-height: 12px;
  background: var(--line-color, #3b82f6);
  opacity: 0.2;
  border-radius: 1px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.thread-col:hover .thread-line {
  width: 3px;
  opacity: 0.6;
}

.thread-col:active .thread-line {
  width: 4px;
  opacity: 0.8;
  transform: scaleX(1.5);
}

/* ── Comment Body ── */
.comment-body {
  flex: 1;
  min-width: 0;
  padding-bottom: 4px;
}

/* ── Header ── */
.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.comment-avatar {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

.comment-author {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.comment-author.is-author {
  color: var(--cmt-accent, #3b82f6);
}

.resonance-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid rgba(251, 191, 36, 0.3);
  background: rgba(255, 247, 237, 0.8);
  backdrop-filter: blur(8px);
}

.resonance-badge span {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.1em;
  color: #7c2d12;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.2);
}

.comment-time {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-text-secondary);
  opacity: 0.6;
}

/* ── Text ── */
.comment-text {
  font-size: 14px;
  line-height: 1.65;
  color: var(--color-text-primary);
  font-weight: 400;
  margin: 0 0 8px;
  word-break: break-word;
}

/* ── Image ── */
.comment-image-wrap {
  margin-bottom: 8px;
}

.comment-image {
  max-width: 200px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  cursor: zoom-in;
  transition: border-color 0.2s;
}

.comment-image:hover {
  border-color: var(--cmt-accent, #3b82f6);
}

/* ── Actions Bar (reactions + buttons on one line) ── */
.comment-actions-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
  margin-bottom: 8px;
}

/* ── Reaction Pill ── */
.reaction-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  border: 1px solid var(--color-border);
  background: var(--cmt-pill-bg, rgba(0, 0, 0, 0.03));
}

.reaction-pill:hover {
  background: var(--cmt-pill-hover, rgba(0, 0, 0, 0.06));
  transform: scale(1.05);
}

.reaction-pill.is-own {
  border-color: var(--cmt-accent, #3b82f6);
  background: rgba(59, 130, 246, 0.08);
}

.reaction-pill:active {
  transform: scale(0.92);
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

/* ── Add Reaction Button ── */
.add-reaction-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 24px;
  border-radius: 999px;
  border: 1px dashed var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.5;
}

.comment-actions-bar:hover .add-reaction-btn {
  opacity: 1;
}

.add-reaction-btn:hover {
  border-style: solid;
  border-color: var(--cmt-accent, #3b82f6);
  color: var(--cmt-accent, #3b82f6);
  background: rgba(59, 130, 246, 0.05);
  opacity: 1;
}

/* ── Reaction Picker (popover content) ── */
.reaction-picker {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  padding: 4px;
}

.reaction-picker-item {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.15s;
}

.reaction-picker-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.25);
}

.reaction-picker-item:active {
  transform: scale(1.5);
}

/* ── Actions Divider ── */
.actions-divider {
  width: 1px;
  height: 14px;
  background: var(--color-border);
  margin: 0 2px;
}

/* ── Action Buttons ── */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 6px;
  border: none;
  background: transparent;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0;
}

.comment-body:hover .action-btn {
  opacity: 0.7;
}

.action-btn:hover {
  opacity: 1 !important;
  color: var(--cmt-accent, #3b82f6);
  background: rgba(59, 130, 246, 0.06);
}

.action-btn--danger:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}

.action-btn:active {
  transform: scale(0.92);
}

/* ── Children Area ── */
.children-area {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
}

/* ── Continue Thread ── */
.continue-thread {
  margin-top: 4px;
}

.continue-thread-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  border: none;
  background: rgba(59, 130, 246, 0.06);
  color: var(--cmt-accent, #3b82f6);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.continue-thread-btn:hover {
  background: rgba(59, 130, 246, 0.12);
}

/* ── Mobile Responsiveness ── */
@media (max-width: 640px) {
  .thread-col {
    width: 20px;
  }

  .comment-avatar {
    width: 20px;
    height: 20px;
  }

  .comment-text {
    font-size: 13px;
  }

  .action-btn {
    opacity: 0.6;
  }
}
</style>
