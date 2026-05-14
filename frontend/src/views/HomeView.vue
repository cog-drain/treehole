<template>
  <div 
    class="min-h-screen transition-all duration-1000"
    :class="{ 'zen-active': isZenMode, 'offline-mode': !isOnline }"
    @touchstart.capture="handleEdgeSwipeStart"
    @touchmove.capture="handleEdgeSwipeMove"
    @touchend.capture="handleEdgeSwipeEnd"
    @touchcancel.capture="resetEdgeSwipe"
  >
    <CyberWatermark />
    <div class="relative max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-24 space-y-8 sm:space-y-12">
      <!-- ... Offline Banner ... -->

      <ComposeBox
        :form="form"
        :themes-list="themesList"
        :tone-map="toneMap"
        :is-confession-mode="isConfessionMode"
        :is-midnight="isMidnight"
        :is-zen-mode="isZenMode"
        :admin-login-visible="adminLoginVisible"
        :is-mobile="isMobile"
        :is-online="isOnline"
        :publishing="publishing"
        :offline-queue-count="offlineQueueCount"
        :image-preview="imagePreview"
        :show-tone-panel="showTonePanel"
        :tone-selector-ref="toneSelectorRef"
        :show-voice-panel="showVoicePanel"
        :is-recording="isRecording"
        :recording-time="recordingTime"
        :recorded-blob="recordedBlob"
        :raw-audio-url="rawAudioUrl"
        :masked-audio-url="maskedAudioUrl"
        :is-playing-preview="isPlayingPreview"
        :preview-current-time="previewCurrentTime"
        :preview-duration="previewDuration"
        :audio-preview-ref="audioPreviewRef"
        :voice-effect="voiceEffect"
        :voice-effects="voiceEffects"
        :format-duration="formatDuration"
        @refresh-identity="refreshIdentity"
        @image-select="onImageSelect"
        @paste="handlePaste"
        @publish="publishMessage"
        @publish-button-click="handlePublishButtonClick"
        @toggle-voice-panel="toggleVoicePanel"
        @toggle-tone-panel="showTonePanel = $event"
        @set-tone="form.mood = $event"
        @set-theme="form.theme = $event"
        @toggle-confession="isConfessionMode = !isConfessionMode"
        @open-offline-box="openOfflineBox"
        @clear-image="clearImage"
        @toggle-recording="toggleRecording"
        @set-voice-effect="voiceEffect = $event"
        @reapply-voice-mask="reapplyVoiceMask"
        @clear-audio="clearAudio"
        @toggle-preview-playback="togglePreviewPlayback"
        @preview-time-update="onPreviewTimeUpdate"
        @preview-ended="onPreviewEnded"
        @seek-preview="seekPreview"
      />

      <TrendingTags :tags="trendingTags" :active-tag="activeTag" @tag-click="handleTagClick" />

      <FeedHeader :view-mode="viewMode" :online-count="onlineCount" @set-view-mode="setViewMode" />

      <ActiveTagBanner :active-tag="activeTag" @clear="clearTagFilter" />

      <HomeFeedList
        :view-mode="viewMode"
        :messages="messages"
        :liked-ids="likedIds"
        :is-admin="isAdmin"
        :page-num="pageNum"
        :total="total"
        :total-pages="totalPages"
        @like="likeMessage"
        @toggle-comments="toggleComments"
        @delete="deleteMessage"
        @delete-comment="handleDeleteComment"
        @publish-comment="publishComment"
        @react="trackActivity(ACTIVITY_EVENTS.react)"
        @witness="trackActivity(ACTIVITY_EVENTS.witnessConfession, ACTIVITY_MODULES.comments)"
        @tag-click="handleTagClick"
        @admin-ban="handleBanIP"
        @page-change="handlePageChange"
      />

      <!-- Graph View (Wrapper for Obsidian Graph) -->
      <div v-if="viewMode === 'graph'" class="h-[850px] relative">
        <MindGraph 
          v-if="viewMode === 'graph'" 
          :visible="viewMode === 'graph'"
          @node-click="showNodeDetail"
        />
      </div>
    </div>

    <!-- Professional Zen Overlay (Generative Garden) -->
    <Transition name="fade">
      <div v-if="isZenMode" class="fixed inset-0 z-[999] bg-slate-950 overflow-hidden">
        <ZenGarden :messages="messages" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50 pointer-events-none"></div>
      </div>
    </Transition>

    <HomeFabStack
      :show-zen-menu="showZenMenu"
      :is-zen-mode="isZenMode"
      :current-zen-sound="currentZenSound"
      :zen-volume="zenVolume"
      :zen-sounds="zenSounds"
      @toggle-zen-menu="showZenMenu = !showZenMenu"
      @close-zen-menu="showZenMenu = false"
      @select-zen-sound="selectZenSound"
      @update:zen-volume="zenVolume = $event"
      @update-zen-volume="updateZenVolume"
      @return-to-zen="returnToZen"
      @minimize-zen="minimizeZen"
      @stop-zen-mode="stopZenMode"
      @open-bottle="openBottleCenter"
      @open-identity="showIdentityModal = true"
    />

    <IdentityVaultModal
      :visible="showIdentityModal"
      :recovery-key="recoveryKey"
      :input-key="inputKey"
      @close="showIdentityModal = false"
      @open-store="openStore"
      @backup="handleBackup"
      @restore="handleRestore"
      @copy-key="copyKey"
      @update:input-key="inputKey = $event"
    />

    <!-- Premium Drifting Bottle System -->
    <DriftBottleDialog 
      v-model="bottleVisible"
      :picked-data="pickedBottle"
      :user-id="api.getUserIdentity().userId"
      @on-throw="handleThrowBottle"
      @on-pick="handlePickBottle"
      @on-reply="handleReplyBottle"
      @on-return="handleReturnBottle"
    />

    <AdminLoginModal
      :visible="adminLoginVisible"
      :password="adminPassword"
      @update:password="adminPassword = $event"
      @login="handleAdminLogin"
      @close="adminLoginVisible = false"
    />

    <AdminDock
      :visible="isAdmin"
      @open-blacklist="showBlacklistModal = true"
      @open-password="showPasswordModal = true"
      @exit="exitAdmin"
    />

    <BlacklistDialog
      v-model:visible="showBlacklistModal"
      :blacklist="blacklist"
      @unban="handleUnban"
    />

    <PasswordDialog
      v-model:visible="showPasswordModal"
      :form="pwdForm"
      @submit="handleChangePassword"
    />
    <OfflineQueueDialog
      v-model:visible="offlineDialogVisible"
      :is-online="isOnline"
      :offline-list="offlineList"
      :offline-queue-count="offlineQueueCount"
      @sync="syncOfflineQueue"
      @edit="editOfflineItem"
      @remove="removeOfflineItem"
    />
  </div>
