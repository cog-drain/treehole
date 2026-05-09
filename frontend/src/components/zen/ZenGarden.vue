<template>
  <div class="relative w-full h-full bg-slate-950 overflow-hidden cursor-crosshair select-none">
    <!-- 1. 背景粒子系统 (Spirit Particles) -->
    <div class="absolute inset-0 pointer-events-none">
      <div 
        v-for="i in 20" :key="'p-'+i" 
        class="absolute w-1 h-1 rounded-full blur-[2px] opacity-0 animate-float-particle"
        :class="getParticleColorClass(i)"
        :style="getParticleAnimationStyle(i)"
      ></div>
    </div>

    <!-- 2. 主绘图区 (Garden Canvas) -->
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" class="w-full h-full">
      <!-- SVG Defs: 渐变色定义 -->
      <defs>
        <radialGradient v-for="stone in stones" :key="'grad-'+stone.id" :id="'grad-'+stone.id" cx="35%" cy="35%">
          <stop offset="0%" :stop-color="stone.lightColor" stop-opacity="0.9" />
          <stop offset="100%" :stop-color="stone.color" stop-opacity="0.6" />
        </radialGradient>
        <!-- 全局光晕滤镜 -->
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- 沙纹水波 -->
      <g class="sand-ripples">
        <path 
          v-for="i in 12" :key="'ripple-'+i"
          :d="generateRipplePath(i)"
          fill="none"
          stroke="currentColor"
          stroke-width="0.8"
          class="text-blue-400/[0.06] animate-drift"
          :style="{ animationDelay: (i * -1.8) + 's' }"
        />
      </g>

      <!-- 渲染每一颗灵魂原石 (子组件化) -->
      <ZenStone 
        v-for="stone in stones" 
        :key="stone.id" 
        :stone="stone" 
      />
    </svg>

    <!-- 3. 底部 UI 装饰 -->
    <div class="absolute bottom-12 left-0 right-0 flex flex-col items-center pointer-events-none">
      <p class="text-white/20 text-xl tracking-[1em] uppercase italic font-light">
        Silencing Echoes
      </p>
      <p class="text-white/10 mt-2 text-sm">
        Each stone is a memory, each ripple is a breath.
      </p>
    </div>

    <!-- 顶部状态栏 -->
    <div class="absolute top-10 left-0 right-0 text-center pointer-events-none">
      <p class="text-white/30 text-[10px] tracking-[0.5em] uppercase">
        Data Transmutation Field
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ZenStone from './ZenStone.vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

// 情绪色值定义（扩展色板）
const moodColors = {
  'HAPPY':   { main: '#fbbf24', light: '#fde68a' },
  'SAD':     { main: '#60a5fa', light: '#93c5fd' },
  'ANGRY':   { main: '#f87171', light: '#fca5a5' },
  'HEALING': { main: '#34d399', light: '#6ee7b7' },
  'NEUTRAL': null // 将在下方动态生成
}

// 为无情绪留言生成多彩渐变色（基于 ID 的 HSL 散列）
const generateColor = (seed) => {
  const hue = (seed * 137.508) % 360 // 黄金角散列，确保色彩分布均匀
  return {
    main: `hsl(${hue}, 45%, 55%)`,
    light: `hsl(${hue}, 55%, 72%)`
  }
}

// 基于阿基米德螺旋线的优雅布局算法
const stones = computed(() => {
  const count = Math.min(props.messages.length, 15)
  const cx = 500, cy = 500 // 画布中心
  
  return props.messages.slice(0, count).map((msg, idx) => {
    const seed = (msg.id || idx) * 10
    
    // 阿基米德螺旋：r = a + b * θ
    const theta = idx * 0.8 + 0.5
    const radius = 80 + idx * 40
    const x = cx + Math.cos(theta) * radius
    const y = cy + Math.sin(theta) * radius
    
    // 颜色映射
    const colors = moodColors[msg.mood] || generateColor(seed)
    
    // 情绪图标映射
    const moodEmoji = {
      'HAPPY': '😄', 'SAD': '😢', 'ANGRY': '😡',
      'HEALING': '🌿', 'NEUTRAL': ''
    }

    return {
      id: msg.id || idx,
      content: msg.content,
      authorAlias: msg.authorAlias || '匿名',
      mood: msg.mood || '',
      moodEmoji: moodEmoji[msg.mood] || '',
      x: Math.max(60, Math.min(940, x)),
      y: Math.max(60, Math.min(940, y)),
      size: 18 + Math.min(msg.content.length / 3, 30),
      color: colors.main,
      lightColor: colors.light,
      interactions: (msg.likes || 0) + (msg.commentCount || 0),
      seed: seed
    }
  })
})

const generateRipplePath = (i) => {
  const y = i * 85
  let path = `M -100 ${y} `
  for (let x = 0; x <= 1100; x += 80) {
    const dy = Math.sin(x / 120 + i * 0.7) * 15
    path += `C ${x + 30} ${y + dy + 15}, ${x + 50} ${y + dy - 15}, ${x + 80} ${y + dy} `
  }
  return path
}

const getParticleColorClass = (i) => {
  const colors = ['bg-amber-400', 'bg-blue-400', 'bg-emerald-400', 'bg-rose-400', 'bg-violet-400', 'bg-cyan-400']
  return colors[i % colors.length]
}

const getParticleAnimationStyle = (i) => {
  return {
    left: (Math.sin(i * 1.3) * 45 + 50) + '%',
    top: (Math.cos(i * 0.9) * 45 + 50) + '%',
    animationDelay: (i * 0.6) + 's',
    animationDuration: (10 + i * 1.5) + 's'
  }
}
</script>

<style scoped>
@keyframes float-particle {
  0% { transform: translateY(0) scale(0); opacity: 0; }
  15% { opacity: 0.5; }
  85% { opacity: 0.3; }
  100% { transform: translateY(-400px) scale(1.5); opacity: 0; }
}

.animate-float-particle {
  animation: float-particle 15s infinite linear;
}

@keyframes drift {
  from { transform: translateX(-40px); }
  to { transform: translateX(40px); }
}

.animate-drift {
  animation: drift 18s infinite alternate ease-in-out;
}
</style>
