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
      <ComposeBox
        :compose-state="composeState"
        :voice-state="voiceState"
        :themes-list="themesList"
        :tone-map="toneMap"
        :format-duration="formatDuration"
        @refresh-identity="refreshIdentity"
        @image-select="onImageSelect"
        @paste="handlePaste"
        @publish="publishMessage"
        @publish-button-click="handlePublishButtonClick"
        @toggle-voice-panel="toggleVoicePanel"
        @toggle-tone-panel="setTonePanel"
        @set-tone="setTone"
        @set-theme="setTheme"
        @toggle-confession="toggleConfession"
        @open-offline-box="openOfflineBox"
        @clear-image="clearImage"
        @toggle-recording="toggleRecording"
        @set-voice-effect="setVoiceEffect"
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

      <HomeGraphPanel :view-mode="viewMode" />
    </div>

    <!-- Professional Zen Overlay (Generative Garden) -->
    <Transition name="fade">
      <div v-if="isZenMode" class="fixed inset-0 z-[999] bg-slate-950 overflow-hidden">
        <ZenGarden :messages="messages" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50 pointer-events-none"></div>
      </div>
    </Transition>

    <HomeFabStack
      :zen-state="zenState"
      @toggle-zen-menu="toggleZenMenu"
      @close-zen-menu="closeZenMenu"
      @select-zen-sound="selectZenSound"
      @update:zen-volume="setZenVolume"
      @update-zen-volume="updateZenVolume"
      @return-to-zen="returnToZen"
      @minimize-zen="minimizeZen"
      @stop-zen-mode="stopZenMode"
      @open-bottle="openBottleCenter"
      @open-identity="openIdentity"
    />

    <HomeDialogs
      :identity-state="identityState"
      :bottle-state="bottleState"
      :admin-state="adminState"
      :offline-state="offlineState"
      @close-identity="closeIdentity"
      @open-store="openStore"
      @backup="handleBackup"
      @restore="handleRestore"
      @copy-key="copyKey"
      @update:input-key="setInputKey"
      @update:bottle-visible="setBottleVisible"
      @throw-bottle="handleThrowBottle"
      @pick-bottle="handlePickBottle"
      @reply-bottle="handleReplyBottle"
      @return-bottle="handleReturnBottle"
      @update:admin-password="setAdminPassword"
      @admin-login="handleAdminLogin"
      @close-admin-login="closeAdminLogin"
      @open-blacklist="openBlacklist"
      @open-password="openPassword"
      @exit-admin="exitAdmin"
      @update:blacklist-visible="setBlacklistVisible"
      @update:password-visible="setPasswordVisible"
      @unban="handleUnban"
      @change-password="handleChangePassword"
      @update:offline-dialog-visible="setOfflineDialogVisible"
      @sync-offline="syncOfflineQueue"
      @edit-offline="editOfflineItem"
      @remove-offline="removeOfflineItem"
    />
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, ref, onMounted, onUnmounted, watch } from 'vue'
import ActiveTagBanner from '@/components/home/ActiveTagBanner.vue'
import ComposeBox from '@/components/home/ComposeBox.vue'
import FeedHeader from '@/components/home/FeedHeader.vue'
import HomeDialogs from '@/components/home/HomeDialogs.vue'
import HomeFabStack from '@/components/home/HomeFabStack.vue'
import HomeFeedList from '@/components/home/feed/HomeFeedList.vue'
import HomeGraphPanel from '@/components/home/HomeGraphPanel.vue'
import TrendingTags from '@/components/home/TrendingTags.vue'
import CyberWatermark from '@/components/common/CyberWatermark.vue'
import { offlineQueue, offlineQueueCount } from '@/utils/offlineQueue'

const ZenGarden = defineAsyncComponent(() => import('@/components/zen/ZenGarden.vue'))

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

const {
  isZenMode, showZenMenu, currentZenSound, zenVolume, zenSounds,
  updateZenVolume, stopZenMode, minimizeZen, returnToZen, selectZenSound
} = zen

const {
  showVoicePanel, isRecording, recordingTime, recordedBlob, rawAudioUrl, maskedAudioBlob, maskedAudioUrl,
  isPlayingPreview, previewCurrentTime, previewDuration, audioPreviewRef, voiceEffect, voiceEffects, toggleRecording, reapplyVoiceMask,
  togglePreviewPlayback, onPreviewTimeUpdate, seekPreview, onPreviewEnded,
  clearAudio, toggleVoicePanel, formatDuration
} = recorder

const {
  form, showTonePanel, toneSelectorRef, imageFile, imagePreview, isConfessionMode, isMidnight,
  onImageSelect, clearImage, handlePaste, handleClickOutside, tickClock
} = compose

const { showIdentityModal, recoveryKey, inputKey, handleBackup, handleRestore, copyKey } = identityVault

const {
  isAdmin, adminLoginVisible, adminPassword, showBlacklistModal, showPasswordModal, blacklist, pwdForm,
  handleCommand: handleAdminCommand, handleAdminLogin, handleUnban, handleChangePassword, exitAdmin, handleBanIP
} = adminPanel

const viewMode = ref('list')
const { isMobile, startViewportListeners, stopViewportListeners } = viewport

let onlineStatsTimer = null
let clockTimer = null
let connectWS = () => {}
let disconnectWS = () => {}
let setActivityModule = () => {}
let trackActivity = () => {}

const { isOnline, startNetworkListeners, stopNetworkListeners } = networkStatus

const toneMap = TONE_MODES
const themesList = CARD_THEMES

