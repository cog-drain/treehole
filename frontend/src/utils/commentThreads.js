function toTimestamp(value) {
  const parsed = new Date(value || 0).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

function compareByTime(a, b) {
  const timeDiff = toTimestamp(a.createTime) - toTimestamp(b.createTime)
  if (timeDiff !== 0) return timeDiff
  return Number(a.id || 0) - Number(b.id || 0)
}

export function buildCommentThreads(comments = []) {
  const normalizedComments = comments.map(comment => ({ ...comment }))
  const byId = new Map(normalizedComments.map(comment => [comment.id, comment]))
  const rootIdCache = new Map()

  const resolveRootId = (comment) => {
    if (!comment?.id) return null
    if (rootIdCache.has(comment.id)) return rootIdCache.get(comment.id)

    const visited = new Set()
    let cursor = comment

    while (cursor?.parentId && byId.has(cursor.parentId) && !visited.has(cursor.parentId)) {
      visited.add(cursor.id)
      cursor = byId.get(cursor.parentId)
    }

    const rootId = cursor?.id ?? comment.id
    rootIdCache.set(comment.id, rootId)
    return rootId
  }

  const threads = new Map()

  normalizedComments.forEach((comment) => {
    const rootId = resolveRootId(comment)
    if (!threads.has(rootId)) {
      threads.set(rootId, {
        rootComment: null,
        replies: []
      })
    }

    const thread = threads.get(rootId)
    const parent = comment.parentId ? byId.get(comment.parentId) : null
    const commentWithReplyMeta = {
      ...comment,
      replyToAuthorAlias: parent?.authorAlias || ''
    }

    if (!comment.parentId || comment.id === rootId || !byId.has(comment.parentId)) {
      thread.rootComment = commentWithReplyMeta
      return
    }

    thread.replies.push(commentWithReplyMeta)
  })

  return Array.from(threads.values())
    .filter(thread => thread.rootComment)
    .map(thread => ({
      rootComment: thread.rootComment,
      replies: [...thread.replies].sort(compareByTime)
    }))
    .sort((a, b) => compareByTime(a.rootComment, b.rootComment))
}