</template>

<script setup>
import { defineAsyncComponent, ref, onMounted, onUnmounted, watch } from 'vue'
import api from '@/api'
import AdminDock from '@/components/home/admin/AdminDock.vue'
import AdminLoginModal from '@/components/home/admin/AdminLoginModal.vue'
import ActiveTagBanner from '@/components/home/ActiveTagBanner.vue'
import BlacklistDialog from '@/components/home/admin/BlacklistDialog.vue'
import ComposeBox from '@/components/home/ComposeBox.vue'
import FeedHeader from '@/components/home/FeedHeader.vue'
import HomeFabStack from '@/components/home/HomeFabStack.vue'
import HomeFeedList from '@/components/home/feed/HomeFeedList.vue'
import IdentityVaultModal from '@/components/home/IdentityVaultModal.vue'
import OfflineQueueDialog from '@/components/home/OfflineQueueDialog.vue'
import PasswordDialog from '@/components/home/admin/PasswordDialog.vue'
import TrendingTags from '@/components/home/TrendingTags.vue'
import CyberWatermark from '@/components/common/CyberWatermark.vue'
import { offlineQueue, offlineQueueCount } from '@/utils/offlineQueue'

const MindGraph = defineAsyncComponent(() => import('@/components/business/MindGraph.vue'))
const ZenGarden = defineAsyncComponent(() => import('@/components/zen/ZenGarden.vue'))
const DriftBottleDialog = defineAsyncComponent(() => import('@/components/business/DriftBottleDialog.vue'))

// ── Stores & Composables ──
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { useZenMode } from '@/composables/useZenMode'
import { useRecorder } from '@/composables/useRecorder'
import { useAdminPanel } from '@/composables/useAdminPanel'
import { useComposeForm } from '@/composables/useComposeForm'
import { useDriftBottle } from '@/composables/useDriftBottle'
import { useFeedMessages } from '@/composables/useFeedMessages'
import { useHomeRealtime } from '@/composables/useHomeRealtime'
import { useIdentityVault } from '@/composables/useIdentityVault'
import { useMobileEdgeSwipe } from '@/composables/useMobileEdgeSwipe'
import { useNetworkStatus } from '@/composables/useNetworkStatus'
import { useOfflineQueueDialog } from '@/composables/useOfflineQueueDialog'
import { useParticleTheme } from '@/composables/useParticleTheme'
import { useViewport } from '@/composables/useViewport'
import { ACTIVITY_EVENTS, ACTIVITY_MODULES } from '@/constants/activityEvents'
import { TONE_MODES } from '@/constants/toneModes'
import { CARD_THEMES } from '@/constants/themes'

