import type { ActivityEvent, ActivityModule } from '@/types'

export const ACTIVITY_MODULES = {
    feed: 'feed',
    graph: 'graph',
    shop: 'shop',
    comments: 'comments',
    unknown: 'unknown'
} as const satisfies Record<string, ActivityModule>

export const ACTIVITY_EVENTS = {
    viewFeed: 'view_feed',
    viewGraph: 'view_graph',
    openShop: 'open_shop',
    openComments: 'open_comments',
    likeMessage: 'like_message',
    publishComment: 'publish_comment',
    react: 'react',
    witnessConfession: 'witness_confession'
} as const satisfies Record<string, ActivityEvent>
