import request, { getUserIdentity } from './request'
import { messageApi } from './modules/message'
import { bottleApi } from './modules/bottle'
import { commentApi } from './modules/comment'
import { identityApi } from './modules/identity'
import { fileApi } from './modules/file'
import { statsApi } from './modules/stats'
import { aiApi } from './modules/ai'
import { graphApi } from './modules/graph'
import { notificationApi } from './modules/notification'
import { tagSubscriptionApi } from './modules/tagSubscription'
import {
    CMT_TOKEN_KEY,
    getToken,
    hasCmtToken,
    hasMsgToken,
    MSG_TOKEN_KEY,
    removeToken,
    saveToken
} from '@/utils/tokens'

// ── localStorage Token 管理工具 ──
export { CMT_TOKEN_KEY, getToken, hasCmtToken, hasMsgToken, MSG_TOKEN_KEY, removeToken, saveToken }

// ── 聚合所有模块的方法 (向下兼容) ──
const api = {
    ...request,
    getUserIdentity,
    getUserToken: () => getUserIdentity().userId,

    // Message 模块
    publishMessage: messageApi.publishMessage,
    getMessages: (pageNum = 1, pageSize = 10) => messageApi.getMessages({ pageNum, pageSize }),
    getMessagesByTag: (tag: string, pageNum = 1, pageSize = 10) => messageApi.getMessages({ tag, pageNum, pageSize }),
    getMessageById: messageApi.getMessage,
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
    getOnlineStats: statsApi.getOnlineStats,
    getActivityStats: statsApi.getActivityStats,

    // AI / Graph 模块
    chatWithAI: aiApi.chat,
    getGraphData: graphApi.getGraphData,

    // Notification 模块
    getNotifications: notificationApi.getNotifications,
    getUnreadCount: notificationApi.getUnreadCount,
    markNotificationRead: notificationApi.markNotificationRead,
    markAllNotificationsRead: notificationApi.markAllNotificationsRead,

    // Tag Subscription 模块
    getTagSubscriptions: tagSubscriptionApi.getSubscriptions,
    subscribeTag: tagSubscriptionApi.subscribe,
    unsubscribeTag: tagSubscriptionApi.unsubscribe
}

export default api

// ── 导出具名函数供解构使用 ──
export const {
    publishMessage,
    getMessages,
    getMessagesByTag,
    getMessageById,
    likeMessage,
    deleteMessage,
    getRandomMessage,
    getTrendingTags,
    reactToMessage,
    witnessMessage,
    getComments,
    publishComment,
    deleteComment,
    reactToComment,
    throwBottle,
    pickBottle,
    replyBottle,
    returnBottle,
    getMyBottles,
    backupIdentity,
    restoreIdentity,
    adminLogin,
    resetAdminPassword,
    banIP,
    unbanIP,
    getBlacklist,
    adminDeleteMessage,
    adminDeleteComment,
    uploadFile,
    getOnlineStats,
    getActivityStats,
    chatWithAI,
    getGraphData,
    getNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    getTagSubscriptions,
    subscribeTag,
    unsubscribeTag
} = api

export { notificationApi }
export { tagSubscriptionApi }
