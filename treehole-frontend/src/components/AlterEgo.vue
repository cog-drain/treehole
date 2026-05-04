<template>
  <div 
    class="alter-ego-container" 
    v-if="visible" 
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
  >
    <div class="ae-window glass-card">
      <div class="ae-header" @mousedown="startDrag">
        <div class="ae-dots">
          <span></span><span></span><span></span>
        </div>
        <div class="ae-title">ALTER EGO v1.0 [DRAGGABLE]</div>
        <div class="ae-close-btn" @click.stop="$emit('close')">CLOSE [X]</div>
      </div>
      
      <div class="ae-body" @click="generateQuote">
        <div class="ae-avatar">
          <div class="pixel-avatar"></div>
          <div class="ae-status-light" :class="sentimentClass"></div>
        </div>
        
        <div class="ae-content">
          <div class="ae-terminal-text">
            <span class="prompt">></span> {{ currentMessage }}
            <span class="cursor">_</span>
          </div>
          
          <div class="hope-meter-container">
            <div class="meter-label">HOPE INDEX: {{ hopeScore.toFixed(1) }}%</div>
            <div class="meter-track">
              <div class="meter-bar" :style="{ width: hopeScore + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import api from '@/api'

const props = defineProps({
  visible: Boolean,
  lastMessage: Object
})

const emit = defineEmits(['close'])

const hopeScore = ref(75)
const currentMessage = ref("Neural Link Established. System Normal. [Click for AI Analysis]")
const isAnalysing = ref(false)

// 拖拽逻辑
const position = ref({ x: 20, y: window.innerHeight - 320 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const startDrag = (e) => {
  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

const onDrag = (e) => {
  if (isDragging.value) {
    position.value.x = e.clientX - dragOffset.value.x
    position.value.y = e.clientY - dragOffset.value.y
  }
}

const stopDrag = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
}

const sentimentClass = computed(() => {
  if (hopeScore.value > 80) return 'status-hope'
  if (hopeScore.value < 40) return 'status-despair'
  return 'status-neutral'
})

watch(() => props.lastMessage, (msg) => {
  if (!msg) return
  const content = msg.content || ''
  const positive = ['好', '开心', '爱', '棒', '感谢', '希望', '强']
  const negative = ['死', '难过', '烦', '哭', '垃圾', '绝望', '痛']
  let change = 0
  positive.forEach(w => { if (content.includes(w)) change += 2 })
  negative.forEach(w => { if (content.includes(w)) change -= 2 })
  hopeScore.value = Math.max(0, Math.min(100, hopeScore.value + change))
})

const generateQuote = async () => {
  if (isAnalysing.value) return
  isAnalysing.value = true
  currentMessage.value = "Scanning neural frequencies... Syncing with DeepSeek node..."
  
  try {
    const res = await api.post('/ai/chat', { 
      content: props.lastMessage?.content || "告诉我关于希望的事情" 
    })
    currentMessage.value = res.data
  } catch (e) {
    currentMessage.value = "[SYSTEM NOTICE] AI node timeout. Hope remains within you, regardless."
  } finally {
    isAnalysing.value = false
  }
}

onMounted(() => {
  setInterval(() => {
    hopeScore.value = Math.max(0, Math.min(100, hopeScore.value + (Math.random() * 2 - 1)))
  }, 5000)
})
</script>

<style scoped>
.alter-ego-container {
  position: fixed;
  z-index: 10000;
  width: min(90vw, 380px);
  pointer-events: auto;
  user-select: none;
}

.ae-window {
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #00ff41;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(0, 255, 65, 0.4);
  font-family: 'JetBrains Mono', 'Courier New', monospace;
}

.ae-header {
  background: #00ff41;
  color: #000;
  padding: 10px 15px;
  font-size: 11px;
  font-weight: 900;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: grab;
}

.ae-header:active { cursor: grabbing; }

.ae-close-btn {
  background: #000;
  color: #00ff41;
  padding: 2px 8px;
  font-size: 9px;
  cursor: pointer;
  border: 1px solid #000;
  transition: all 0.2s ease;
  margin-left: 10px;
}

.ae-close-btn:hover {
  background: #ff0055;
  color: #fff;
  border-color: #ff0055;
}

.ae-body {
  padding: 20px;
  display: flex;
  gap: 15px;
  cursor: pointer;
}

.ae-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.pixel-avatar {
  width: 100%;
  height: 100%;
  background: #111;
  border: 2px solid #00ff41;
  background-image: linear-gradient(45deg, #00ff41 25%, transparent 25%, transparent 75%, #00ff41 75%, #00ff41), 
                    linear-gradient(45deg, #00ff41 25%, transparent 25%, transparent 75%, #00ff41 75%, #00ff41);
  background-size: 10px 10px;
  background-position: 0 0, 5px 5px;
}

.ae-status-light {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 15px currentColor;
}

.status-hope { color: #00ff41; background: #00ff41; }
.status-despair { color: #ff0055; background: #ff0055; }
.status-neutral { color: #3b82f6; background: #3b82f6; }

.ae-terminal-text {
  color: #00ff41;
  font-size: 13px;
  line-height: 1.6;
  max-height: 160px;
  min-height: 80px;
  overflow-y: auto;
  text-shadow: 0 0 5px rgba(0, 255, 65, 0.5);
  scrollbar-width: none;
}
.ae-terminal-text::-webkit-scrollbar { display: none; }

.hope-meter-container { margin-top: 15px; }
.meter-label { font-size: 10px; color: #00ff41; margin-bottom: 6px; }
.meter-track { height: 8px; background: rgba(0, 255, 65, 0.1); border-radius: 4px; overflow: hidden; }
.meter-bar { height: 100%; background: #00ff41; box-shadow: 0 0 20px #00ff41; transition: width 0.6s ease; }

.ae-window::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), 
              linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.04));
  background-size: 100% 2px, 3px 100%;
  pointer-events: none;
}

.prompt { font-weight: bold; }
.cursor { animation: blink 1s infinite; }
@keyframes blink { 50% { opacity: 0; } }
</style>
