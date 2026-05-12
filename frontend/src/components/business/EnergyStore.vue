<template>
  <Transition name="fade">
    <div v-if="visible" class="store-overlay" @click.self="$emit('close')">
      <div class="store-card glass-card">
        <div class="store-header">
          <h3>⚡ 能量中心 / ENERGY HUB</h3>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>

        <div class="energy-balance">
          <div class="balance-info">
            <span class="label">当前余额</span>
            <span class="value">{{ energy }}</span>
          </div>
          <div class="earn-actions">
            <button class="earn-btn" @click="$emit('earn-energy', { type: 'checkin', amount: 50 })">
              <span class="icon">🎁</span> 签到 +50
            </button>
            <button class="earn-btn ad-btn" @click="$emit('earn-energy', { type: 'ad', amount: 100 })">
              <span class="icon">📺</span> 观看广告 +100
            </button>
          </div>
        </div>

        <div class="store-tabs">
          <div class="tab-item active">限时装扮</div>
          <div class="tab-item">功能增强</div>
        </div>

        <div class="items-grid custom-scrollbar">
          <div v-for="item in items" :key="item.id" class="store-item" :class="{ 'owned': isOwned(item.id) }">
            <div class="item-preview" :class="item.id + '-preview'">
              <span v-if="item.id === 'lain_intro'" class="glitch-text">PRESENT DAY...</span>
              <div v-else-if="item.id === 'p5_effect'" class="p5-logo-preview">TAKE YOUR HEART</div>
              <div v-else-if="item.id === 'p5_all_out_attack'" class="p5-finish-preview">
                <span class="finish-text">FINISH</span>
                <div class="slash-line"></div>
              </div>
              <div v-else-if="item.id === 'alter_ego'" class="ae-terminal-preview">
                <div class="ae-monitor">
                  <div class="ae-scanline"></div>
                  <span class="ae-code">AE v1.0</span>
                </div>
              </div>
              <div v-else-if="item.id === 'camo_effect'" class="camo-preview">
                <div class="camo-ghost-box">GHOST</div>
                <div class="camo-glitch-overlay"></div>
              </div>
            </div>
            <div class="item-info">
              <div class="item-name">
                {{ item.name }}
                <span v-if="isOwned(item.id)" class="owned-tag">已拥有</span>
              </div>
              <div class="item-desc">{{ item.description }}</div>
            </div>

            <div class="item-action">
              <button 
                v-if="!isOwned(item.id)" 
                class="buy-btn" 
                @click="buyItem(item.id, item.cost)"
                :disabled="energy < item.cost"
              >
                {{ item.cost }} ⚡ 购买
              </button>
              <div v-else class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                <span class="text-xs font-bold text-slate-400">
                  {{ getStatusText(item.id) }}
                </span>
                <label class="switch">
                  <input type="checkbox" :checked="getEnabledState(item.id)" @change="handleToggle(item.id)">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="store-footer">
          <p>能量可通过发布留言和共鸣获得</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>


const props = defineProps({
  visible: Boolean,
  energy: Number,
  ownedItems: Array,
  lainEnabled: Boolean,
  p5Enabled: Boolean,
  p5AoaEnabled: Boolean,
  alterEgoEnabled: Boolean,
  camoEnabled: Boolean
})

const emit = defineEmits(['close', 'buy', 'toggle-lain', 'toggle-p5', 'toggle-p5-aoa', 'toggle-alter-ego', 'toggle-camo', 'earn-energy'])

const items = [
  {
    id: 'lain_intro',
    name: '《玲音》接入仪式',
    description: '还原 PROTOCOL 7 接入 WIRED 的视觉盛宴',
    cost: 50,
    preview: '/img/lain_preview.jpg'
  },
  {
    id: 'p5_effect',
    name: '《P5R》预告信发布动效',
    description: '点击发射！让你的秘密像预告信一样一击穿梭星空',
    cost: 80,
    preview: '/img/p5_preview.jpg'
  },
  {
    id: 'p5_all_out_attack',
    name: '《P5R》总攻击：共鸣达成',
    description: '华丽终结！当你的留言获得极高共鸣时触发全屏结算',
    cost: 150,
    preview: '/img/p5_aoa_preview.jpg'
  },
  {
    id: 'alter_ego',
    name: 'AI 疗愈师：Alter Ego',
    description: '希望的继承者！自动分析树洞情绪，为您提供 AI 情感支持',
    cost: 200,
    preview: '/img/alter_ego_preview.jpg'
  },
  {
    id: 'camo_effect',
    name: '《攻壳机动队》光学迷彩',
    description: '装备后，你发布的留言会自带光学扭曲和故障闪烁，让你在树洞中显得更加神秘。',
    cost: 100,
    preview: ''
  }
]

