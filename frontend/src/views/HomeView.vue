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
                @set-tone-selector-ref="setToneSelectorRef"
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
                @update-author-alias="setAuthorAlias"
                @update-content="setComposeContent"
                @set-audio-preview-ref="setAudioPreviewRef"
            />

            <TrendingTags
                :tags="trendingTags"
                :active-tag="activeTag"
                :subscribed-tag-ids="subscribedTagIds"
                @tag-click="handleFeedTagClick"
                @toggle-subscription="toggleTagSubscription"
            />

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
                :highlighted-message-id="highlightedMessageId"
                :highlighted-comment-id="highlightedCommentId"
                :is-quiet-feed-switching="isQuietFeedSwitching"
                @like="likeMessage"
                @toggle-comments="toggleComments"
                @delete="deleteMessage"
                @delete-comment="handleDeleteComment"
                @publish-comment="publishComment"
                @set-reply-target="setReplyTarget"
                @clear-reply="clearReplyTarget"
                @update-comment-text="setCommentText"
                @react="trackActivity(ACTIVITY_EVENTS.react)"
                @witness="handleWitness"
                @tag-click="handleFeedTagClick"
                @admin-ban="handleBanIP"
                @page-change="handlePageChange"
            />

            <HomeGraphPanel :view-mode="viewMode" />
        </div>

        <!-- Professional Zen Overlay (Generative Garden) -->
        <Transition name="fade">
            <div v-if="isZenMode" class="fixed inset-0 z-[999] bg-slate-950 overflow-hidden">
                <ZenGarden :messages="messages" />
                <div
                    class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50 pointer-events-none"
                ></div>
            </div>
        </Transition>

        <HomeFabStack
            :zen-state="zenState"
            :notification-unread-count="notificationUnreadCount"
            :notification-badge="notificationBadge"
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
            @open-notifications="openNotificationCenter"
        />

        <NotificationCenter
            :state="notificationState"
            @close="notifications.closeCenter"
            @notification-click="handleNotificationClick"
            @mark-read="notifications.markRead"
            @mark-all="notifications.markAllRead"
            @load-more="notifications.loadMore"
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
            @update:old-password="setOldPassword"
            @update:new-password="setNewPassword"
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

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ActiveTagBanner from '@/components/home/ActiveTagBanner.vue'
import ComposeBox from '@/components/home/ComposeBox.vue'
import FeedHeader from '@/components/home/FeedHeader.vue'
import HomeDialogs from '@/components/home/HomeDialogs.vue'
import HomeFabStack from '@/components/home/HomeFabStack.vue'
import HomeFeedList from '@/components/home/feed/HomeFeedList.vue'
import HomeGraphPanel from '@/components/home/HomeGraphPanel.vue'
import NotificationCenter from '@/components/home/NotificationCenter.vue'
import TrendingTags from '@/components/home/TrendingTags.vue'
import CyberWatermark from '@/components/common/CyberWatermark.vue'
import { commentApi } from '@/api/modules/comment'
import { offlineQueue, offlineQueueCount } from '@/utils/offlineQueue'
import { useNotifications } from '@/composables/useNotifications'
import { useHomeActivityBridge } from '@/composables/home/useHomeActivityBridge'
import { useHomeComposeBindings } from '@/composables/home/useHomeComposeBindings'
import { useHomeDialogBindings } from '@/composables/home/useHomeDialogBindings'
import { useHomeFeedBindings } from '@/composables/home/useHomeFeedBindings'
import { useHomeNotificationBindings } from '@/composables/home/useHomeNotificationBindings'
import { useHomeRuntimeBindings } from '@/composables/home/useHomeRuntimeBindings'

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
import { ACTIVITY_EVENTS } from '@/constants/activityEvents'
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
const notifications = useNotifications()

const props = withDefaults(
    defineProps<{
        storeVisible?: boolean
    }>(),
    {
        storeVisible: false
    }
)
const emit = defineEmits<{
    (event: 'publish-success'): void
    (event: 'open-store'): void
    (event: 'resonance-boom'): void
    (event: 'new-broadcast'): void
}>()

