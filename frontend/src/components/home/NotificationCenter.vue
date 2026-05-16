<script setup>
import { Bell, Check, CheckCheck, Loader2, X } from 'lucide-vue-next'
import { formatRelativeTime } from '@/utils/time'

defineProps({
  state: { type: Object, required: true }
})

defineEmits(['close', 'notification-click', 'mark-read', 'mark-all', 'load-more'])
</script>

<template>
  <Transition name="fade">
    <div v-if="state.visible" class="notification-backdrop" @click.self="$emit('close')">
      <aside class="notification-panel">
        <header class="notification-header">
          <div>
            <p class="notification-kicker">NOTIFICATIONS</p>
            <h2>通知中心</h2>
          </div>
          <div class="notification-header-actions">
            <button
              class="notification-icon-btn"
              :disabled="state.unreadCount <= 0"
              title="全部标记已读"
              @click="$emit('mark-all')"
            >
              <CheckCheck :size="18" />
            </button>
            <button class="notification-icon-btn" title="关闭" @click="$emit('close')">
              <X :size="18" />
            </button>
          </div>
        </header>

        <div v-if="state.error" class="notification-error">{{ state.error }}</div>

        <div v-if="state.loading" class="notification-loading">
          <Loader2 :size="22" class="animate-spin" />
          <span>正在同步回响...</span>
        </div>

        <div v-else-if="state.notifications.length === 0" class="notification-empty">
          <Bell :size="32" />
          <p>还没有新的回响</p>
          <span>有人回应你的树洞时，会出现在这里。</span>
        </div>

        <div v-else class="notification-list">
          <button
            v-for="item in state.notifications"
            :key="item.id"
            class="notification-item"
            :class="{ 'is-unread': !item.read }"
            @click="$emit('notification-click', item)"
          >
            <span class="notification-dot" aria-hidden="true"></span>
            <span class="notification-content">
              <span class="notification-title">{{ item.title }}</span>
              <span v-if="item.summary" class="notification-summary">{{ item.summary }}</span>
              <span class="notification-time">{{ formatRelativeTime(item.createTime) }}</span>
            </span>
            <button
              v-if="!item.read"
              class="notification-read-btn"
              title="标记已读"
              @click.stop="$emit('mark-read', item.id)"
            >
              <Check :size="15" />
            </button>
          </button>
        </div>

        <footer v-if="!state.loading && state.notifications.length > 0" class="notification-footer">
          <button
            class="notification-more-btn"
            :disabled="!state.hasMore || state.loadingMore"
            @click="$emit('load-more')"
          >
            <Loader2 v-if="state.loadingMore" :size="16" class="animate-spin" />
            <span>{{ state.hasMore ? '加载更多' : '没有更多了' }}</span>
          </button>
        </footer>
      </aside>
    </div>
  </Transition>
</template>
