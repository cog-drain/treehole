<template>
    <div class="p5-aoa-overlay">
        <!-- 动态斜杠背景 -->
        <div class="aoa-bg">
            <div v-for="i in 5" :key="i" class="aoa-slash" :style="`--delay: ${i * 0.1}s; --top: ${i * 20}%`"></div>
        </div>

        <!-- 角色剪影 -->
        <div class="aoa-silhouette">
            <div class="phantom-pose"></div>
        </div>

        <!-- 喷溅粒子 -->
        <div class="aoa-splashes">
            <div v-for="i in 8" :key="i" class="splash" :style="splashStyle(i)"></div>
        </div>

        <!-- 核心大字 -->
        <div class="aoa-text-box">
            <div class="aoa-main-text">THE HEART HAS BEEN TAKEN!</div>
            <div class="aoa-sub-text">RESONANCE ACCOMPLISHED</div>
        </div>
    </div>
</template>

<script setup>
const splashStyle = i => {
    const angle = (i / 8) * 360
    const dist = 300 + Math.random() * 200
    return {
        '--tx': `${Math.cos(angle) * dist}px`,
        '--ty': `${Math.sin(angle) * dist}px`,
        '--delay': `${0.4 + i * 0.05}s`
    }
}
</script>

<style scoped>
.p5-aoa-overlay {
    position: fixed;
    inset: 0;
    z-index: 200000;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

/* 红色斜杠背景 */
.aoa-bg {
    position: absolute;
    inset: -50%;
    transform: rotate(-15deg);
}

.aoa-slash {
    position: absolute;
    left: -100%;
    width: 300%;
    height: 15vh;
    background: #d32f2f;
    top: var(--top);
    animation: slashIn 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards;
    animation-delay: var(--delay);
    box-shadow: 0 0 100px rgba(0, 0, 0, 0.8);
}

@keyframes slashIn {
    from {
        transform: translateX(-100%) skewX(-20deg);
    }
    to {
        transform: translateX(0) skewX(-20deg);
    }
}

/* 角色剪影 */
.phantom-pose {
    position: absolute;
    right: 10%;
    bottom: -50px;
    width: 40vw;
    height: 80vh;
    background: black;
    clip-path: polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%);
    animation: poseSlide 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards;
    animation-delay: 0.3s;
    opacity: 0;
}

@keyframes poseSlide {
    from {
        transform: translateX(100%) scaleX(0.5);
        opacity: 0;
    }
    to {
        transform: translateX(0) scaleX(1);
        opacity: 1;
    }
}

/* 核心文字 */
.aoa-text-box {
    position: relative;
    z-index: 100;
    text-align: center;
    transform: rotate(-5deg);
}

.aoa-main-text {
    background: white;
    color: black;
    font-size: 5rem;
    font-weight: 900;
    padding: 10px 40px;
    display: inline-block;
    border: 8px solid black;
    box-shadow: 20px 20px 0 black;
    animation: textPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    animation-delay: 0.5s;
    opacity: 0;
    text-transform: uppercase;
    font-family: 'Arial Black', sans-serif;
}

.aoa-sub-text {
    margin-top: 30px;
    background: black;
    color: white;
    font-size: 1.5rem;
    padding: 5px 20px;
    letter-spacing: 10px;
    animation: fadeIn 0.5s ease forwards;
    animation-delay: 0.8s;
    opacity: 0;
}

@keyframes textPop {
    from {
        transform: scale(0.5);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes fadeIn {
    to {
        opacity: 1;
    }
}

/* 红色喷溅 */
.splash {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    background: #d32f2f;
    clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
    animation: splashMove 0.6s ease-out forwards;
    animation-delay: var(--delay);
    opacity: 0;
}

@keyframes splashMove {
    from {
        transform: translate(-50%, -50%) scale(0);
        opacity: 1;
    }
    to {
        transform: translate(var(--tx), var(--ty)) scale(2) rotate(45deg);
        opacity: 0;
    }
}
</style>