const {
    isZenMode,
    showZenMenu,
    currentZenSound,
    zenVolume,
    zenSounds,
    updateZenVolume,
    stopZenMode,
    minimizeZen,
    returnToZen,
    selectZenSound
} = zen

const {
    showVoicePanel,
    isRecording,
    recordingTime,
    recordedBlob,
    rawAudioUrl,
    maskedAudioBlob,
    maskedAudioUrl,
    isPlayingPreview,
    previewCurrentTime,
    previewDuration,
    audioPreviewRef,
    voiceEffect,
    voiceEffects,
    toggleRecording,
    reapplyVoiceMask,
    togglePreviewPlayback,
    onPreviewTimeUpdate,
    seekPreview,
    onPreviewEnded,
    clearAudio,
    toggleVoicePanel,
    formatDuration
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

const { handleBackup, handleRestore, copyKey } = identityVault

const {
    isAdmin,
    adminLoginVisible,
    handleCommand: handleAdminCommand,
    handleAdminLogin,
    handleUnban,
    handleChangePassword,
    exitAdmin,
    handleBanIP
} = adminPanel

const viewMode = ref<'list' | 'graph'>('list')
const { isMobile, startViewportListeners, stopViewportListeners } = viewport

const { isOnline, startNetworkListeners, stopNetworkListeners } = networkStatus

const toneMap = TONE_MODES
const themesList = CARD_THEMES

const zenState = computed(() => ({
    showZenMenu: showZenMenu.value,
    isZenMode: isZenMode.value,
    currentZenSound: currentZenSound.value,
    zenVolume: zenVolume.value,
    zenSounds
}))

const driftBottle = useDriftBottle({ userStore, appStore, form })
const { openBottleCenter, handleThrowBottle, handlePickBottle, handleReplyBottle, handleReturnBottle } = driftBottle

const offlineBox = useOfflineQueueDialog({ form, userStore })
const { openOfflineBox, editOfflineItem, removeOfflineItem, syncOfflineQueue } = offlineBox

function handlePublishButtonClick() {
    handleFeedPublishButtonClick(isMidnight.value)
}

function toggleZenMenu() {
    showZenMenu.value = !showZenMenu.value
}
function closeZenMenu() {
    showZenMenu.value = false
}
function setZenVolume(volume: number) {
    zenVolume.value = volume
}

const { resetEdgeSwipe, handleEdgeSwipeStart, handleEdgeSwipeMove, handleEdgeSwipeEnd } = useMobileEdgeSwipe({
    isMobile,
    getMode: () => viewMode.value,
    setMode: mode => setViewMode(mode as 'list' | 'graph')
})

watch(
    () => form.content,
    val => {
        handleAdminCommand(val, () => {
            form.content = ''
        })
    }
)

// ── Identity (委托给 userStore) ──
function refreshIdentity() {
    userStore.refreshAlias()
    form.authorAlias = userStore.alias
}

watch(
    () => form.authorAlias,
    newVal => {
        if (newVal) userStore.setAlias(newVal)
    },
    { immediate: true }
)

const { startParticles, stopWatchingTheme } = useParticleTheme(() => form.theme)

const activityBridge = useHomeActivityBridge({
    viewMode,
    storeVisible: () => props.storeVisible,
    openNotificationCenter: async () => {
        await notifications.openCenter()
    },
    emitOpenStore: () => emit('open-store')
})

const {
    setViewMode,
    openStore,
    openNotificationCenter,
    setActivityHandlers,
    setActivityModule,
    trackActivity,
    resolveActivityModule
} = activityBridge

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
        setModule: setActivityModule,
        track: trackActivity,
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
    isQuietFeedSwitching,
    publishing,
    subscribedTagIds,
    onlineCount,
    onlineModules,
    likedIds,
    fetchTrending,
    fetchTagSubscriptions,
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
    toggleTagSubscription,
    clearTagFilter,
    handlePageChange,
    locateMessageById,
    witnessMessage
} = feed

