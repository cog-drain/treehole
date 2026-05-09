<template>
  <div 
    class="min-h-screen transition-all duration-1000"
    :class="{ 'zen-active': isZenMode, 'offline-mode': !isOnline }"
  >
    <CyberWatermark />

    <div v-if="uiStore.isDark" class="fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-1000">
      <div class="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-500/20 blur-[150px] rounded-full animate-pulse"></div>
      <div class="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-purple-600/15 blur-[150px] rounded-full"></div>
    </div>

    <div class="relative max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-24 space-y-8 sm:space-y-12">
      <PublishComposerSection
        :form="publishComposer.form"
        :mood-map="publishComposer.moodMap"
        :available-skins="publishComposer.availableSkins"
        :message-skin-meta="publishComposer.messageSkinMeta"
        :publishing="publishComposer.publishing"
        :is-online="isOnline"
        :is-mobile="isMobile"
        :offline-queue-count="offlineQueueCount"
        :image-preview="publishComposer.imagePreview"
        :recorder-state="recorderState"
        :disabled="isZenMode || adminLoginVisible"
        @update:authorAlias="publishComposer.form.authorAlias = $event"
        @update:content="publishComposer.form.content = $event"
        @refresh-identity="publishComposer.refreshIdentity"
        @focus-alias="publishComposer.handleAliasFocus"
        @select-skin="uiStore.setMessageSkin($event)"
        @paste="publishComposer.handlePaste"
        @image-select="publishComposer.onImageSelect"
        @clear-image="publishComposer.clearImage"
        @toggle-mood="toggleMood"
        @open-offline-box="openOfflineBox"
        @publish="handlePublishMessage"
        @select-voice-effect="handleSelectVoiceEffect"
      />

      <FeedToolbar
        :trending-tags="feedController.trendingTags"
        :active-tag="feedController.activeTag"
        :view-mode="viewMode"
        @tag-click="handleTagClick"
        @update:viewMode="viewMode = $event"
      />

      <ActiveTagBanner
        :active-tag="feedController.activeTag"
        :is-dark="uiStore.isDark"
        @clear="clearTagFilter"
      />

      <FeedListSection
        :view-mode="viewMode"
        :messages="feedController.messages"
        :liked-ids="likedIds"
        :is-admin="isAdmin"
        :total="feedController.total"
        :page-num="feedController.pageNum"
        :total-pages="feedController.totalPages"
        @like="(msg) => feedController.likeMessage(msg, likedIds)"
        @toggle-comments="(msg) => feedController.toggleComments(msg, readIds, markAsRead)"
        @delete="handleDeleteMessage"
        @delete-comment="handleDeleteComment"
        @publish-comment="feedController.publishComment"
        @react-comment="feedController.reactToComment"
        @tag-click="handleTagClick"
        @admin-ban="handleBanIP"
        @page-change="handlePageChange"
        @node-click="showNodeDetail"
      />
    </div>

    <Transition name="fade">
      <div v-if="isZenMode" class="fixed inset-0 z-[999] bg-slate-950 overflow-hidden">
        <ZenGarden :messages="feedController.messages" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50 pointer-events-none"></div>
      </div>
    </Transition>

    <ZenControlDock
      :show-zen-menu="showZenMenu"
      :current-zen-sound="currentZenSound"
      :zen-volume="zenVolume"
      :zen-sounds="zenSounds"
      :is-zen-mode="isZenMode"
      :v-click-outside="vClickOutside"
      @toggle-menu="showZenMenu = !showZenMenu"
      @select-sound="selectZenSound"
      @update-volume="updateZenVolume"
      @return-zen="returnToZen"
      @minimize-zen="minimizeZen"
      @stop-zen="stopZenMode"
      @open-bottle="openBottleCenter"
      @open-identity="showIdentityModal = true"
    />

    <IdentityVaultModal
      :visible="showIdentityModal"
      :recovery-key="recoveryKey"
      :recovery-notice="recoveryNotice"
      :input-key="inputKey"
      @close="showIdentityModal = false"
      @open-store="$emit('open-store')"
      @copy-key="copyKey"
      @backup="handleBackup"
      @update:inputKey="inputKey = $event"
      @restore="handleRestore"
    />

    <DriftBottleDialog 
      v-model="bottleVisible"
      :picked-data="pickedBottle"
      :user-id="api.getUserIdentity().userId"
      @on-throw="handleThrowBottle"
      @on-pick="handlePickBottle"
      @on-reply="handleReplyBottle"
      @on-return="handleReturnBottle"
    />

    <AdminPanels
      :admin-login-visible="adminLoginVisible"
      :admin-password="adminPassword"
      :is-admin="isAdmin"
      :show-blacklist-modal="showBlacklistModal"
      :show-password-modal="showPasswordModal"
      :blacklist="blacklist"
      :pwd-form="pwdForm"
      :password-input-ref="adminPwdInputRef"
      @update:adminPassword="adminPassword = $event"
      @update:showBlacklistModal="showBlacklistModal = $event"
      @update:showPasswordModal="showPasswordModal = $event"
      @update:pwdForm="Object.assign(pwdForm, $event)"
      @login="handleAdminLogin"
      @close-login="adminLoginVisible = false"
      @open-blacklist="showBlacklistModal = true"
      @open-password="showPasswordModal = true"
      @exit-admin="exitAdmin"
      @unban="handleUnban"
      @change-password="handleChangePassword"
    />

    <OfflineQueueModal
      :visible="offlineDialogVisible"
      :is-online="isOnline"
      :offline-queue-count="offlineQueueCount"
      :items="offlineList"
      @update:visible="offlineDialogVisible = $event"
      @sync="syncOfflineQueue"
      @edit="editOfflineItem"
      @remove="removeOfflineItem"
    />
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import api, {
  getToken,
  MSG_TOKEN_KEY,
  CMT_TOKEN_KEY,
  getTrendingTags,
  getMessagesByTag,
  throwBottle,
  pickBottle,
  replyBottle,
  returnBottle,
  backupIdentity,
  restoreIdentity
} from '@/api'
import PublishComposerSection from '@/features/home/PublishComposerSection.vue'
import FeedToolbar from '@/features/home/FeedToolbar.vue'
import ActiveTagBanner from '@/features/home/ActiveTagBanner.vue'
import FeedListSection from '@/features/home/FeedListSection.vue'
import ZenControlDock from '@/features/home/ZenControlDock.vue'
import IdentityVaultModal from '@/features/home/IdentityVaultModal.vue'
import AdminPanels from '@/features/home/AdminPanels.vue'
import OfflineQueueModal from '@/features/home/OfflineQueueModal.vue'
import { usePublishComposer } from '@/features/home/usePublishComposer'
import { useHomeFeedController } from '@/features/home/useHomeFeedController'
import CyberWatermark from '@/components/common/CyberWatermark.vue'
import ZenGarden from '@/components/zen/ZenGarden.vue'
import DriftBottleDialog from '@/components/business/DriftBottleDialog.vue'
import { useUiStore } from '@/stores/ui'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { useZenMode } from '@/composables/useZenMode'
import { useRecorder } from '@/composables/useRecorder'
import { useWebSocket } from '@/composables/useWebSocket'
import { toast } from '@/services/toast'
import { confirmDialog, promptDialog } from '@/services/dialog'
import { normalizeMessageSkin } from '@/utils/messageSkins'
import { offlineQueue, offlineQueueCount } from '@/utils/offlineQueue'