const userStore = useUserStore()
const appStore = useAppStore()
const zen = useZenMode()
const recorder = useRecorder()
const compose = useComposeForm()
const adminPanel = useAdminPanel()
const identityVault = useIdentityVault()
const networkStatus = useNetworkStatus()
const viewport = useViewport()

const props = defineProps({
  storeVisible: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['publish-success', 'open-store', 'resonance-boom', 'new-broadcast'])

// ── 从 composable 解构 (保持模板变量名不变) ──
const {
  isZenMode, showZenMenu, currentZenSound, zenVolume, zenSounds,
  updateZenVolume, stopZenMode, minimizeZen, returnToZen, selectZenSound
} = zen

const {
  showVoicePanel, isRecording, recordingTime, recordedBlob,
  rawAudioUrl, maskedAudioBlob, maskedAudioUrl,
  isPlayingPreview, previewCurrentTime, previewDuration, audioPreviewRef,
  voiceEffect, voiceEffects,
  toggleRecording, reapplyVoiceMask,
  togglePreviewPlayback, onPreviewTimeUpdate, seekPreview, onPreviewEnded,
  clearAudio, toggleVoicePanel, formatDuration
} = recorder

const {
  form,
  showTonePanel,
  toneSelectorRef,
  imageFile,
  imagePreview,
  isConfessionMode,
  isMidnight,
  onImageSelect,
  clearImage,
  handlePaste,
  handleClickOutside,
  tickClock
} = compose

const {
  showIdentityModal,
  recoveryKey,
  inputKey,
  handleBackup,
  handleRestore,
  copyKey
} = identityVault

const {
  isAdmin,
  adminLoginVisible,
  adminPassword,
  showBlacklistModal,
  showPasswordModal,
  blacklist,
  pwdForm,
  handleCommand: handleAdminCommand,
  handleAdminLogin,
  handleUnban,
  handleChangePassword,
  exitAdmin,
  handleBanIP
} = adminPanel

// ── UI State ──
const viewMode = ref('list')
const { isMobile, startViewportListeners, stopViewportListeners } = viewport
const nodeDetailVisible = ref(false)
const selectedNodeMsg = ref(null)

let onlineStatsTimer = null
let clockTimer = null
let connectWS = () => {}
let disconnectWS = () => {}
let setActivityModule = () => {}
let trackActivity = () => {}

const { isOnline, startNetworkListeners, stopNetworkListeners } = networkStatus

const toneMap = TONE_MODES

// ── Theme System ──
const themesList = CARD_THEMES

// ── Feed Controller ──
const feed = useFeedMessages({
  form,
  imageFile,
  isConfessionMode,
  isOnline,
  recordedBlob,
  maskedAudioBlob,
  clearImage,
  clearAudio,
  appStore,
  emit,
  isAdmin,
  activity: {
    setModule: (...args) => setActivityModule(...args),
    track: (...args) => trackActivity(...args),
    resolveModule: () => resolveActivityModule()
  }
})

const {
  messages,
  pageNum,
  pageSize,
  total,
  totalPages,
  trendingTags,
  activeTag,
  publishing,
  onlineCount,
  onlineModules,
  likedIds,
  fetchTrending,
  fetchOnlineStats,
  fetchMessages,
  publishMessage,
  handlePublishButtonClick: handleFeedPublishButtonClick,
  likeMessage,
  toggleComments,
  publishComment,
  deleteMessage,
  handleDeleteComment,
  handleTagClick,
  clearTagFilter,
  handlePageChange
} = feed

const driftBottle = useDriftBottle({ userStore, appStore, form })
const {
  bottleVisible,
  pickedBottle,
  openBottleCenter,
  handleThrowBottle,
  handlePickBottle,
  handleReplyBottle,
  handleReturnBottle
} = driftBottle

const offlineBox = useOfflineQueueDialog({ form, userStore })
const {
  offlineList,
  offlineDialogVisible,
  openOfflineBox,
  editOfflineItem,
  removeOfflineItem,
  syncOfflineQueue
} = offlineBox

function handlePublishButtonClick() {
  handleFeedPublishButtonClick(isMidnight.value)
}

const {
  resetEdgeSwipe,
  handleEdgeSwipeStart,
  handleEdgeSwipeMove,
  handleEdgeSwipeEnd
} = useMobileEdgeSwipe({
  isMobile,
  getMode: () => viewMode.value,
  setMode: (mode) => setViewMode(mode)
})

watch(() => form.content, (val) => {
  handleAdminCommand(val, () => { form.content = '' })
})

// ── Identity (委托给 userStore) ──
function refreshIdentity() {
  userStore.refreshAlias()
  form.authorAlias = userStore.alias
}

// ── 昵称持久化同步 ──
watch(() => form.authorAlias, (newVal) => {
  if (newVal) userStore.setAlias(newVal)
}, { immediate: true })

function showNodeDetail(msg) { selectedNodeMsg.value = msg; nodeDetailVisible.value = true }

const { startParticles, stopWatchingTheme } = useParticleTheme(() => form.theme)

// ── WebSocket (委托给 composable) ──
const realtime = useHomeRealtime({
  messages,
  pageNum,
  pageSize,
  total,
  userStore,
  onlineCount,
  onlineModules,
  emit
})
connectWS = realtime.connect
disconnectWS = realtime.disconnect
setActivityModule = realtime.setModule
trackActivity = realtime.trackAction

function resolveActivityModule() {
  if (props.storeVisible) return ACTIVITY_MODULES.shop
  return viewMode.value === 'graph' ? ACTIVITY_MODULES.graph : ACTIVITY_MODULES.feed
}

function setViewMode(mode) {
  if (viewMode.value === mode) return
  viewMode.value = mode
  const module = mode === 'graph' ? ACTIVITY_MODULES.graph : ACTIVITY_MODULES.feed
  setActivityModule(module)
  trackActivity(mode === 'graph' ? ACTIVITY_EVENTS.viewGraph : ACTIVITY_EVENTS.viewFeed, module)
}

function openStore() {
  setActivityModule(ACTIVITY_MODULES.shop)
  trackActivity(ACTIVITY_EVENTS.openShop, ACTIVITY_MODULES.shop)
  emit('open-store')
}

watch(() => props.storeVisible, (visible) => {
  const module = visible ? ACTIVITY_MODULES.shop : resolveActivityModule()
  setActivityModule(module)
  if (visible) trackActivity(ACTIVITY_EVENTS.openShop, ACTIVITY_MODULES.shop)
})

// ── Lifecycle ──
onMounted(() => {
  window.addEventListener('click', handleClickOutside)
  appStore.init() 
  offlineQueue.init() 
  startViewportListeners()
  clockTimer = window.setInterval(tickClock, 60000)

  // 1. 身份初始化
  userStore.init()
  form.authorAlias = userStore.alias

  // 2. WebSocket
  connectWS(userStore.userId)
  setActivityModule(resolveActivityModule())
  trackActivity(ACTIVITY_EVENTS.viewFeed, ACTIVITY_MODULES.feed)

  // 3. 数据加载
  setTimeout(() => { fetchMessages(); fetchTrending() }, 300)
  fetchOnlineStats()
  onlineStatsTimer = window.setInterval(fetchOnlineStats, 5000)

  // 4. 网络状态
  startNetworkListeners()

  // 5. 粒子
  startParticles()
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
  disconnectWS()
  stopViewportListeners()
  stopWatchingTheme()
  stopNetworkListeners()
  if (onlineStatsTimer) window.clearInterval(onlineStatsTimer)
  if (clockTimer) window.clearInterval(clockTimer)
})

</script>

<style>
/* Global Glass Style for ElDialog */
.glass-dialog {
  background-color: rgba(15, 23, 42, 0.6) !important;
  backdrop-filter: blur(40px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 2rem !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
}
.glass-dialog .el-dialog__header { display: none; }
.glass-dialog .el-dialog__body { padding: 2rem !important; color: var(--color-slate-200); }

.confession-compose {
  border-color: rgba(201, 149, 42, 0.45) !important;
  box-shadow:
    0 26px 60px -24px rgba(201, 149, 42, 0.45),
    inset 0 1px 0 rgba(255, 238, 178, 0.55) !important;
}

.cyber-pagination {
  margin-top: 2rem !important;
  --el-pagination-bg-color: transparent !important;
  --el-pagination-button-bg-color: transparent !important;
}

.cyber-pagination .el-pager li {
  width: 40px !important;
  height: 40px !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 14px !important;
  color: #64748b !important;
  margin: 0 6px !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-weight: 700 !important;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
}

.cyber-pagination .el-pager li.is-active {
  background: rgba(59, 130, 246, 0.15) !important;
  color: #60a5fa !important;
  border: 1px solid rgba(59, 130, 246, 0.5) !important;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2), inset 0 0 10px rgba(59, 130, 246, 0.1) !important;
  transform: translateY(-4px) scale(1.1) !important;
}

.cyber-pagination .el-pager li:not(.is-active):hover {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
  transform: translateY(-2px) !important;
}

.cyber-pagination button.btn-prev, 
.cyber-pagination button.btn-next {
  width: 40px !important;
  height: 40px !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 14px !important;
  color: #64748b !important;
  transition: all 0.3s !important;
}

.cyber-pagination button:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #fff !important;
}

.msg-list-enter-active, .msg-list-leave-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.msg-list-enter-from { opacity: 0; transform: translateY(30px); filter: blur(10px); }
.msg-list-leave-to { opacity: 0; transform: scale(0.95); }
.msg-list-move { transition: transform 0.5s ease; }
</style>
