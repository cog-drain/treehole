<script setup lang="ts">
import { computed } from 'vue'
import ConfessionPanel from './ConfessionPanel.vue'
import MessageActionBar from './message/MessageActionBar.vue'
import MessageBody from './message/MessageBody.vue'
import MessageComments from './message/MessageComments.vue'
import MessageHeader from './message/MessageHeader.vue'
import { TONE_MODES } from '@/constants/toneModes'
import type { FeedMessage, Id } from '@/types'

const props = withDefaults(
    defineProps<{
        msg: FeedMessage
        liked?: boolean
        isAdmin?: boolean
        highlightedMessageId?: Id | null
        highlightedCommentId?: Id | null
    }>(),
    {
        liked: false,
        isAdmin: false,
        highlightedMessageId: null,
        highlightedCommentId: null
    }
)

const _emit = defineEmits([
    'like',
    'toggle-comments',
    'delete',
    'delete-comment',
    'publish-comment',
    'set-reply-target',
    'clear-reply',
    'update-comment-text',
    'tag-click',
    'admin-ban',
    'react',
    'witness'
])

// --- Resonance State ---
const isResonant = computed(() => props.msg.coFrequency && !props.msg.isOwner)

// --- Local UI State ---
const toneMap = TONE_MODES
const toneInfo = computed(() => {
    const mood = props.msg.mood
    return mood && mood in toneMap ? toneMap[mood as keyof typeof toneMap] : null
})
const isConfession = computed(() => props.msg.messageType === 'confession')
const isNotificationHighlighted = computed(() => String(props.highlightedMessageId || '') === String(props.msg.id))
</script>

<template>
    <div
        :id="'msg-' + msg.id"
        class="glass-card p-5 sm:p-8 group/card overflow-hidden relative transition-all duration-700"
        :class="[
            'theme-' + (msg.theme || 'default'),
            isConfession ? 'confession-card' : '',
            isNotificationHighlighted ? 'notification-highlight' : '',
            isResonant ? 'shadow-[0_0_50px_rgba(139,92,246,0.2)] border-purple-500/30 scale-[1.01]' : '',
            msg.isOwner && msg.camoEffect ? 'camo-effect' : ''
        ]"
    >
        <div
            v-if="msg.isOwner"
            class="owner-indicator-line absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-60"
        ></div>

        <MessageHeader
            :msg="msg"
            :is-admin="isAdmin"
            :is-confession="isConfession"
            :is-resonant="isResonant"
            :tone-info="toneInfo"
            @delete="$emit('delete', $event)"
            @admin-ban="$emit('admin-ban', $event)"
        />

        <MessageBody :msg="msg" :tone-info="toneInfo" @tag-click="$emit('tag-click', $event)" />

        <ConfessionPanel v-if="isConfession" :msg="msg" @witness="$emit('witness')" />

        <MessageActionBar
            v-if="!isConfession"
            :msg="msg"
            :liked="liked"
            @like="$emit('like', $event)"
            @toggle-comments="$emit('toggle-comments', $event)"
            @react="$emit('react')"
        />

        <MessageComments
            v-if="!isConfession && msg._showComments"
            :msg="msg"
            :is-admin="isAdmin"
            :highlighted-comment-id="highlightedCommentId"
            @delete-comment="$emit('delete-comment', $event)"
            @publish-comment="$emit('publish-comment', $event)"
            @set-reply-target="$emit('set-reply-target', $event)"
            @clear-reply="$emit('clear-reply', $event)"
            @update-comment-text="$emit('update-comment-text', $event)"
            @react="$emit('react')"
        />
    </div>
</template>

<style scoped>
.confession-card {
    border-color: rgba(201, 149, 42, 0.4) !important;
    background:
        radial-gradient(circle at 82% 18%, rgba(245, 158, 11, 0.16), transparent 34%),
        linear-gradient(135deg, rgba(255, 251, 235, 0.88), rgba(255, 255, 255, 0.72)) !important;
    box-shadow:
        0 24px 60px -24px rgba(180, 83, 9, 0.35),
        inset 0 1px 0 rgba(255, 236, 179, 0.65) !important;
}

/* Camo Effect */
.camo-effect {
    position: relative;
    opacity: 0.85;
    filter: saturate(0.5) contrast(1.3) brightness(1.1);
    animation: thermoptic-camo 8s infinite;
}

.camo-effect::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
        transparent,
        transparent 2px,
        rgba(99, 102, 241, 0.1) 3px,
        rgba(99, 102, 241, 0.15) 4px
    );
    pointer-events: none;
    z-index: 10;
    opacity: 0.7;
    animation: scanline-shift 10s linear infinite;
}

.camo-effect::after {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(
        45deg,
        transparent 40%,
        rgba(56, 189, 248, 0.4) 47%,
        rgba(255, 255, 255, 0.9) 50%,
        rgba(168, 85, 247, 0.4) 53%,
        transparent 60%
    );
    background-size: 200% 200%;
    z-index: 20;
    pointer-events: none;
    mix-blend-mode: hard-light;
    animation: camo-glare 6s infinite ease-in-out;
}

@keyframes thermoptic-camo {
    0% {
        opacity: 0.85;
        filter: blur(0px) hue-rotate(0deg);
        transform: skewX(0deg);
    }
    94% {
        opacity: 0.85;
        filter: blur(0px) hue-rotate(0deg);
        transform: skewX(0deg);
    }
    95% {
        opacity: 0.4;
        filter: blur(2px) hue-rotate(90deg);
        transform: skewX(2deg) translateX(2px);
    }
    96% {
        opacity: 0.9;
        filter: blur(0px) hue-rotate(-90deg);
        transform: skewX(-2deg) translateX(-2px);
    }
    97% {
        opacity: 0.85;
        filter: blur(0px) hue-rotate(0deg);
        transform: skewX(0deg);
    }
    100% {
        opacity: 0.85;
        filter: blur(0px) hue-rotate(0deg);
        transform: skewX(0deg);
    }
}

@keyframes scanline-shift {
    0% {
        background-position: 0 0;
    }
    100% {
        background-position: 0 100px;
    }
}

@keyframes camo-glare {
    0% {
        background-position: 200% 200%;
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    20% {
        background-position: -50% -50%;
        opacity: 0;
    }
    100% {
        background-position: -50% -50%;
        opacity: 0;
    }
}
</style>
