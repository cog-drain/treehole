import type { Id, TreeholeNotification } from '@/types'

export interface NotificationTargetLocation {
  targetType: TreeholeNotification['targetType']
  messageId: Id | null
  commentId: Id | null
  parentCommentId: Id | null
  tagId: Id | null
  tagName: string | null
}

export function resolveNotificationTarget(notification: TreeholeNotification): NotificationTargetLocation {
  return {
    targetType: notification.targetType,
    messageId: notification.messageId ?? null,
    commentId: notification.commentId ?? null,
    parentCommentId: notification.parentCommentId ?? null,
    tagId: notification.tagId ?? null,
    tagName: notification.tagName ?? null
  }
}

export function canLocateNotificationTarget(target: NotificationTargetLocation): boolean {
  if (target.targetType === 'COMMENT') return target.messageId !== null && target.commentId !== null
  if (target.targetType === 'TAG') return Boolean(target.tagName)
  return target.messageId !== null
}

export function getMessageElementId(messageId: Id): string {
  return `msg-${messageId}`
}

export function getCommentElementId(commentId: Id): string {
  return `comment-${commentId}`
}
