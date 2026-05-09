<template>
  <g 
    class="zen-stone-group cursor-pointer"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false; isClicked = false"
    @click="isClicked = !isClicked"
  >
    <!-- 1. 外层光晕 (Ambient Glow) - 呼吸动画 -->
    <circle 
      :cx="stone.x" 
      :cy="stone.y" 
      :r="stone.size * 2.2" 
      :fill="stone.color"
      class="animate-pulse-slow"
      :style="{ opacity: isHovered ? 0.25 : 0.08 }"
    />

    <!-- 2. 点击涟漪 (Click Ripple) -->
    <circle 
      v-if="isClicked"
      :cx="stone.x" :cy="stone.y"
      :r="stone.size * 1.2"
      fill="none"
      :stroke="stone.lightColor"
      stroke-width="1.5"
      class="animate-click-ripple"
    />
    <circle 
      v-if="isClicked"
      :cx="stone.x" :cy="stone.y"
      :r="stone.size * 1.2"
      fill="none"
      :stroke="stone.lightColor"
      stroke-width="1"
      class="animate-click-ripple"
      style="animation-delay: 0.2s"
    />

    <!-- 3. 石头主体：双层渲染（底层阴影 + 上层高光） -->
    <!-- 3a. 底层暗影 -->
    <path 
      :d="stonePath"
      :fill="stone.color"
      class="opacity-40 blur-[2px] pointer-events-none"
      :transform="`translate(2, 3)`"
    />
    <!-- 3b. 主体 -->
    <path 
      :d="stonePath"
      :fill="`url(#grad-${stone.id})`"
      class="pointer-events-none transition-all duration-500"
      :style="{ 
        filter: isHovered ? `drop-shadow(0 0 12px ${stone.color})` : 'drop-shadow(0 0 4px rgba(255,255,255,0.1))',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        transformOrigin: `${stone.x}px ${stone.y}px`
      }"
    />
    <!-- 3c. 高光反射 -->
    <ellipse
      :cx="stone.x - stone.size * 0.2"
      :cy="stone.y - stone.size * 0.25"
      :rx="stone.size * 0.35"
      :ry="stone.size * 0.2"
      fill="white"
      class="opacity-20 pointer-events-none"
      :style="{
        transform: isHovered ? 'scale(1.2)' : 'scale(1)',
        transformOrigin: `${stone.x}px ${stone.y}px`,
        transition: 'all 0.5s ease'
      }"
    />

    <!-- 4. 情绪标识 Emoji（石头表面） -->
    <text 
      v-if="stone.moodEmoji"
      :x="stone.x" 
      :y="stone.y + 2" 
      text-anchor="middle" 
      dominant-baseline="central"
      class="pointer-events-none select-none"
      :style="{ fontSize: (stone.size * 0.6) + 'px' }"
    >
      {{ stone.moodEmoji }}
    </text>

    <!-- 5. 悬浮时展示作者首字 (Author Initial) -->
    <text 
      v-if="!stone.moodEmoji"
      :x="stone.x" 
      :y="stone.y + 1" 
      text-anchor="middle" 
      dominant-baseline="central"
      class="pointer-events-none select-none transition-opacity duration-300"
      :style="{ 
        fontSize: (stone.size * 0.55) + 'px',
        fill: 'white',
        opacity: isHovered ? 0.9 : 0.3,
        fontWeight: 700,
        letterSpacing: '0.05em'
      }"
    >
      {{ stone.authorAlias?.charAt(0) || '匿' }}
    </text>

    <!-- 6. 互动光点 (Interaction Fireflies) -->
    <g v-if="stone.interactions > 0">
      <circle 
        v-for="j in Math.min(stone.interactions, 6)" :key="'int-'+j"
        :cx="stone.x + Math.cos(j * 1.047) * (stone.size + 12)"
        :cy="stone.y + Math.sin(j * 1.047) * (stone.size + 12)"
        r="1.5"
        :fill="stone.lightColor"
        class="animate-firefly"
        :style="{ animationDelay: (j * 0.4) + 's' }"
      />
    </g>

    <!-- 7. 交互热区 (el-tooltip) -->
    <foreignObject 
      :x="stone.x - stone.size * 1.2" 
      :y="stone.y - stone.size * 1.2" 
      :width="stone.size * 2.4" 
      :height="stone.size * 2.4"
      class="overflow-visible"
    >
      <UiTooltip>
        <template #content>
          <div class="flex flex-col gap-3 min-w-[140px] max-w-[300px] p-3">
            <!-- 作者信息 -->
            <div class="flex items-center gap-2 pb-2 border-b border-white/10">
              <div 
                class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                :style="{ background: stone.color, color: 'white' }"
              >
                {{ stone.authorAlias?.charAt(0) || '匿' }}
              </div>
              <span class="text-[11px] text-white/60 font-medium">{{ stone.authorAlias }}</span>
              <span v-if="stone.moodEmoji" class="text-sm">{{ stone.moodEmoji }}</span>
            </div>
            
            <!-- 留言正文 -->
            <div class="text-[13px] text-white/90 leading-relaxed tracking-wide italic">
              {{ formatMainContent(stone.content) }}
            </div>
            
            <!-- 标签区 -->
            <div v-if="hasTags(stone.content)" class="flex flex-wrap gap-2 pt-2 border-t border-white/5">
              <span 
                v-for="tag in extractTags(stone.content)" 
                :key="tag"
                class="px-2.5 py-1 rounded-lg text-[10px] text-white/50 font-medium border border-white/10"
                :style="{ background: stone.color + '20' }"
              >
                # {{ tag }}
              </span>
            </div>

            <!-- 互动统计 -->
            <div v-if="stone.interactions > 0" class="flex items-center gap-1 pt-1 text-[10px] text-white/30">
              <span>✨</span>
              <span>{{ stone.interactions }} 次互动</span>
            </div>
          </div>
        </template>

        <!-- 透明触发层 -->
        <div class="w-full h-full rounded-full cursor-help"></div>
      </UiTooltip>
    </foreignObject>
  </g>
