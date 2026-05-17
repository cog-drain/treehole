import { ElMessage, ElMessageBox } from 'element-plus'
import api, { CMT_TOKEN_KEY, getToken, MSG_TOKEN_KEY } from '@/api'
import { ACTIVITY_EVENTS, ACTIVITY_MODULES } from '@/constants/activityEvents'
import type { Comment, FeedMessage, Id } from '@/types'

export function useCommentActions({
    likedIds,
    markAsRead,
    isAdmin,
    appStore,
    activity,
    fetchMessages
}: {
    likedIds: Set<Id>
    markAsRead: (id: Id) => void
    isAdmin: { value: boolean }
    appStore: { addEnergy: (amount: number) => void }
    activity: {
        setModule: (module: string) => void
        track: (event: string, module?: string) => void
        resolveModule: () => string
    }
    fetchMessages: () => void
}) {
    async function likeMessage(msg: FeedMessage) {
        if (likedIds.has(msg.id)) {
            ElMessage.info('已经点过赞啦 ❤️')
            return
        }
        try {
            await api.likeMessage(msg.id)
            activity.track(ACTIVITY_EVENTS.likeMessage)
            likedIds.add(msg.id)
            msg.likes = (msg.likes || 0) + 1
            msg.likeCount = (msg.likeCount || 0) + 1
            ElMessage.success('产生共鸣 ✨ (获得 2 ⚡)')
            appStore.addEnergy(2)
        } catch {}
    }

    async function toggleComments(msg: FeedMessage) {
        msg._showComments = !msg._showComments
        if (msg._showComments) {
            activity.setModule(ACTIVITY_MODULES.comments)
            activity.track(ACTIVITY_EVENTS.openComments, ACTIVITY_MODULES.comments)
            msg._read = true
            markAsRead(msg.id)
            try {
                const res = await api.getComments(msg.id)
                msg._comments = res.data || []
                if (msg._comments.some(comment => comment.coFrequency)) msg.coFrequency = true
            } catch {}
        } else {
            activity.setModule(activity.resolveModule())
        }
    }

    async function publishComment(msg: FeedMessage) {
        if (!msg._commentText.trim() && !msg._commentImage) return
        msg._commenting = true
        try {
            await api.publishComment({
                messageId: msg.id,
                content: msg._commentText.trim(),
                imageUrl: msg._commentImage,
                parentId: msg._replyToId || null
            })
            const cmtRes = await api.getComments(msg.id)
            msg._comments = [...(cmtRes.data || [])]
            msg.commentCount = (msg.commentCount || 0) + 1
            msg._commentText = ''
            msg._commentImage = null
            msg._replyToId = null
            if (msg._comments.some(comment => comment.coFrequency)) msg.coFrequency = true
            activity.track(ACTIVITY_EVENTS.publishComment, ACTIVITY_MODULES.comments)
            ElMessage.success('评论已送达 ✨ (获得 5 ⚡)')
            appStore.addEnergy(5)
        } catch {
        } finally {
            msg._commenting = false
        }
    }

    async function deleteMessage(msg: FeedMessage) {
        if (!msg.isOwner && !getToken(MSG_TOKEN_KEY, msg.id) && !isAdmin.value) {
            ElMessage.warning('你没有删除权限')
            return
        }
        try {
            await ElMessageBox.confirm('确定要删除这条树洞吗？', '提示', { type: 'warning' })
            await api.deleteMessage(msg.id)
            ElMessage.success('已删除')
            fetchMessages()
        } catch {}
    }

    async function handleDeleteComment({
        msg,
        comment
    }: {
        msg: FeedMessage
        comment: Comment & { isOwner?: boolean }
    }) {
        if (!comment.isOwner && !getToken(CMT_TOKEN_KEY, comment.id) && !isAdmin.value) {
            ElMessage.warning('你没有删除权限')
            return
        }
        try {
            await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', { type: 'warning' })
            await api.deleteComment(comment.id)
            ElMessage.success('评论已删除')
            const res = await api.getComments(msg.id)
            msg._comments = res.data || []
            msg.commentCount = Math.max(0, msg.commentCount - 1)
        } catch {}
    }

    return {
        likeMessage,
        toggleComments,
        publishComment,
        deleteMessage,
        handleDeleteComment
    }
}
