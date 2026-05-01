<template>
  <div class="graph-3d-container" ref="container">
    <div id="mind-graph-3d"></div>
    
    <!-- UI Overlay -->
    <div class="graph-overlay">
      <div class="graph-title">The Wired: Collective Consciousness</div>
      <div class="graph-controls">
        <button class="control-btn" @click="resetCamera">🎯 重置视角</button>
        <button class="control-btn" @click="toggleRotation">{{ autoRotate ? '⏸ 停止旋转' : '▶ 自动旋转' }}</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="graph-loading">
      <div class="neon-loader"></div>
      <p>正在同步全人类的潜意识频率...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import ForceGraph3D from '3d-force-graph'
import * as THREE from 'three'
import api from '@/api'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['node-click'])

const container = ref(null)
const loading = ref(true)
const autoRotate = ref(true)
let Graph = null

async function init3DGraph() {
  loading.value = true
  try {
    const res = await api.get('/graph/data')
    const data = res.data

    if (!data.nodes || data.nodes.length === 0) {
      loading.value = false
      return
    }

    render3D(data)
    
    // 强制执行一次适配，确保初始化不留白/不溢出
    setTimeout(() => {
      onResize()
      if (Graph) Graph.zoomToFit(800, 150)
    }, 300)
  } catch (e) {
    console.error('3D Graph fetch failed', e)
  } finally {
    loading.value = false
  }
}

function render3D(data) {
  const elem = document.getElementById('mind-graph-3d')
  
  Graph = ForceGraph3D()(elem)
    .graphData(data)
    .backgroundColor('#000000')
    .showNavInfo(false)
    .nodeColor(node => getNodeColor(node.theme))
    .nodeLabel(node => `<div class="node-tooltip"><b>${node.author}</b><br/>${node.label}</div>`)
    .nodeRelSize(6)
    .nodeOpacity(0.9)
    // 赛博朋克发光球体效果
    .nodeThreeObject(node => {
      const obj = new THREE.Mesh(
        new THREE.SphereGeometry(10),
        new THREE.MeshPhongMaterial({
          color: getNodeColor(node.theme),
          transparent: true,
          opacity: 0.8,
          emissive: getNodeColor(node.theme),
          emissiveIntensity: 0.5
        })
      );
      return obj;
    })
    // 连线设计
    .linkColor(link => link.type === 'tag' ? '#00e5ff' : '#455a64')
    .linkWidth(link => link.type === 'tag' ? 1.5 : 0.5)
    .linkOpacity(0.3)
    .linkDirectionalParticles(link => link.type === 'tag' ? 2 : 0)
    .linkDirectionalParticleSpeed(0.005)
    .linkDirectionalParticleWidth(2)
    .onNodeClick(node => {
      // 聚焦节点
      const distance = 200;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      Graph.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        2000
      );
      emit('node-click', node.id);
    });

  // 自动旋转配置
  if (autoRotate.value) {
    Graph.controls().autoRotate = true;
    Graph.controls().autoRotateSpeed = 0.5;
  }
  
  // 增加呼吸感和轻微晃动
  const clock = new THREE.Clock();
  Graph.onRenderTick(() => {
    const time = clock.getElapsedTime();
    
    // 遍历所有节点对象进行动画
    Graph.scene().traverse(obj => {
      if (obj.isMesh && obj.geometry && obj.geometry.type === 'SphereGeometry') {
        // 1. 亮度呼吸感 (Emissive Intensity)
        if (obj.material && obj.material.emissiveIntensity !== undefined) {
          obj.material.emissiveIntensity = 0.5 + Math.sin(time * 2.5) * 0.4;
        }
        
        // 2. 大小呼吸感 (Scale)
        const s = 1 + Math.sin(time * 2) * 0.1;
        obj.scale.set(s, s, s);
        
        // 3. 极小幅度的位移晃动 (Jitter)
        // 仅对视觉位置做微调，不影响物理引擎
        obj.position.x += Math.sin(time * 4 + obj.id) * 0.05;
        obj.position.z += Math.cos(time * 3 + obj.id) * 0.05;
      }
    });
  });

  // 自适应窗口
  window.addEventListener('resize', onResize)
}

function onResize() {
  if (Graph && container.value) {
    Graph.width(container.value.clientWidth)
    Graph.height(container.value.clientHeight)
  }
}

function resetCamera() {
  if (Graph) Graph.zoomToFit(1000)
}

function toggleRotation() {
  autoRotate.value = !autoRotate.value
  if (Graph) {
    Graph.controls().autoRotate = autoRotate.value
  }
}

function getNodeColor(theme) {
  const colors = {
    'default': '#ffffff',
    'autumn': '#ff9100',
    'starry': '#b388ff',
    'retro': '#d7ccc8'
  }
  return colors[theme] || '#00e5ff'
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
  window.removeEventListener('resize', onResize)
  if (Graph) {
    Graph._destructor && Graph._destructor()
  }
})
</script>

<style scoped>
.graph-3d-container {
  width: 100%;
  height: 80vh;
  background: #000;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  border: 1px solid #00e5ff33;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.1);
  margin-bottom: 24px;
}

#mind-graph-3d {
  width: 100%;
  height: 100%;
}

.graph-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  pointer-events: none;
  z-index: 10;
}

.graph-title {
  color: #00e5ff;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 1.4rem;
  margin-bottom: 12px;
  text-shadow: 0 0 15px rgba(0, 229, 255, 0.8), 0 0 5px #fff;
  letter-spacing: 2px;
}

.graph-controls {
  display: flex;
  gap: 10px;
  pointer-events: auto;
}

.control-btn {
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid #00e5ff;
  color: #00e5ff;
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(5px);
}
.control-btn:hover {
  background: #00e5ff;
  color: #000;
  box-shadow: 0 0 15px #00e5ff;
}

.graph-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  color: #00e5ff;
  z-index: 20;
}

.neon-loader {
  width: 50px;
  height: 50px;
  border: 3px solid #00e5ff22;
  border-top-color: #00e5ff;
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: 15px;
  box-shadow: 0 0 15px #00e5ff44;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

:deep(.node-tooltip) {
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid #00e5ff;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  max-width: 200px;
  pointer-events: none;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
}
</style>
