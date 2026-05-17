<script setup>
defineProps({
    itemId: { type: String, required: true }
})
</script>

<template>
    <div class="item-preview" :class="itemId + '-preview'">
        <span v-if="itemId === 'lain_intro'" class="glitch-text">PRESENT DAY...</span>
        <div v-else-if="itemId === 'p5_effect'" class="p5-logo-preview">TAKE YOUR HEART</div>
        <div v-else-if="itemId === 'p5_all_out_attack'" class="p5-finish-preview">
            <span class="finish-text">FINISH</span>
            <div class="slash-line"></div>
        </div>
        <div v-else-if="itemId === 'alter_ego'" class="ae-terminal-preview">
            <div class="ae-monitor">
                <div class="ae-scanline"></div>
                <span class="ae-code">AE v1.0</span>
            </div>
        </div>
        <div v-else-if="itemId === 'camo_effect'" class="camo-preview">
            <div class="camo-ghost-box">GHOST</div>
            <div class="camo-glitch-overlay"></div>
        </div>
    </div>
</template>

<style scoped>
.lain_intro-preview {
    height: 80px;
    background: #000;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (min-width: 640px) {
    .lain_intro-preview {
        height: 120px;
    }
}

.glitch-text {
    color: #fff;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.2em;
}

.p5_effect-preview {
    height: 80px;
    background: #d32f2f;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    transform: rotate(-2deg);
    border: 3px solid #000;
    box-shadow: 4px 4px 0 #000;
}

@media (min-width: 640px) {
    .p5_effect-preview {
        height: 120px;
    }
}

.p5-logo-preview {
    color: #fff;
    font-size: 1.1rem;
    font-weight: 900;
    text-transform: uppercase;
    background: #000;
    padding: 4px 12px;
    transform: skewX(-15deg);
}

.p5_all_out_attack-preview {
    height: 80px;
    background: #000;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    overflow: hidden;
    position: relative;
    border: 2px solid #d32f2f;
}

@media (min-width: 640px) {
    .p5_all_out_attack-preview {
        height: 120px;
    }
}

.finish-text {
    color: #d32f2f;
    font-size: 2rem;
    font-weight: 900;
    font-style: italic;
    z-index: 2;
    text-shadow: 2px 2px 0 #fff;
}

.slash-line {
    position: absolute;
    width: 150%;
    height: 40px;
    background: #d32f2f;
    transform: rotate(-35deg);
    z-index: 1;
}

.alter_ego-preview {
    height: 80px;
    background: #050505;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    border: 2px solid #00ff41;
    box-shadow: inset 0 0 15px rgba(0, 255, 65, 0.3);
}

@media (min-width: 640px) {
    .alter_ego-preview {
        height: 120px;
    }
}

.ae-monitor {
    position: relative;
    width: 80%;
    height: 60%;
    border: 1px solid #00ff41;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 255, 65, 0.05);
}

.ae-scanline {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: rgba(0, 255, 65, 0.3);
    animation: scan 2s linear infinite;
}

@keyframes scan {
    from {
        top: 0;
    }
    to {
        top: 100%;
    }
}

.ae-code {
    color: #00ff41;
    font-family: monospace;
    font-size: 14px;
    text-shadow: 0 0 8px #00ff41;
}

.camo-preview {
    height: 80px;
    background: repeating-linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.05),
        rgba(255, 255, 255, 0.05) 10px,
        transparent 10px,
        transparent 20px
    );
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
    border: 1px dashed rgba(255, 255, 255, 0.3);
}

@media (min-width: 640px) {
    .camo-preview {
        height: 120px;
    }
}

.camo-ghost-box {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(4px);
    color: rgba(255, 255, 255, 0.8);
    font-weight: 900;
    letter-spacing: 0.2em;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    animation: camo-flicker 3s infinite;
}

.camo-glitch-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent 50%, rgba(255, 255, 255, 0.05) 50%);
    background-size: 100% 4px;
    opacity: 0.5;
    animation: scan 10s linear infinite;
    pointer-events: none;
}

@keyframes camo-flicker {
    0%,
    100% {
        opacity: 0.8;
        transform: scale(1);
        filter: blur(0);
    }
    45% {
        opacity: 0.8;
        transform: scale(1);
        filter: blur(0);
    }
    50% {
        opacity: 0.2;
        transform: scale(1.05) translateX(2px);
        filter: blur(2px);
    }
    55% {
        opacity: 0.8;
        transform: scale(1);
        filter: blur(0);
    }
}
</style>