const isOwned = (id) => props.ownedItems.includes(id)

const getEnabledState = (id) => {
  if (id === 'lain_intro') return props.lainEnabled
  if (id === 'p5_effect') return props.p5Enabled
  if (id === 'p5_all_out_attack') return props.p5AoaEnabled
  if (id === 'alter_ego') return props.alterEgoEnabled
  if (id === 'camo_effect') return props.camoEnabled
  return false
}

const getStatusText = (id) => getEnabledState(id) ? '已启用' : '已禁用'

const handleToggle = (id) => {
  if (id === 'lain_intro') emit('toggle-lain')
  if (id === 'p5_effect') emit('toggle-p5')
  if (id === 'p5_all_out_attack') emit('toggle-p5-aoa')
  if (id === 'alter_ego') emit('toggle-alter-ego')
  if (id === 'camo_effect') emit('toggle-camo')
}

const buyItem = (id, cost) => {
  if (props.energy >= cost) {
    emit('buy', { id, cost })
  }
}
</script>

<style scoped>
.store-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.store-card {
  width: min(95vw, 480px);
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

@media (min-width: 640px) {
  .store-card {
    padding: 32px;
  }
}

.items-grid {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.5);
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.store-header h3 {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: #6366f1;
}

.energy-balance {
  background: rgba(99, 102, 241, 0.1);
  padding: 16px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.balance-info {
  display: flex;
  flex-direction: column;
}

.energy-balance .label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.energy-balance .value {
  font-size: 1.5rem;
  font-weight: 900;
  color: #6366f1;
}

.earn-actions {
  display: flex;
  gap: 8px;
  flex-direction: column;
}

.earn-btn {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  color: #475569;
}

.earn-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.8);
}

.ad-btn {
  background: linear-gradient(45deg, rgba(236, 72, 153, 0.1), rgba(99, 102, 241, 0.1));
  border-color: rgba(236, 72, 153, 0.2);
  color: #db2777;
}

.store-item {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  padding: 20px;
  transition: all 0.3s;
}

.lain-intro-preview {
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
  .lain-intro-preview { height: 120px; }
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
  .p5_effect-preview { height: 120px; }
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
  .p5_all_out_attack-preview { height: 120px; }
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
  .alter_ego-preview { height: 120px; }
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
  top: 0; left: 0; right: 0;
  height: 2px;
  background: rgba(0, 255, 65, 0.3);
  animation: scan 2s linear infinite;
}

@keyframes scan {
  from { top: 0; }
  to { top: 100%; }
}

.ae-code {
  color: #00ff41;
  font-family: monospace;
  font-size: 14px;
  text-shadow: 0 0 8px #00ff41;
}

/* Camo Preview */
.camo-preview {
  height: 80px;
  background: repeating-linear-gradient(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 10px, transparent 10px, transparent 20px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
  border: 1px dashed rgba(255,255,255,0.3);
}

@media (min-width: 640px) {
  .camo-preview { height: 120px; }
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
  background: linear-gradient(transparent 50%, rgba(255,255,255,0.05) 50%);
  background-size: 100% 4px;
  opacity: 0.5;
  animation: scan 10s linear infinite;
  pointer-events: none;
}

@keyframes camo-flicker {
  0%, 100% { opacity: 0.8; transform: scale(1); filter: blur(0); }
  45% { opacity: 0.8; transform: scale(1); filter: blur(0); }
  50% { opacity: 0.2; transform: scale(1.05) translateX(2px); filter: blur(2px); }
  55% { opacity: 0.8; transform: scale(1); filter: blur(0); }
}

.item-name {
  font-weight: 700;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.owned-tag {
  font-size: 10px;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  padding: 2px 8px;
  border-radius: 6px;
}

.item-desc {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 20px;
}

.buy-btn {
  width: 100%;
  background: #6366f1;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.buy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Toggle Switch */
.toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input { opacity: 0; width: 0; height: 0; }

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider { background-color: #6366f1; }
input:checked + .slider:before { transform: translateX(20px); }

.store-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
