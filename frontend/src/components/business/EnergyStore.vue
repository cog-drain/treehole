<template>
  <Transition name="fade">
    <div v-if="visible" class="store-overlay" @click.self="$emit('close')">
      <div class="store-card glass-card">
        <div class="store-header">
          <h3>⚡ 能量中心 / ENERGY HUB</h3>
          <button class="close-btn" @click="$emit('close')">✕</button>
        </div>

        <EnergyBalance :energy="energy" @earn-energy="$emit('earn-energy', $event)" />

        <div class="store-tabs">
          <div class="tab-item active">限时装扮</div>
          <div class="tab-item">功能增强</div>
        </div>

        <div class="items-grid custom-scrollbar">
          <StoreItemCard
            v-for="item in items"
            :key="item.id"
            :item="item"
            :energy="energy"
            :owned="isOwned(item.id)"
            :enabled="getEnabledState(item.id)"
            @buy="buyItem"
            @toggle="handleToggle"
          />
        </div>

        <div class="store-footer">
          <p>能量可通过发布留言和共鸣获得</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import EnergyBalance from './store/EnergyBalance.vue'
import StoreItemCard from './store/StoreItemCard.vue'
import { getStoreItemToggleEvent, STORE_ITEMS } from '@/constants/storeItems'

const props = defineProps({
  visible: Boolean,
  energy: Number,
  ownedItems: { type: Array, default: () => [] },
  lainEnabled: Boolean,
  p5Enabled: Boolean,
  p5AoaEnabled: Boolean,
  alterEgoEnabled: Boolean,
  camoEnabled: Boolean
})

const emit = defineEmits(['close', 'buy', 'toggle-lain', 'toggle-p5', 'toggle-p5-aoa', 'toggle-alter-ego', 'toggle-camo', 'earn-energy'])

const items = STORE_ITEMS

const isOwned = (id) => props.ownedItems.includes(id)

const getEnabledState = (id) => {
  if (id === 'lain_intro') return props.lainEnabled
  if (id === 'p5_effect') return props.p5Enabled
  if (id === 'p5_all_out_attack') return props.p5AoaEnabled
  if (id === 'alter_ego') return props.alterEgoEnabled
  if (id === 'camo_effect') return props.camoEnabled
  return false
}

const handleToggle = (id) => {
  const eventName = getStoreItemToggleEvent(id)
  if (eventName) emit(eventName)
}

const buyItem = ({ id, cost }) => {
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

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(99, 102, 241, 0.16);
  transform: scale(1.04);
}

.store-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.tab-item {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.45);
}

.tab-item.active {
  color: #4f46e5;
  background: rgba(99, 102, 241, 0.12);
}

.store-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
