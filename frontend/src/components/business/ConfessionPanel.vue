<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
    msg: {
        type: Object,
        required: true
    }
})
const emit = defineEmits(['witness'])

const CONFESSION_TTL_MS = 24 * 60 * 60 * 1000
const now = ref(Date.now())
let countdownTimer = null

const witnessCount = computed(() => Number(props.msg.witnessCount || 0))
const expiresAtMs = computed(() => resolveEpochMs(props.msg.expiresAtEpochMs, props.msg.expiresAt))
const createTimeMs = computed(
    () => resolveEpochMs(props.msg.createTimeEpochMs, props.msg.createTime) || Math.max(0, expiresAtMs.value - CONFESSION_TTL_MS)
)
const remainingMs = computed(() => Math.max(0, expiresAtMs.value - now.value))
const remainingLabel = computed(() => {
    if (!expiresAtMs.value) return ''
    const totalMinutes = Math.ceil(remainingMs.value / 60000)
    if (totalMinutes <= 0) return '即将消失'
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours <= 0) return `${minutes}分钟后消失`
    return `${hours}小时${minutes.toString().padStart(2, '0')}分后消失`
})
const candleBurnPercent = computed(() => {
    if (!expiresAtMs.value) return 0
    const total = Math.max(1, expiresAtMs.value - createTimeMs.value)
    return Math.min(100, Math.max(0, ((now.value - createTimeMs.value) / total) * 100))
})

function resolveEpochMs(epochMs, fallbackTime) {
    const value = Number(epochMs)
    if (Number.isFinite(value) && value > 0) return value
    if (!fallbackTime) return 0
    const fallback = new Date(fallbackTime).getTime()
    return Number.isFinite(fallback) ? fallback : 0
}

function witnessConfession() {
    if (props.msg.witnessedByMe) return
    emit('witness', props.msg.id)
}

onMounted(() => {
    countdownTimer = window.setInterval(() => {
        now.value = Date.now()
    }, 60000)
})

onUnmounted(() => {
    if (countdownTimer) window.clearInterval(countdownTimer)
})
</script>

<template>
    <div class="confessor-panel">
        <div class="confessor-label">CYBER CONFESSOR</div>
        <p>{{ msg.confessorReply || '神父仍在烛光后聆听。' }}</p>
    </div>

    <div class="confession-candle" :title="remainingLabel">
        <div class="candle-flame"></div>
        <div class="candle-body">
            <div class="candle-burn" :style="{ height: candleBurnPercent + '%' }"></div>
        </div>
        <span>{{ remainingLabel }}</span>
    </div>

    <div class="action-bar confession-action-bar">
        <button class="witness-btn" :class="{ 'is-witnessed': msg.witnessedByMe }" @click.stop="witnessConfession">
            <span class="text-base">🕯️</span>
            <span>{{ msg.witnessedByMe ? '已见证' : '见证' }}</span>
            <span class="witness-count">{{ witnessCount }}</span>
        </button>
    </div>
</template>

<style scoped>
.confessor-panel {
    margin-top: 22px;
    padding: 16px 18px;
    border-radius: 18px;
    border: 1px solid rgba(201, 149, 42, 0.24);
    background: rgba(255, 248, 222, 0.62);
    color: #78350f;
}

.confessor-label {
    margin-bottom: 8px;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.18em;
    color: #b45309;
}

.confessor-panel p {
    margin: 0;
    font-size: 14px;
    line-height: 1.75;
}

.confession-candle {
    position: absolute;
    right: 24px;
    bottom: 72px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: #b45309;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.08em;
    pointer-events: none;
}

.candle-flame {
    width: 10px;
    height: 14px;
    border-radius: 50% 50% 45% 45%;
    background: radial-gradient(circle at 50% 70%, #fff7ad 0 22%, #f59e0b 45%, #ef4444 100%);
    filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.7));
    animation: candle-flicker 1.6s ease-in-out infinite alternate;
}

.candle-body {
    position: relative;
    width: 12px;
    height: 42px;
    overflow: hidden;
    border-radius: 5px 5px 3px 3px;
    background: linear-gradient(#fff7ed, #fde68a);
    border: 1px solid rgba(180, 83, 9, 0.2);
}

.candle-burn {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(120, 53, 15, 0.12);
}

@keyframes candle-flicker {
    from {
        transform: scale(0.92) rotate(-2deg);
        opacity: 0.85;
    }
    to {
        transform: scale(1.08) rotate(2deg);
        opacity: 1;
    }
}

.confession-action-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    gap: 8px;
}

.witness-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    padding: 0 16px;
    border-radius: 999px;
    border: 1px solid rgba(201, 149, 42, 0.28);
    background: rgba(255, 248, 222, 0.7);
    color: #92400e;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.12em;
    transition: all 0.2s;
}

.witness-btn:not(.is-witnessed):hover {
    transform: translateY(-1px);
    background: rgba(254, 243, 199, 0.95);
    box-shadow: 0 12px 28px -16px rgba(180, 83, 9, 0.6);
}

.witness-btn.is-witnessed {
    cursor: default;
    opacity: 0.72;
}

.witness-count {
    font-family: 'JetBrains Mono', monospace;
    color: #b45309;
}

@media (max-width: 640px) {
    .confession-candle {
        right: 18px;
        bottom: 78px;
    }
}
</style>
