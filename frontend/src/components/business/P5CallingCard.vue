<template>
  <div class="p5r-calling-card-overlay">
    <!-- P5R 标志性红色撕裂背景 -->
    <div class="p5r-bg">
      <div class="p5r-stripe stripe-1"></div>
      <div class="p5r-stripe stripe-2"></div>
      <div class="p5r-stripe stripe-3"></div>
    </div>

    <!-- 动态黑影剪影 -->
    <div class="p5r-silhouettes">
      <div v-for="i in 3" :key="i" class="p5r-phantom" :style="phantomStyle(i)"></div>
    </div>

    <!-- 中央核心：预告信标志 -->
    <div class="p5r-card-container">
      <div class="p5r-card-glitch">
        <div class="p5r-logo-box">
          <div class="p5r-logo-text">TAKE YOUR HEART</div>
        </div>
      </div>
      <div class="p5r-sub-text">PHANTOM THIEVES OF HEARTS</div>
    </div>

    <!-- 爆裂星形粒子 -->
    <div class="p5r-stars">
      <div v-for="i in 12" :key="i" class="p5r-star-burst" :style="starBurstStyle(i)"></div>
    </div>
  </div>
</template>

<script setup>
const phantomStyle = (i) => ({
  animationDelay: `${i * 0.2}s`,
  left: `${-20 + i * 30}%`,
  transform: `rotate(${-10 + i * 5}deg)`
})

const starBurstStyle = (i) => {
  const angle = (i / 12) * Math.PI * 2
  return {
    '--angle': `${angle}rad`,
    animationDelay: `${Math.random() * 0.5}s`
  }
}
</script>

<style scoped>
.p5r-calling-card-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: 'Arial Black', Gadget, sans-serif;
}

.p5r-bg {
  position: absolute;
  inset: -20%;
  transform: rotate(-15deg);
  pointer-events: none;
}

.p5r-stripe {
  position: absolute;
  background: #d32f2f;
  height: 200px;
  width: 200%;
  box-shadow: 0 0 50px rgba(0,0,0,0.5);
}

.stripe-1 { top: 10%; left: -50%; animation: slideIn 0.3s ease-out forwards; }
.stripe-2 { top: 40%; left: -50%; animation: slideIn 0.4s ease-out forwards; animation-delay: 0.1s; }
.stripe-3 { top: 70%; left: -50%; animation: slideIn 0.5s ease-out forwards; animation-delay: 0.2s; }

@keyframes slideIn {
  from { transform: translateX(-100%) skewX(-20deg); }
  to { transform: translateX(0) skewX(-20deg); }
}

.p5r-phantom {
  position: absolute;
  bottom: 0;
  width: 300px;
  height: 500px;
  background: black;
  clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
  filter: drop-shadow(10px 0 20px rgba(211, 47, 47, 0.5));
  animation: phantomRise 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  opacity: 0;
}

@keyframes phantomRise {
  from { transform: translateY(100%) scaleY(0.5); opacity: 0; }
  to { transform: translateY(10%) scaleY(1); opacity: 1; }
}

.p5r-card-container {
  position: relative;
  z-index: 10;
  text-align: center;
  animation: cardPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  animation-delay: 0.4s;
  opacity: 0;
}

@keyframes cardPop {
  from { transform: scale(0) rotate(-20deg); opacity: 0; }
  to { transform: scale(1.2) rotate(5deg); opacity: 1; }
}

.p5r-logo-box {
  background: white;
  padding: 20px 60px;
  transform: skewX(-15deg);
  border: 5px solid black;
  box-shadow: 15px 15px 0 #000;
}

.p5r-logo-text {
  color: black;
  font-size: 4rem;
  font-weight: 900;
  letter-spacing: -2px;
  transform: skewX(15deg);
  text-transform: uppercase;
}

.p5r-sub-text {
  margin-top: 40px;
  color: white;
  background: black;
  display: inline-block;
  padding: 5px 20px;
  font-size: 0.8rem;
  letter-spacing: 5px;
  font-weight: bold;
}

.p5r-star-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: #fff;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  animation: burst 1s ease-out forwards;
}

@keyframes burst {
  from { transform: translate(-50%, -50%) rotate(0) scale(0); opacity: 1; }
  to { transform: translate(calc(-50% + cos(var(--angle)) * 400px), calc(-50% + sin(var(--angle)) * 400px)) rotate(360deg) scale(2); opacity: 0; }
}
</style>
