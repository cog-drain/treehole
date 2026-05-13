<template>
  <div class="graph-3d-container" ref="container">
    <div id="mind-graph-3d"></div>
    
    <!-- Obsidian Style Overlay -->
    <div class="graph-overlay">
      <div class="header-group">
        <h2 class="graph-title">Collective Consciousness</h2>
        <p class="graph-subtitle">Graph View / Collective Subconscious</p>
      </div>
      <div class="graph-controls">
        <button class="control-btn" title="Reset View" @click="resetCamera">
          <Target :size="14" />
        </button>
        <button class="control-btn" :title="showLinks ? 'Hide Links' : 'Show Links'" @click="toggleLinks">
          <Share2 :size="14" :class="{ 'text-blue-400': showLinks }" />
        </button>
      </div>
    </div>

    <!-- Minimal Loading -->
    <div v-if="loading" class="graph-loading">
      <div class="minimal-loader"></div>
      <p class="loading-text">Syncing Neural Nodes...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Target, Share2 } from 'lucide-vue-next'
import api from '@/api'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['node-click'])

const container = ref(null)
const loading = ref(true)
const showLinks = ref(true)
let Graph = null
let resizeObserver = null
let ForceGraph3D = null
let THREE = null

async function init3DGraph() {
  loading.value = true
  try {
    const res = await api.get('/graph/data')
    const data = res.data

    if (!data.nodes || data.nodes.length === 0) {
      loading.value = false
      return
    }

    await render3D(data)
  } catch (e) {
    console.error('3D Graph fetch failed', e)
  } finally {
    loading.value = false
  }
}

async function render3D(data) {
  const elem = document.getElementById('mind-graph-3d')
  if (!elem) return
  if (!ForceGraph3D || !THREE) {
    const [forceGraphModule, threeModule] = await Promise.all([
      import('3d-force-graph'),
      import('three')
    ])
    ForceGraph3D = forceGraphModule.default
    THREE = threeModule
  }

  Graph = ForceGraph3D()(elem)
    .graphData(data)
    .backgroundColor('#161616')
    .showNavInfo(false)
    .nodeColor(node => getNodeColor(node.theme))
    .nodeLabel(node => `<div class="node-tooltip"><b>${node.author}</b><br/>${node.label}</div>`)
    .nodeRelSize(5)
    .nodeOpacity(0.8)
    // 重构节点对象：球体 + 隐藏的文字标签
    .nodeThreeObject(node => {
      const group = new THREE.Group();
      
      // 1. 核心球体
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(8),
        new THREE.MeshLambertMaterial({
          color: getNodeColor(node.theme),
          transparent: true,
          opacity: 0.7,
        })
      );
      group.add(sphere);

      // 2. 文字标签 (Canvas Sprite) - 扩容至 800px 宽度以容纳更多内容
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // 扩容：显示前 50 个字符
      const text = node.label.length > 50 ? node.label.substring(0, 50) + '...' : node.label;
      
      canvas.width = 800; // 大幅增加画布宽度
      canvas.height = 80;
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.textAlign = 'center';
      ctx.fillText(text, 400, 50);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0 });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(100, 10, 1); // 调整比例
      sprite.position.y = 25; // 针对超近景微调高度
      sprite.name = 'node-label'; 
      sprite.visible = false;   
      
      group.add(sprite);
      return group;
    })
    .linkColor(() => '#444444')
    .linkWidth(0.5)
    .linkOpacity(showLinks.value ? 0.2 : 0)
    .onNodeClick(node => {
      const distance = 180;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      Graph.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        1500
      );
      emit('node-click', node.id);
    });

  // 绑定控制器事件
  if (Graph.controls()) {
    Graph.controls().addEventListener('change', updateNodeLabels);
  }
  
  // 初始化时执行一次
  updateNodeLabels();

  // 尺寸同步
  resizeObserver = new ResizeObserver(() => {
    if (Graph && container.value) {
      const { clientWidth, clientHeight } = container.value
      Graph.width(clientWidth)
      Graph.height(clientHeight)
    }
  })
  resizeObserver.observe(container.value)
}

// 核心：缩放感知与开关联动逻辑 (已提升至顶层作用域)
const updateNodeLabels = () => {
  if (!Graph) return;
  const { x, y, z } = Graph.cameraPosition();
  const distance = Math.hypot(x, y, z);
  
  // 1. 极致显影阈值：180px (只有“贴脸”时才显示)
  const isProximityReached = distance < 180;
  // 2. 联动开关：只有连线开关开启时，才允许显示文字
  const shouldShow = isProximityReached && showLinks.value;
  
  Graph.scene().traverse(obj => {
    if (obj.name === 'node-label') {
      obj.visible = shouldShow;
      if (shouldShow) {
        obj.material.opacity = Math.min(obj.material.opacity + 0.15, 0.95);
      } else {
        obj.material.opacity = 0;
      }
    }
  });
};

function resetCamera() {
  if (Graph) Graph.zoomToFit(1000)
}

function toggleLinks() {
  showLinks.value = !showLinks.value
  if (Graph) {
    Graph.linkOpacity(showLinks.value ? 0.2 : 0)
    // 立即同步文字显隐状态
    updateNodeLabels()
  }
}

function getNodeColor(theme) {
  const colors = {
    'default': '#ffffff',
    'autumn': '#eab308',
    'starry': '#a855f7',
    'retro': '#94a3b8'
  }
  return colors[theme] || '#3b82f6'
}

onMounted(() => {
  if (props.visible) init3DGraph()
})

watch(() => props.visible, (val) => {
  if (val) {
    if (!Graph) init3DGraph()
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (Graph) {
    Graph._destructor && Graph._destructor()
  }
})
</script>

<style scoped>
.graph-3d-container {
  width: 100%;
  height: 100%; /* 关键修复：自适应父容器高度 */
  background: #161616;
  border-radius: 24px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  margin-bottom: 24px;
}

#mind-graph-3d {
  width: 100%;
  height: 100%;
}

.graph-overlay {
  position: absolute;
  top: 32px;
  left: 32px;
  pointer-events: none;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.graph-title {
  color: rgba(255, 255, 255, 0.9);
  font-family: Inter, system-ui, sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 4px;
  letter-spacing: -0.01em;
}

.graph-subtitle {
  color: rgba(255, 255, 255, 0.3);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
}

.graph-controls {
  display: flex;
  gap: 8px;
  pointer-events: auto;
}

.control-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.2);
}

.graph-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #161616;
  z-index: 20;
}

.minimal-loader {
  width: 30px;
  height: 30px;
  border: 2px solid rgba(255, 255, 255, 0.05);
  border-top-color: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  animation: spin 0.8s infinite linear;
  margin-bottom: 16px;
}

.loading-text {
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.node-tooltip {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 11px;
  max-width: 240px;
  pointer-events: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  line-height: 1.5;
}
</style>
