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

      <!-- Active Tag Banner -->
      <Transition name="page">
        <div v-if="activeTag" class="flex items-center justify-between px-6 py-4 rounded-2xl bg-blue-50/80 border border-blue-200 shadow-sm backdrop-blur-md">
          <div class="flex items-center gap-2">
            <Hash :size="16" class="text-blue-500" />
            <span class="text-sm font-medium text-slate-700">正在查看话题: <span class="text-blue-600 font-bold">{{ activeTag }}</span></span>
          </div>
          <button @click="clearTagFilter" class="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors">返回全域</button>
        </div>
      </Transition>

      <!-- Main Feed -->
      <div v-if="viewMode === 'list'" class="space-y-12">
        <div v-if="total > 0" class="space-y-12">
          <TransitionGroup name="msg-list">
            <MessageCard
              v-for="(msg, index) in messages"
              :key="msg.id"
              :msg="msg"
              :liked="likedIds.has(msg.id)"
              :class="['theme-' + (msg.theme || 'default'), 'animate__animated animate__fadeInUp']"
              :style="{ animationDelay: (index * 100) + 'ms' }"
              @like="likeMessage"
              @toggle-comments="toggleComments"
              @delete="deleteMessage"
              @delete-comment="handleDeleteComment"
              @publish-comment="publishComment"
              @react="trackActivity(ACTIVITY_EVENTS.react)"
              @witness="trackActivity(ACTIVITY_EVENTS.witnessConfession, ACTIVITY_MODULES.comments)"
              @tag-click="handleTagClick"
              :isAdmin="isAdmin"
              @admin-ban="handleBanIP"
            />
          </TransitionGroup>

          <!-- Pagination -->
            <!-- Custom Godly Pagination -->
            <div class="flex justify-center pt-16 pb-32">
              <nav class="flex items-center gap-1 p-2 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
                <!-- Prev Button -->
                <button 
                  class="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 group disabled:opacity-20 disabled:cursor-not-allowed hover:bg-blue-500/10"
                  :disabled="pageNum <= 1"
                  @click="handlePageChange(pageNum - 1)"
                >
                  <ChevronLeft :size="18" class="text-slate-400 group-hover:text-blue-400 transition-colors" />
                </button>

                <!-- Page Numbers -->
                <div class="flex items-center gap-1">
                  <button 
                    v-for="p in totalPages" 
                    :key="p"
                    @click="handlePageChange(p)"
                    class="w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-500 relative group"
                    :class="pageNum === p ? 'text-white' : 'text-slate-500 hover:text-slate-200'"
                  >
                    <!-- Active Glow Effect -->
                    <div 
                      v-if="pageNum === p"
                      class="absolute inset-0 rounded-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-blue-400/50 animate-in zoom-in duration-300"
                    ></div>
                    <span class="relative z-10">{{ p }}</span>
                  </button>
                </div>

                <!-- Next Button -->
                <button 
                  class="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 group disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5"
                  :disabled="pageNum >= totalPages"
                  @click="handlePageChange(pageNum + 1)"
                >
                  <ChevronRight :size="18" class="text-slate-400 group-hover:text-white transition-colors" />
                </button>
              </nav>
            </div>
        </div>

        <!-- Empty State -->
        <div v-else class="py-24 text-center space-y-6">
          <div class="text-6xl opacity-20 grayscale">🌌</div>
          <div class="space-y-2">
            <h4 class="text-slate-400 font-medium">这里还是一片虚无</h4>
            <p class="text-xs text-slate-600">你是第一个发现这里的人吗？</p>
          </div>
        </div>
      </div>

      <!-- Graph View (Wrapper for Obsidian Graph) -->
      <div v-else class="h-[850px] relative">
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

    <!-- FABs (Fixed Floating) -->
    <div class="fixed right-8 bottom-8 flex flex-col gap-4 z-[1001]">
      <!-- Zen Control -->
      <div class="relative group" v-click-outside="() => showZenMenu = false">
        <Transition name="page">
          <div v-if="showZenMenu" class="absolute bottom-full right-0 mb-4 glass-card w-64 p-4 space-y-4">
            <div class="space-y-2">
              <button 
                v-for="s in zenSounds" :key="s.id" 
                @click="selectZenSound(s)"
                class="w-full text-left px-4 py-2 rounded-lg text-xs transition-all flex items-center justify-between"
                :class="currentZenSound?.id === s.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'hover:bg-white/5 text-slate-400'"
              >
                <span>{{ s.icon }} {{ s.name }}</span>
                <div v-if="currentZenSound?.id === s.id" class="flex gap-1">
                  <div class="w-0.5 h-3 bg-blue-500 animate-[bounce_0.6s_infinite_0s]"></div>
                  <div class="w-0.5 h-3 bg-blue-500 animate-[bounce_0.6s_infinite_0.1s]"></div>
                  <div class="w-0.5 h-3 bg-blue-500 animate-[bounce_0.6s_infinite_0.2s]"></div>
                </div>
              </button>
            </div>
            <div class="pt-4 border-t border-white/5">
              <div class="flex items-center justify-between text-[10px] text-slate-500 mb-2 px-1">
                <span>VOLUME</span>
                <span>{{ zenVolume }}%</span>
              </div>
              <el-slider v-model="zenVolume" :show-tooltip="false" @input="updateZenVolume" size="small" />
            </div>
            <div v-if="currentZenSound" class="space-y-2 mt-4 pt-4 border-t border-white/5">
              <button @click="returnToZen" v-if="!isZenMode" class="w-full py-2 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 hover:bg-blue-500/20 transition-all uppercase tracking-widest">Return to Zen</button>
              <button @click="minimizeZen" v-if="isZenMode" class="w-full py-2 rounded-lg bg-slate-500/10 text-slate-400 text-[10px] font-bold border border-slate-500/20 hover:bg-slate-500/20 transition-all uppercase tracking-widest">Minimize UI</button>
              <button @click="stopZenMode" class="w-full py-2 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20 hover:bg-red-500/20 transition-all uppercase tracking-widest">Terminate All</button>
            </div>
          </div>
        </Transition>
        <button 
          class="w-12 h-12 rounded-full glass-effect flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all active:scale-90"
          :class="{ 'bg-blue-500 !text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]': currentZenSound || isZenMode }"
          @click="showZenMenu = !showZenMenu"
        >
          <Volume2 v-if="currentZenSound" :size="20" />
          <Moon v-else :size="20" />
        </button>
      </div>

      <!-- Bottle FAB -->
      <button 
        @click="openBottleCenter"
        class="w-12 h-12 rounded-full glass-effect flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all active:scale-90 border-cyan-500/20"
      >
        <Waves :size="20" />
      </button>

      <!-- Identity FAB -->
      <button 
        @click="showIdentityModal = true"
        class="w-12 h-12 rounded-full glass-effect flex items-center justify-center text-slate-400 hover:text-purple-400 transition-all active:scale-90 border-purple-500/20"
      >
        <Fingerprint :size="20" />
      </button>
    </div>

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
import MessageCard from '@/components/business/MessageCard.vue'
import AdminDock from '@/components/home/admin/AdminDock.vue'
import AdminLoginModal from '@/components/home/admin/AdminLoginModal.vue'
import BlacklistDialog from '@/components/home/admin/BlacklistDialog.vue'
import ComposeBox from '@/components/home/ComposeBox.vue'
import FeedHeader from '@/components/home/FeedHeader.vue'
import IdentityVaultModal from '@/components/home/IdentityVaultModal.vue'
import OfflineQueueDialog from '@/components/home/OfflineQueueDialog.vue'
import PasswordDialog from '@/components/home/admin/PasswordDialog.vue'
import TrendingTags from '@/components/home/TrendingTags.vue'
import CyberWatermark from '@/components/common/CyberWatermark.vue'
import {
  ChevronLeft, ChevronRight, Fingerprint, Hash, Moon, Volume2, Waves
} from 'lucide-vue-next'
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

// ── Custom Directive ──
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) binding.value(event)
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) { document.removeEventListener('click', el.clickOutsideEvent) }
}

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
