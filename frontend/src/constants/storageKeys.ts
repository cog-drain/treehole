export const STORAGE_KEYS = {
    identity: 'treehole_identity',
    alias: 'treehole_alias',
    likes: 'treehole_likes',
    readMessages: 'read_message_ids',
    adminToken: 'treehole_admin_token',
    messageTokens: 'treehole_msg_tokens',
    commentTokens: 'treehole_cmt_tokens',
    offlineMessages: 'treehole_offline_messages',
    energy: 'treehole_energy',
    ownedItems: 'treehole_owned_items',
    lainEnabled: 'treehole_lain_enabled',
    p5Enabled: 'treehole_p5_enabled',
    p5AoaEnabled: 'treehole_p5_aoa_enabled',
    alterEgoEnabled: 'treehole_alter_ego_enabled',
    camoEnabled: 'treehole_camo_enabled'
} as const

export const messageReactionKey = (messageId: string | number) => `treehole_msg_reacted_${messageId}`
export const commentReactionKey = (commentId: string | number) => `treehole_cmt_reacted_${commentId}`
export const earnCooldownKey = (type: string) => `treehole_last_${type}`
