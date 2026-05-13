import request, { getUserIdentity } from './request'
import { messageApi } from './modules/message'
import { bottleApi } from './modules/bottle'
import { commentApi } from './modules/comment'
import { identityApi } from './modules/identity'
import { fileApi } from './modules/file'
import { statsApi } from './modules/stats'

// ── localStorage Token 管理工具 ──
const MSG_TOKEN_KEY = 'treehole_msg_tokens'
const CMT_TOKEN_KEY = 'treehole_cmt_tokens'

function loadTokenMap(storageKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}')
  } catch { return {} }
}

export function saveToken(storageKey, id, token) {
  const map = loadTokenMap(storageKey)
  map[id] = token
  localStorage.setItem(storageKey, JSON.stringify(map))
}

export function getToken(storageKey, id) {
  return loadTokenMap(storageKey)[id] || null
}

export function removeToken(storageKey, id) {
  const map = loadTokenMap(storageKey)
  delete map[id]
  localStorage.setItem(storageKey, JSON.stringify(map))
}

export function hasMsgToken(id) { return !!getToken(MSG_TOKEN_KEY, id) }
export function hasCmtToken(id) { return !!getToken(CMT_TOKEN_KEY, id) }

export { MSG_TOKEN_KEY, CMT_TOKEN_KEY }

// ── 聚合所有模块的方法 (向下兼容) ──
const api = {
  ...request,
  getUserIdentity,
  getUserToken: () => getUserIdentity().userId,
  
  // Message 模块
  publishMessage: messageApi.publishMessage,
  getMessages: (pageNum = 1, pageSize = 10) => messageApi.getMessages({ pageNum, pageSize }),
  getMessagesByTag: (tag, pageNum = 1, pageSize = 10) => messageApi.getMessages({ tag, pageNum, pageSize }),
  likeMessage: messageApi.likeMessage,
  deleteMessage: messageApi.deleteMessage,
  getRandomMessage: messageApi.getRandom,
  getTrendingTags: messageApi.getTrendingTags,
  reactToMessage: messageApi.reactToMessage,
  witnessMessage: messageApi.witnessMessage,

  // Comment 模块
  getComments: commentApi.getComments,
  publishComment: commentApi.publishComment,
  deleteComment: commentApi.deleteComment,
  reactToComment: commentApi.reactToComment,

  // Bottle 模块
  throwBottle: bottleApi.throwBottle,
  pickBottle: bottleApi.pickBottle,
  replyBottle: bottleApi.replyBottle,
  returnBottle: bottleApi.returnBottle,
  getMyBottles: bottleApi.getMyBottles,

  // Identity 模块
  backupIdentity: identityApi.backup,
  restoreIdentity: identityApi.restore,
  adminLogin: identityApi.adminLogin,
  resetAdminPassword: identityApi.resetAdminPassword,
  banIP: identityApi.banIP,
  unbanIP: identityApi.unbanIP,
  getBlacklist: identityApi.getBlacklist,
  adminDeleteMessage: identityApi.adminDeleteMessage,
  adminDeleteComment: identityApi.adminDeleteComment,

  // File 模块
  uploadFile: fileApi.upload,

  // Stats 模块
  getOnlineStats: statsApi.getOnlineStats
}

export default api

// ── 导出具名函数供解构使用 ──
export const { 
  publishMessage, getMessages, getMessagesByTag, likeMessage, deleteMessage, 
  getRandomMessage, getTrendingTags, reactToMessage, witnessMessage,
  getComments, publishComment, deleteComment, reactToComment,
  throwBottle, pickBottle, replyBottle, returnBottle, getMyBottles,
  backupIdentity, restoreIdentity,
  adminLogin, resetAdminPassword, banIP, unbanIP, getBlacklist, adminDeleteMessage, adminDeleteComment,
  uploadFile, getOnlineStats
} = api
