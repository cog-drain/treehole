import type { FeedMessage, Id, Message } from '@/types'

interface FeedMessageStateOptions {
    readIds?: Set<Id>
    isOwner?: boolean
    isOptimistic?: boolean
}

export function createFeedMessageState(message: Message, options: FeedMessageStateOptions = {}): FeedMessage {
    return {
        ...message,
        isOwner: options.isOwner ?? message.isOwner,
        isOptimistic: options.isOptimistic ?? message.isOptimistic,
        _showComments: false,
        _comments: [],
        _commentText: '',
        _commentImage: null,
        _replyToId: null,
        _commenting: false,
        _read: Boolean(options.readIds?.has(message.id)),
        coFrequency: Boolean((message.commentCount || 0) > 5 || message.coFrequency)
    }
}
