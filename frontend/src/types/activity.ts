export type ActivityModule = 'feed' | 'graph' | 'shop' | 'comments' | 'unknown'

export type ActivityEvent =
    | 'view_feed'
    | 'view_graph'
    | 'open_shop'
    | 'open_comments'
    | 'like_message'
    | 'publish_comment'
    | 'react'
    | 'witness_confession'