const {
    composeState,
    voiceState,
    setTonePanel,
    setToneSelectorRef,
    setAuthorAlias,
    setComposeContent,
    setTone,
    setTheme,
    toggleConfession,
    setVoiceEffect,
    setAudioPreviewRef
} = useHomeComposeBindings({
    compose: {
        form,
        showTonePanel,
        toneSelectorRef,
        imagePreview,
        isConfessionMode,
        isMidnight
    },
    recorder: {
        showVoicePanel,
        isRecording,
        recordingTime,
        recordedBlob,
        rawAudioUrl,
        maskedAudioUrl,
        isPlayingPreview,
        previewCurrentTime,
        previewDuration,
        audioPreviewRef,
        voiceEffect,
        voiceEffects
    },
    isZenMode,
    adminLoginVisible,
    isMobile,
    isOnline,
    publishing,
    offlineQueueCount
})

const {
    identityState,
    bottleState,
    adminState,
    offlineState,
    openIdentity,
    closeIdentity,
    setInputKey,
    setBottleVisible,
    setAdminPassword,
    setOldPassword,
    setNewPassword,
    closeAdminLogin,
    openBlacklist,
    openPassword,
    setBlacklistVisible,
    setPasswordVisible,
    setOfflineDialogVisible
} = useHomeDialogBindings({
    identityVault,
    driftBottle,
    adminPanel,
    offlineBox,
    userId: computed(() => userStore.userId),
    isOnline,
    offlineQueueCount
})

const {
    setReplyTarget,
    clearReplyTarget,
    setCommentText,
    handleWitness,
    handleTagClick: handleFeedTagClick
} = useHomeFeedBindings({
    messages,
    witnessMessage,
    handleTagClick,
    trackActivity
})

// ── WebSocket (委托给 composable) ──
const realtime = useHomeRealtime({
    messages,
    pageNum,
    pageSize,
    total,
    userStore,
    onlineCount,
    onlineModules,
    onNotificationCreated: notifications.handleRealtimeNotification,
    emit
})
setActivityHandlers({
    setActivityModule: realtime.setModule,
    trackActivity: realtime.trackAction
})

const {
    notificationState,
    notificationUnreadCount,
    notificationBadge,
    highlightedMessageId,
    highlightedCommentId,
    clearHighlight,
    handleNotificationClick
} = useHomeNotificationBindings({
    notifications,
    locateMessageById,
    loadComments: async messageId => {
        const res = await commentApi.getComments(messageId)
        return res.data || []
    },
    handleTagClick: handleFeedTagClick,
    setViewMode,
    notifyInfo: ElMessage.info,
    notifyWarning: ElMessage.warning
})

const { startHomeRuntime, stopHomeRuntime } = useHomeRuntimeBindings({
    addDocumentClickListener: () => window.addEventListener('click', handleClickOutside),
    removeDocumentClickListener: () => window.removeEventListener('click', handleClickOutside),
    initApp: () => appStore.init(),
    initOfflineQueue: () => offlineQueue.init(),
    startViewportListeners,
    stopViewportListeners,
    startNetworkListeners,
    stopNetworkListeners,
    startParticles,
    stopWatchingTheme,
    tickClock,
    initUser: () => userStore.init(),
    getUserId: () => userStore.userId,
    getUserAlias: () => userStore.alias,
    setAuthorAlias: alias => {
        form.authorAlias = alias
    },
    connectRealtime: realtime.connect,
    disconnectRealtime: realtime.disconnect,
    fetchUnreadCount: notifications.fetchUnreadCount,
    setActivityModule,
    resolveActivityModule,
    trackActivity,
    fetchMessages,
    fetchTrending,
    fetchTagSubscriptions,
    fetchOnlineStats,
    clearHighlight
})

onMounted(startHomeRuntime)
onUnmounted(stopHomeRuntime)
</script>