const composeState = computed(() => ({
  form, isConfessionMode: isConfessionMode.value, isMidnight: isMidnight.value,
  isZenMode: isZenMode.value, adminLoginVisible: adminLoginVisible.value, isMobile: isMobile.value,
  isOnline: isOnline.value, publishing: publishing.value, offlineQueueCount: offlineQueueCount.value,
  imagePreview: imagePreview.value, showTonePanel: showTonePanel.value, toneSelectorRef
}))

const voiceState = computed(() => ({
  showVoicePanel: showVoicePanel.value, isRecording: isRecording.value, recordingTime: recordingTime.value,
  recordedBlob: recordedBlob.value, rawAudioUrl: rawAudioUrl.value, maskedAudioUrl: maskedAudioUrl.value,
  isPlayingPreview: isPlayingPreview.value, previewCurrentTime: previewCurrentTime.value,
  previewDuration: previewDuration.value, audioPreviewRef, voiceEffect: voiceEffect.value, voiceEffects
}))

const zenState = computed(() => ({
  showZenMenu: showZenMenu.value, isZenMode: isZenMode.value,
  currentZenSound: currentZenSound.value, zenVolume: zenVolume.value, zenSounds
}))

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
  messages, pageNum, pageSize, total, totalPages, trendingTags, activeTag, publishing,
  onlineCount, onlineModules, likedIds, fetchTrending, fetchOnlineStats, fetchMessages, publishMessage,
  handlePublishButtonClick: handleFeedPublishButtonClick, likeMessage, toggleComments, publishComment,
  deleteMessage, handleDeleteComment, handleTagClick, clearTagFilter, handlePageChange
} = feed

const driftBottle = useDriftBottle({ userStore, appStore, form })
const {
  bottleVisible, pickedBottle, openBottleCenter,
  handleThrowBottle, handlePickBottle, handleReplyBottle, handleReturnBottle
} = driftBottle

const offlineBox = useOfflineQueueDialog({ form, userStore })
const {
  offlineList, offlineDialogVisible, openOfflineBox,
  editOfflineItem, removeOfflineItem, syncOfflineQueue
} = offlineBox

const identityState = computed(() => ({
  showIdentityModal: showIdentityModal.value, recoveryKey: recoveryKey.value, inputKey: inputKey.value
}))

const bottleState = computed(() => ({
  bottleVisible: bottleVisible.value, pickedBottle: pickedBottle.value, userId: userStore.userId
}))

const adminState = computed(() => ({
  adminLoginVisible: adminLoginVisible.value, adminPassword: adminPassword.value, isAdmin: isAdmin.value,
  showBlacklistModal: showBlacklistModal.value, showPasswordModal: showPasswordModal.value, blacklist: blacklist.value, pwdForm
}))

const offlineState = computed(() => ({
  offlineDialogVisible: offlineDialogVisible.value, isOnline: isOnline.value,
  offlineList: offlineList.value, offlineQueueCount: offlineQueueCount.value
}))

function handlePublishButtonClick() {
  handleFeedPublishButtonClick(isMidnight.value)
}

function setTonePanel(visible) { showTonePanel.value = visible }
function setTone(tone) { form.mood = tone }
function setTheme(theme) { form.theme = theme }
function toggleConfession() { isConfessionMode.value = !isConfessionMode.value }
function setVoiceEffect(effect) { voiceEffect.value = effect }

function toggleZenMenu() { showZenMenu.value = !showZenMenu.value }
function closeZenMenu() { showZenMenu.value = false }
function setZenVolume(volume) { zenVolume.value = volume }
function openIdentity() { showIdentityModal.value = true }
function closeIdentity() { showIdentityModal.value = false }
function setInputKey(value) { inputKey.value = value }
function setBottleVisible(visible) { bottleVisible.value = visible }
function setAdminPassword(value) { adminPassword.value = value }
function closeAdminLogin() { adminLoginVisible.value = false }
function openBlacklist() { showBlacklistModal.value = true }
function openPassword() { showPasswordModal.value = true }
function setBlacklistVisible(visible) { showBlacklistModal.value = visible }
function setPasswordVisible(visible) { showPasswordModal.value = visible }
function setOfflineDialogVisible(visible) { offlineDialogVisible.value = visible }

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

watch(() => form.authorAlias, (newVal) => {
  if (newVal) userStore.setAlias(newVal)
}, { immediate: true })

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

function loadInitialFeed() {
  setTimeout(() => {
    fetchMessages()
    fetchTrending()
  }, 300)
  fetchOnlineStats()
  onlineStatsTimer = window.setInterval(fetchOnlineStats, 5000)
}

function startHomeRuntime() {
  window.addEventListener('click', handleClickOutside)
  appStore.init() 
  offlineQueue.init() 
  startViewportListeners()
  clockTimer = window.setInterval(tickClock, 60000)

  userStore.init()
  form.authorAlias = userStore.alias

  connectWS(userStore.userId)
  setActivityModule(resolveActivityModule())
  trackActivity(ACTIVITY_EVENTS.viewFeed, ACTIVITY_MODULES.feed)

  loadInitialFeed()
  startNetworkListeners()
  startParticles()
}

function stopHomeRuntime() {
  window.removeEventListener('click', handleClickOutside)
  disconnectWS()
  stopViewportListeners()
  stopWatchingTheme()
  stopNetworkListeners()
  if (onlineStatsTimer) window.clearInterval(onlineStatsTimer)
  if (clockTimer) window.clearInterval(clockTimer)
  onlineStatsTimer = null
  clockTimer = null
}

onMounted(startHomeRuntime)
onUnmounted(stopHomeRuntime)

</script>
