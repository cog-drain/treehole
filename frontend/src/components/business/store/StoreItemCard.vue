<script setup>
import StoreItemPreview from './StoreItemPreview.vue'

defineProps({
    item: { type: Object, required: true },
    energy: { type: Number, default: 0 },
    owned: { type: Boolean, default: false },
    enabled: { type: Boolean, default: false }
})

defineEmits(['buy', 'toggle'])
</script>

<template>
    <div class="store-item" :class="{ owned }">
        <StoreItemPreview :item-id="item.id" />

        <div class="item-info">
            <div class="item-name">
                {{ item.name }}
                <span v-if="owned" class="owned-tag">已拥有</span>
            </div>
            <div class="item-desc">{{ item.description }}</div>
        </div>

        <div class="item-action">
            <button
                v-if="!owned"
                class="buy-btn"
                :disabled="energy < item.cost"
                @click="$emit('buy', { id: item.id, cost: item.cost })"
            >
                {{ item.cost }} ⚡ 购买
            </button>
            <div v-else class="toggle-row">
                <span class="status-text">
                    {{ enabled ? '已启用' : '已禁用' }}
                </span>
                <label class="switch">
                    <input type="checkbox" :checked="enabled" @change="$emit('toggle', item.id)" />
                    <span class="slider"></span>
                </label>
            </div>
        </div>
    </div>
</template>

<style scoped>
.store-item {
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 20px;
    padding: 20px;
    transition: all 0.3s;
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

.toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-text {
    font-size: 12px;
    font-weight: 700;
    color: #94a3b8;
}

.switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
}

.slider:before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: #6366f1;
}
input:checked + .slider:before {
    transform: translateX(20px);
}
</style>
