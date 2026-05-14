<template>
  <div class="graph-loading">
    <div class="minimal-loader"></div>
    <p class="loading-text">Syncing Neural Nodes...</p>
  </div>
</template>

<style scoped>
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
</style>