const userStore = useUserStore()
const appStore = useAppStore()
const uiStore = useUiStore()
const zen = useZenMode()
const recorder = useRecorder()

const emit = defineEmits(['publish-success', 'open-store', 'resonance-boom', 'new-broadcast'])

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

const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) binding.value(event)
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

const viewMode = ref('list')
const isMobile = ref(window.innerWidth < 768)
const nodeDetailVisible = ref(false)
const selectedNodeMsg = ref(null)
const isOnline = ref(navigator.onLine)
const readIds = ref(new Set(JSON.parse(localStorage.getItem('read_message_ids') || '[]')))
const likedIds = ref(new Set(JSON.parse(localStorage.getItem('treehole_likes') || '[]')))

const showIdentityModal = ref(false)
const recoveryKey = ref('')
const inputKey = ref('')
const recoveryNotice = ref('')

const adminLoginVisible = ref(false)
const adminPassword = ref('')
const adminPwdInputRef = ref(null)
const showBlacklistModal = ref(false)
const showPasswordModal = ref(false)
const blacklist = ref([])
const pwdForm = reactive({ oldPassword: '', newPassword: '' })
const isAdmin = ref(!!localStorage.getItem('treehole_admin_token'))

const offlineList = ref([])
const offlineDialogVisible = ref(false)

