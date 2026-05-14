<script setup>
defineProps({
  energy: { type: Number, default: 0 }
})

defineEmits(['earn-energy'])
</script>

<template>
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
</template>

<style scoped>
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
</style>
