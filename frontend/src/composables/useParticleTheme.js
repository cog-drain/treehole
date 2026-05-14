import { watch } from 'vue'

const particleConfigs = {
  sakura: {
    particles: {
      number: { value: 15 },
      color: { value: '#f472b6' },
      shape: { type: 'circle' },
      opacity: { value: 0.5 },
      size: { value: { min: 2, max: 5 } },
      move: { enable: true, speed: 1.5, direction: 'bottom-right', outModes: { default: 'out' } },
      rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 5 } }
    }
  },
  spring: {
    particles: {
      number: { value: 12 },
      color: { value: '#22c55e' },
      shape: { type: 'circle' },
      opacity: { value: 0.3 },
      size: { value: { min: 5, max: 15 } },
      move: { enable: true, speed: 1, direction: 'top', outModes: { default: 'out' } }
    }
  },
  aurora: {
    particles: {
      number: { value: 3 },
      color: { value: ['#e0e7ff', '#f3e8ff', '#ecfdf5'] },
      shape: { type: 'circle' },
      opacity: { value: 0.25 },
      size: { value: { min: 600, max: 1200 } },
      move: { enable: true, speed: 0.3, direction: 'none', random: true, straight: false, outModes: { default: 'out' } }
    }
  }
}

export function useParticleTheme(themeRef) {
  function loadParticles(theme) {
    if (!window.tsParticles) return
    window.tsParticles.load('tsparticles', particleConfigs[theme] || particleConfigs.aurora)
  }

  const stopWatchingTheme = watch(themeRef, loadParticles)

  function startParticles(delay = 1000) {
    setTimeout(() => loadParticles(themeRef()), delay)
  }

  return {
    loadParticles,
    startParticles,
    stopWatchingTheme
  }
}