const bottleVisible = ref(false)
const bottleState = ref('init')
const newBottleContent = ref('')
const pickedBottle = ref(null)
const replyContent = ref('')
const replied = ref(false)

watch(likedIds, (value) => {
  localStorage.setItem('treehole_likes', JSON.stringify([...value]))
}, { deep: true })

const recorderState = {
  showVoicePanel: recorder.showVoicePanel,
  isRecording: recorder.isRecording,
  recordingTime: recorder.recordingTime,
  recordedBlob: recorder.recordedBlob,
  rawAudioUrl: recorder.rawAudioUrl,
  maskedAudioBlob: recorder.maskedAudioBlob,
  maskedAudioUrl: recorder.maskedAudioUrl,
  isPlayingPreview: recorder.isPlayingPreview,
  previewCurrentTime: recorder.previewCurrentTime,
  previewDuration: recorder.previewDuration,
  audioPreviewRef: recorder.audioPreviewRef,
  voiceEffect: recorder.voiceEffect,
  voiceEffects: recorder.voiceEffects,
  toggleRecording: recorder.toggleRecording,
  reapplyVoiceMask: recorder.reapplyVoiceMask,
  togglePreviewPlayback: recorder.togglePreviewPlayback,
  onPreviewTimeUpdate: recorder.onPreviewTimeUpdate,
  seekPreview: recorder.seekPreview,
  onPreviewEnded: recorder.onPreviewEnded,
  clearAudio: recorder.clearAudio,
  toggleVoicePanel: recorder.toggleVoicePanel,
  formatDuration: recorder.formatDuration
}

const feedController = useHomeFeedController({
  uiStore,
  userStore,
  api,
  getTrendingTags,
  getMessagesByTag,
  appStore,
  emit
})

const publishComposer = usePublishComposer({
  uiStore,
  userStore,
  recorder,
  offlineQueue,
  offlineQueueCount,
  uploadFile: api.uploadFile,
  publishMessageApi: api.publishMessage,
  fetchTrending: feedController.fetchTrending,
  publishSuccess: (message) => {
    emit('publish-success', message)
    appStore.addEnergy(10)
  },
  afterPublish: () => feedController.fetchMessages(readIds),
  pageSize: feedController.pageSize.value,
  messages: feedController.messages,
  total: feedController.total
})

watch(() => publishComposer.form.content, (value) => {
  if (value?.trim() === 'sudo su - root') {
    adminLoginVisible.value = true
    adminPassword.value = ''
    publishComposer.form.content = ''
  } else if (value?.trim() === 'exit' && isAdmin.value) {
    isAdmin.value = false
    localStorage.removeItem('treehole_admin_token')
    publishComposer.form.content = ''
    toast.info('权限已撤销')
  }
})

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

function markAsRead(id) {
  readIds.value.add(id)
  localStorage.setItem('read_message_ids', JSON.stringify([...readIds.value]))
}

function toggleMood(mood) {
  publishComposer.form.mood = publishComposer.form.mood === mood ? '' : mood
}

async function handlePublishMessage() {
  await publishComposer.publishMessage()
}

function handleSelectVoiceEffect(effectId) {
  recorder.voiceEffect.value = effectId
  recorder.reapplyVoiceMask()
}

async function handleTagClick(tag) {
  feedController.handleTagClick(tag)
  await feedController.fetchMessages(readIds)
}

async function clearTagFilter() {
  feedController.clearTagFilter()
  await feedController.fetchMessages(readIds)
}

async function handlePageChange(page) {
  feedController.handlePageChange(page)
  await feedController.fetchMessages(readIds)
}

function showNodeDetail(message) {
  selectedNodeMsg.value = message
  nodeDetailVisible.value = true
}

const handleOnline = () => {
  isOnline.value = true
  if (offlineQueueCount.value > 0) {
    offlineQueue.sync(api)
  }
}