</template>

<script setup>
import { ref, computed } from 'vue'
import UiTooltip from '@/components/ui/Tooltip.vue'

const props = defineProps({
  stone: {
    type: Object,
    required: true
  }
})

const isHovered = ref(false)
const isClicked = ref(false)

// --- 文本处理逻辑 ---
const formatMainContent = (text) => {
  if (!text) return ''
  return text.split('#')[0].trim()
}

const hasTags = (text) => {
  return text && text.includes('#')
}

const extractTags = (text) => {
  if (!text || !text.includes('#')) return []
  const parts = text.split('#')
  return parts.slice(1).map(t => t.trim()).filter(t => t.length > 0)
}

// 算法逻辑：中点平滑鹅卵石（增加段数使边缘更流畅）
const stonePath = computed(() => {
  const { x, y, size, seed } = props.stone
  const segments = 8
  const points = []
  
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const jitter = 0.88 + Math.abs(Math.sin(seed + i * 2.1)) * 0.24
    points.push({
      x: x + Math.cos(angle) * size * jitter,
      y: y + Math.sin(angle) * size * jitter
    })
  }

  let d = `M ${(points[0].x + points[segments-1].x)/2} ${(points[0].y + points[segments-1].y)/2}`
  for (let i = 0; i < segments; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % segments]
    const midX = (p1.x + p2.x) / 2
    const midY = (p1.y + p2.y) / 2
    d += ` Q ${p1.x} ${p1.y} ${midX} ${midY}`
  }
  return d + ' Z'
})
</script>

<style scoped>
@keyframes pulse-slow {
  0%, 100% { transform: scale(1); opacity: 0.08; }
  50% { transform: scale(1.08); opacity: 0.2; }
}

.animate-pulse-slow {
  animation: pulse-slow 5s infinite ease-in-out;
  transform-origin: center;
}

@keyframes click-ripple {
  0% { r: 10; opacity: 0.6; }
  100% { r: 80; opacity: 0; }
}

.animate-click-ripple {
  animation: click-ripple 1s ease-out forwards;
  transform-origin: center;
}

@keyframes firefly {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 0.8; transform: scale(1.3); }
}

.animate-firefly {
  animation: firefly 2.5s infinite ease-in-out;
  transform-origin: center;
}
</style>
