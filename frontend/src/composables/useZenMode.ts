import { onUnmounted, ref, type Ref } from 'vue'

interface ZenSound {
    id: string
    name: string
    icon: string
    url: string
}

export function useZenMode() {
    const isZenMode: Ref<boolean> = ref(false)
    const showZenMenu: Ref<boolean> = ref(false)
    const currentZenSound: Ref<ZenSound | null> = ref(null)
    const zenVolume: Ref<number> = ref(80)

    const zenSounds: ZenSound[] = [
        { id: 'shiki', name: '四季之歌·悠然', icon: '🍃', url: '/audio/shiki_no_uta.mp3' },
        { id: 'angel', name: '堕天使·梦幻', icon: '🧚', url: '/audio/fallen_angel.mp3' },
        { id: 'zen', name: '禅定旋律', icon: '🧘', url: '/audio/zen.mp3' }
    ]

    let zenAudio: HTMLAudioElement = new Audio()
    zenAudio.loop = true
    let fadeTimer: ReturnType<typeof setInterval> | null = null

    function updateZenVolume(): void {
        if (zenAudio) zenAudio.volume = zenVolume.value / 100
    }

    function fadeAudio(targetVolume: number, duration = 1000): Promise<void> {
        if (!zenAudio) return Promise.resolve()
        if (fadeTimer) clearInterval(fadeTimer)
        return new Promise(resolve => {
            const startVolume = zenAudio.volume
            const steps = 30
            const stepValue = (targetVolume - startVolume) / steps
            let current = 0
            fadeTimer = setInterval(() => {
                current++
                zenAudio.volume = Math.max(0, Math.min(1, startVolume + stepValue * current))
                if (current >= steps) {
                    clearInterval(fadeTimer!)
                    fadeTimer = null
                    if (targetVolume === 0) zenAudio.pause()
                    resolve()
                }
            }, duration / steps)
        })
    }

    onUnmounted(() => {
        if (fadeTimer) clearInterval(fadeTimer)
        fadeTimer = null
        zenAudio.pause()
        zenAudio.src = ''
        isZenMode.value = false
        showZenMenu.value = false
    })

    function stopZenMode(): void {
        isZenMode.value = false
        showZenMenu.value = false
        fadeAudio(0).then(() => (currentZenSound.value = null))
    }

    function minimizeZen(): void {
        isZenMode.value = false
        showZenMenu.value = false
    }

    function returnToZen(): void {
        isZenMode.value = true
        showZenMenu.value = false
    }

    function selectZenSound(sound: ZenSound): void {
        if (currentZenSound.value?.id === sound.id) {
            isZenMode.value = true
            showZenMenu.value = false
            return
        }

        isZenMode.value = true
        const performPlay = (): void => {
            currentZenSound.value = sound
            zenAudio.src = sound.url
            zenAudio.volume = 0
            zenAudio.load()
            zenAudio.oncanplay = () => {
                zenAudio
                    .play()
                    .then(() => fadeAudio(zenVolume.value / 100))
                    .catch(e => console.warn('Zen Audio Play Blocked:', e))
            }
        }

        if (currentZenSound.value) fadeAudio(0, 300).then(performPlay)
        else performPlay()
    }

    return {
        isZenMode,
        showZenMenu,
        currentZenSound,
        zenVolume,
        zenSounds,
        updateZenVolume,
        stopZenMode,
        minimizeZen,
        returnToZen,
        selectZenSound
    }
}