const handleOffline = () => {
  isOnline.value = false
  toast.warning('你已进入离线回声舱')
}

async function handleBackup(rotated = false) {
  try {
    const response = await backupIdentity(userStore.alias)
    recoveryKey.value = response.data?.recoveryKey || ''
    recoveryNotice.value = rotated ? '已生成新恢复码，旧码现已失效。' : '恢复码已生成，请尽快复制并妥善保存。'
    toast.success(rotated ? '新恢复码已生成，旧码已失效' : '恢复码已生成')
  } catch {}
}

async function handleRestore() {
  try {
    const response = await restoreIdentity(inputKey.value)
    if (response.code === 200) {
      localStorage.setItem('treehole_identity', JSON.stringify({ userId: response.data.userId, createdAt: Date.now() }))
      if (response.data.displayName) {
        localStorage.setItem('treehole_alias', response.data.displayName)
      }
      recoveryNotice.value = response.data.displayName
        ? '已恢复匿名身份与默认昵称，不会恢复本机能量和主题设置。'
        : '已恢复匿名身份，不会恢复本机能量和主题设置。'
      toast.success(response.data.displayName ? '身份与默认昵称已恢复' : '身份还原成功')
      setTimeout(() => window.location.reload(), 1500)
    }
  } catch {}
}

const copyTextFallback = (text) => {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, text.length)
  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)
  return copied
}

async function copyKey() {
  if (!recoveryKey.value) return
  try {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(recoveryKey.value)
    } else if (!copyTextFallback(recoveryKey.value)) {
      throw new Error('copy failed')
    }
    toast.success('已复制')
  } catch {
    toast.error('复制失败，请手动选择文本复制')
  }
}

function openBottleCenter() {
  bottleVisible.value = true
  bottleState.value = 'init'
  newBottleContent.value = ''
  replyContent.value = ''
  replied.value = false
}

async function handleThrowBottle(content) {
  try {
    await throwBottle({ content: content || newBottleContent.value, authorAlias: userStore.alias, theme: publishComposer.form.skin || 'default' })
    toast.success('瓶子已随海浪飘向远方... (获得 5 ⚡)')
    appStore.addEnergy(5)
    bottleVisible.value = false
  } catch {}
}

async function handlePickBottle() {
  bottleState.value = 'picking'
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    const response = await pickBottle()
    if (response.data) {
      pickedBottle.value = response.data
      bottleState.value = 'picked'
    } else {
      toast.info('海面上空荡荡的')
      bottleState.value = 'init'
    }
  } catch {
    bottleState.value = 'init'
  }
}

async function handleReplyBottle(content) {
  const finalContent = content || replyContent.value
  if (!finalContent?.trim()) return
  try {
    await api.replyBottle(pickedBottle.value.id, finalContent, userStore.alias)
    toast.success('你的回信已顺着海流出发 ✨ (获得 5 ⚡)')
    appStore.addEnergy(5)
    bottleVisible.value = false
  } catch {}
}

async function handleReturnBottle() {
  try {
    await returnBottle(pickedBottle.value.id)
    toast.success('瓶子已重回大海的怀抱')
    bottleVisible.value = false
  } catch {}
}

async function handleDeleteMessage(message) {
  if (!message.isOwner && !getToken(MSG_TOKEN_KEY, message.id) && !isAdmin.value) {
    toast.warning('你没有删除权限')
    return
  }

  try {
    await confirmDialog({ title: '确认删除', message: '确定要删除这条树洞吗？', confirmText: '删除', cancelText: '取消', tone: 'danger' })
    if (isAdmin.value && !message.isOwner && !getToken(MSG_TOKEN_KEY, message.id)) {
      await api.adminDeleteMessage(message.id)
    } else {
      await api.deleteMessage(message.id)
    }
    toast.success('已删除')
    await feedController.fetchMessages(readIds)
  } catch {}
}

async function handleDeleteComment({ message, comment }) {
  if (!comment.isOwner && !getToken(CMT_TOKEN_KEY, comment.id) && !isAdmin.value) {
    toast.warning('你没有删除权限')
    return
  }

  try {
    await confirmDialog({ title: '确认删除', message: '确定要删除这条评论吗？', confirmText: '删除', cancelText: '取消', tone: 'danger' })
    if (isAdmin.value && !comment.isOwner && !getToken(CMT_TOKEN_KEY, comment.id)) {
      await api.adminDeleteComment(comment.id)
    } else {
      await api.deleteComment(comment.id)
    }
    toast.success('评论已删除')
    const response = await api.getComments(message.id)
    message._comments = response.data || []
    message.commentCount = Math.max(0, message.commentCount - 1)
  } catch {}
}

