<template>
    <Transition name="fade-out">
        <div v-if="show" class="lain-intro-overlay">
            <div class="glitch-wrapper">
                <h1 class="lain-text" data-text="Present Day,">Present Day,</h1>
                <h1 class="lain-text second" data-text="Present Time...">Present Time...</h1>

                <!-- 装饰性元素 -->
                <div class="static-noise"></div>
                <div class="scanlines"></div>
            </div>

            <div class="audio-hint">
                <div class="hint-line"></div>
                <span class="protocol-text">PROTOCOL 7 : ACCESSING THE WIRED</span>
            </div>

            <!-- 随机出现的干扰文字 -->
            <div class="ghost-text" style="top: 20%; left: 15%">01.01.01</div>
            <div class="ghost-text" style="bottom: 30%; right: 10%">ERROR: REALITY_NOT_FOUND</div>
        </div>
    </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const show = ref(true)

onMounted(() => {
    // 保持 3 秒的震撼开场，随后优雅退场
    setTimeout(() => {
        show.value = false
    }, 3000)
})
</script>

<style scoped>
.lain-intro-overlay {
    position: fixed;
    inset: 0;
    background: #000;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    cursor: none;
}

.glitch-wrapper {
    position: relative;
    z-index: 2;
}

.lain-text {
    color: #fff;
    font-size: clamp(2rem, 8vw, 4rem);
    font-weight: 900;
    letter-spacing: 0.3em;
    position: relative;
    margin: 0;
    text-transform: uppercase;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.lain-text.second {
    font-size: clamp(1rem, 4vw, 2rem);
    color: rgba(255, 255, 255, 0.5);
    margin-top: 20px;
    letter-spacing: 0.5em;
}

/* 核心故障动效 */
.lain-text::before,
.lain-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: black;
}

.lain-text::before {
    left: 3px;
    text-shadow: -3px 0 #ff00c1;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim 3s infinite linear alternate-reverse;
}

.lain-text::after {
    left: -3px;
    text-shadow:
        -3px 0 #00fff9,
        3px 3px #ff00c1;
    animation: glitch-anim2 0.5s infinite linear alternate-reverse;
}

.static-noise {
    position: absolute;
    inset: -100%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.1;
    pointer-events: none;
    animation: grain 0.5s steps(1) infinite;
}

.scanlines {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.8) 51%);
    background-size: 100% 4px;
    pointer-events: none;
    opacity: 0.4;
    z-index: 3;
}

.audio-hint {
    position: absolute;
    bottom: 12%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.hint-line {
    width: 1px;
    height: 80px;
    background: linear-gradient(to top, #fff, transparent);
    animation: line-grow 1.5s ease-out forwards;
}

.protocol-text {
    color: rgba(255, 255, 255, 0.3);
    font-size: 10px;
    letter-spacing: 0.6em;
    font-weight: 300;
}

.ghost-text {
    position: absolute;
    color: rgba(255, 255, 255, 0.1);
    font-size: 12px;
    letter-spacing: 0.2em;
    user-select: none;
}

/* Animations */
@keyframes glitch-anim {
    0% {
        clip: rect(31px, 9999px, 94px, 0);
        transform: skew(0.85deg);
    }
    5% {
        clip: rect(70px, 9999px, 71px, 0);
        transform: skew(0.2deg);
    }
    10% {
        clip: rect(24px, 9999px, 48px, 0);
        transform: skew(0.5deg);
    }
    15% {
        clip: rect(80px, 9999px, 10px, 0);
        transform: skew(0.1deg);
    }
    100% {
        clip: rect(67px, 9999px, 81px, 0);
        transform: skew(0.1deg);
    }
}

@keyframes glitch-anim2 {
    0% {
        clip: rect(44px, 9999px, 56px, 0);
        transform: skew(0.3deg);
    }
    50% {
        clip: rect(12px, 9999px, 90px, 0);
        transform: skew(0.8deg);
    }
    100% {
        clip: rect(50px, 9999px, 30px, 0);
        transform: skew(0.2deg);
    }
}

@keyframes grain {
    0%,
    100% {
        transform: translate(0, 0);
    }
    10% {
        transform: translate(-5%, -10%);
    }
    20% {
        transform: translate(-15%, 5%);
    }
    30% {
        transform: translate(7%, -25%);
    }
    /* ... simplified ... */
}

@keyframes line-grow {
    from {
        height: 0;
        opacity: 0;
    }
    to {
        height: 80px;
        opacity: 1;
    }
}

.fade-out-leave-active {
    transition: all 1s cubic-bezier(0.7, 0, 0.3, 1);
    filter: blur(40px) brightness(2);
    transform: scale(1.2);
    opacity: 0;
}
</style>
