<template>
  <LainIntro v-if="shouldShowLain()" />
  
  <div 
    class="app-wrapper transition-all duration-1000"
    :class="{ 'is-dark': appStore.isDark }"
  >
    <header class="app-header">
      <button class="theme-switch" @click="toggleDark" :title="appStore.isDark ? '切换到白天模式' : '切换到夜间模式'">
        {{ appStore.isDark ? '🌙' : '☀️' }}
      </button>
      <div class="header-content">
        <h1>🌳 树洞留言板</h1>
        <p>在这里，匿名说出你的心声</p>
      </div>
    </header>

    <main class="main-container">
      <div id="tsparticles" class="fixed inset-0 pointer-events-none z-0" style="filter: blur(100px); opacity: 0.6;"></div>
      <Home 
        @open-store="showStore = true" 
        @publish-success="handlePublishSuccess"
        @resonance-boom="handleResonanceBoom"
        @new-broadcast="(msg) => latestMessage = msg"
      />
    </main>

    <Transition name="p5-fade">
      <P5CallingCard v-if="showP5Animation" />
    </Transition>

    <Transition name="p5-aoa">
      <P5AllOutAttack v-if="showAoaAnimation" />
    </Transition>

    <EnergyStore 
      :visible="showStore"
      :energy="appStore.energy"
      :ownedItems="appStore.ownedItems"
      :lainEnabled="appStore.lainEnabled"
      :p5Enabled="appStore.p5EffectEnabled"
      :p5AoaEnabled="appStore.p5AoaEnabled"
      :alterEgoEnabled="appStore.alterEgoEnabled"
      :camoEnabled="appStore.camoEnabled"
      @close="showStore = false"
      @buy="handleBuy"
      @earn-energy="handleEarnEnergy"
      @toggle-lain="handleToggleLain"
      @toggle-p5="handleToggleP5"
      @toggle-p5-aoa="handleToggleP5Aoa"
      @toggle-alter-ego="handleToggleAlterEgo"
      @toggle-camo="handleToggleCamo"
    />

    <AlterEgo 
      :visible="appStore.alterEgoEnabled && appStore.ownedItems.includes('alter_ego')" 
      :lastMessage="latestMessage"
      @close="handleToggleAlterEgo"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Home from './views/Home.vue'
import LainIntro from './components/LainIntro.vue'
import EnergyStore from './components/EnergyStore.vue'
import P5CallingCard from './components/P5CallingCard.vue'
import P5AllOutAttack from './components/P5AllOutAttack.vue'
import AlterEgo from './components/AlterEgo.vue'
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'

const appStore = useAppStore()

const showP5Animation = ref(false)
const showAoaAnimation = ref(false)
const showStore = ref(false)
const latestMessage = ref(null)

onMounted(() => {
  appStore.init()
})

// 判断是否应该显示开场动画
const shouldShowLain = () => {
  return appStore.ownedItems.includes('lain_intro') && appStore.lainEnabled
}

// 购买逻辑
const handleBuy = ({ id, cost }) => {
  if (appStore.buy(id, cost)) {
    ElMessage.success('交易成功 ✨')
  } else {
    ElMessage.warning('能量不足')
  }
}

// 赚取能量逻辑
const handleEarnEnergy = ({ type, amount }) => {
  // 简易防刷机制（实际应由后端控制）
  const lastKey = `treehole_last_${type}`
  const lastTime = parseInt(localStorage.getItem(lastKey) || '0')
  const now = Date.now()
  
  if (type === 'checkin' && now - lastTime < 86400000) {
    ElMessage.warning('今天已经签到过了哦，明天再来吧')
    return
  }
  
  if (type === 'ad') {
    ElMessage({ message: '正在连接神经网路路获取数据...', type: 'info', duration: 2000 })
    setTimeout(() => {
      appStore.addEnergy(amount)
      localStorage.setItem(lastKey, Date.now().toString())
      ElMessage.success(`数据流载入完毕！获得 ${amount} ⚡`)
    }, 2000)
    return
  }

  appStore.addEnergy(amount)
  localStorage.setItem(lastKey, Date.now().toString())
  ElMessage.success(`获取成功！获得 ${amount} ⚡`)
}

// 切换开关逻辑
const handleToggleLain = () => appStore.toggle('lain')
const handleToggleP5 = () => appStore.toggle('p5')
const handleToggleP5Aoa = () => appStore.toggle('p5Aoa')
const handleToggleAlterEgo = () => appStore.toggle('alterEgo')
const handleToggleCamo = () => appStore.toggle('camo')

const handlePublishSuccess = (msg) => {
  if (msg) latestMessage.value = msg
  if (appStore.ownedItems.includes('p5_effect') && appStore.p5EffectEnabled) {
    showP5Animation.value = true
    setTimeout(() => {
      showP5Animation.value = false
    }, 2500)
  }
}

const handleResonanceBoom = () => {
  if (appStore.ownedItems.includes('p5_all_out_attack') && appStore.p5AoaEnabled) {
    showAoaAnimation.value = true
    setTimeout(() => {
      showAoaAnimation.value = false
    }, 3500)
  }
}

function toggleDark() {
  appStore.toggleDark()
}
</script>


<style scoped>
.app-wrapper {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background-color: #f1f1f1;
  /* 叠加两层极淡的微光渐变，增加层次感 */
  background-image: 
    radial-gradient(at 0% 0%, rgba(224, 242, 254, 0.6) 0px, transparent 50%), 
    radial-gradient(at 100% 100%, rgba(250, 232, 255, 0.6) 0px, transparent 50%),
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
}

.app-wrapper.is-dark {
  background-color: #030712;
  background-image: none;
}

.app-header {
  padding: 40px 20px 30px;
  text-align: center;
  position: relative;
  z-index: 10;
}

.theme-switch {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 48px; height: 48px;
  border-radius: 16px;
  /* 关键：使用极高透明度，让底色透出来 */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  /* 边框也采用半透明，形成边缘微光 */
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  font-size: 1.4rem;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

:global(.dark) .theme-switch {
  background: rgba(15, 23, 42, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.theme-switch:hover { 
  transform: translateY(-2px) scale(1.05);
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(0, 0, 0, 0.15);
}

:global(.dark) .theme-switch:hover {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(255, 255, 255, 0.2);
}

.header-content h1 {
  margin: 0;
  font-size: 2.5rem;
  color: #1e88e5;
  font-weight: 900;
  letter-spacing: -1px;
}

.header-content p {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 1.1rem;
  font-weight: 300;
}

.main-container {
  flex: 1;
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

@media (max-width: 600px) {
  .app-header { padding: 30px 15px 20px; }
  .header-content h1 { font-size: 2rem; }
}

/* P5 动效过渡 */
.p5-fade-enter-active, .p5-fade-leave-active { 
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1); 
}
.p5-fade-enter-from { 
  opacity: 0; 
  transform: scale(0.8);
}
.p5-fade-leave-to { 
  opacity: 0; 
  transform: scale(1.5) rotate(5deg); 
  filter: blur(20px); 
}

/* P5 总攻击过渡 */
.p5-aoa-enter-active, .p5-aoa-leave-active {
  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
}
.p5-aoa-enter-from { opacity: 0; transform: scale(1.2); }
.p5-aoa-leave-to { opacity: 0; filter: brightness(2); }
</style>