async function handleAdminLogin() {
  const password = adminPassword.value.trim()
  if (!password) return
  try {
    const response = await api.adminLogin(password)
    if (response.data) {
      isAdmin.value = true
      localStorage.setItem('treehole_admin_token', response.data)
      adminLoginVisible.value = false
      toast.success({ message: '👑 ACCESS GRANTED.', duration: 3000 })
      fetchBlacklist()
    }
  } catch {
    adminPassword.value = ''
    await nextTick()
    adminPwdInputRef.value?.focus()
  }
}

async function fetchBlacklist() {
  try {
    blacklist.value = (await api.getBlacklist()).data || []
  } catch {}
}

async function handleUnban(ip) {
  try {
    await api.unbanIP(ip)
    toast.success('IP 已解封')
    fetchBlacklist()
  } catch {}
}

async function handleChangePassword() {
  const oldPassword = (pwdForm.oldPassword || '').trim()
  const newPassword = (pwdForm.newPassword || '').trim()
  if (!oldPassword || !newPassword) return
  try {
    await api.resetAdminPassword(oldPassword, newPassword)
    toast.success('密码修改成功')
    exitAdmin()
  } catch {}
}

function exitAdmin() {
  isAdmin.value = false
  localStorage.removeItem('treehole_admin_token')
  showBlacklistModal.value = false
  showPasswordModal.value = false
  toast.info('管理员模式已退出')
}

async function handleBanIP(ip) {
  try {
    const { value } = await promptDialog({
      title: '封禁操作',
      message: '请输入封禁理由',
      confirmText: '确定封禁',
      cancelText: '取消',
      placeholder: '违反社区守则',
      tone: 'danger'
    })
    await api.banIP(ip, value || '违反社区守则')
    toast.success('已封禁该 IP')
    fetchBlacklist()
  } catch {}
}

function showWatcherMessage(data) {
  toast.info({ title: '树洞守望者 🛰️', message: data, duration: 10000 })
}

const { connect: connectWS, disconnect: disconnectWS } = useWebSocket({
  onNewMessage: feedController.applyNewMessage,
  onNewComment: feedController.applyNewComment,
  onObserverMessage: showWatcherMessage,
  onReactionUpdate: feedController.applyReactionUpdate
})

function openOfflineBox() {
  offlineList.value = offlineQueue.get()
  offlineDialogVisible.value = true
}

function editOfflineItem(item) {
  publishComposer.form.content = item.content || ''
  uiStore.setMessageSkin(normalizeMessageSkin(item.theme || item.skin, uiStore.colorMode))
  publishComposer.form.mood = item.mood || '0'
  publishComposer.form.authorAlias = item.authorAlias || userStore.alias
  removeOfflineItem(item.id)
  toast.success('已载入编辑区，修改后可再次发送')
}

function removeOfflineItem(id) {
  offlineQueue.remove(id)
  offlineList.value = offlineQueue.get()
  if (offlineList.value.length === 0) offlineDialogVisible.value = false
}

async function syncOfflineQueue() {
  await offlineQueue.sync(api)
  offlineList.value = offlineQueue.get()
  if (offlineList.value.length === 0) offlineDialogVisible.value = false
}

onMounted(() => {
  offlineQueue.init()
  checkMobile()
  window.addEventListener('resize', checkMobile)
  userStore.init()
  publishComposer.syncAlias()
  connectWS(userStore.userId)
  setTimeout(async () => {
    await feedController.fetchMessages(readIds)
    await feedController.fetchTrending()
  }, 300)
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  disconnectWS()
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style>
.msg-list-enter-active, .msg-list-leave-active { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.msg-list-enter-from { opacity: 0; transform: translateY(30px); filter: blur(10px); }
.msg-list-leave-to { opacity: 0; transform: scale(0.95); }
.msg-list-move { transition: transform 0.5s ease; }
</style>
