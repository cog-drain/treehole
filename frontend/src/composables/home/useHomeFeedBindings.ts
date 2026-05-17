import type { Ref } from 'vue'
import { ACTIVITY_EVENTS, ACTIVITY_MODULES } from '@/constants/activityEvents'
import type { ActivityEvent, ActivityModule, Comment, FeedMessage, Id } from '@/types'

export interface HomeFeedBindingsOptions {
    messages: Ref<FeedMessage[]>
    witnessMessage: (message: FeedMessage) => void
    handleTagClick: (tagName: string) => void | Promise<void>
    trackActivity: (event: ActivityEvent, module?: ActivityModule) => void
}

export function useHomeFeedBindings({
    messages,
    witnessMessage,
    handleTagClick: clickTag,
    trackActivity
}: HomeFeedBindingsOptions) {
    function setReplyTarget({ msg, comment }: { msg: FeedMessage; comment: Comment }): void {
        msg._replyToId = comment.id
        msg._commentText = `@${comment.authorAlias} `
    }

    function clearReplyTarget(msg: FeedMessage): void {
        msg._replyToId = null
        msg._commentText = ''
    }

    function setCommentText({ msg, value }: { msg: FeedMessage; value: string }): void {
        msg._commentText = value
    }

    function handleWitness(msgId: Id): void {
        const msg = messages.value.find(message => message.id === msgId)
        if (msg) witnessMessage(msg)
        trackActivity(ACTIVITY_EVENTS.witnessConfession, ACTIVITY_MODULES.comments)
    }

    async function handleTagClick(tagName: string): Promise<void> {
        await clickTag(tagName)
        trackActivity(ACTIVITY_EVENTS.viewFeed, ACTIVITY_MODULES.feed)
    }

    return {
        setReplyTarget,
        clearReplyTarget,
        setCommentText,
        handleWitness,
        handleTagClick
    }
}
