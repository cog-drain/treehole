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
        <CommentBody :comment="comment" />

        <CommentActions
          :comment="comment"
          :is-admin="isAdmin"
          @reply="$emit('reply', $event)"
          @delete="$emit('delete', $event)"
          @react="$emit('react')"
        />

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
import CommentActions from './comment/CommentActions.vue'
import CommentBody from './comment/CommentBody.vue'

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

  .action-btn {
    opacity: 0.6;
  }
}
</style>
