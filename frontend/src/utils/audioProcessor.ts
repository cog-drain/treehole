type WebAudioWindow = Window &
    typeof globalThis & {
        webkitAudioContext?: typeof AudioContext
    }

/**
 * 将 AudioBuffer 转换为 Wav Blob
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1 // PCM
    const bitDepth = 16

    const result = new Float32Array(buffer.length * numChannels)
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel)
        for (let i = 0; i < buffer.length; i++) {
            result[i * numChannels + channel] = channelData[i]!
        }
    }

    const dataLength = result.length * (bitDepth / 8)
    const bufferArray = new ArrayBuffer(44 + dataLength)
    const view = new DataView(bufferArray)

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i))
        }
    }

    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + dataLength, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true)
    view.setUint16(32, numChannels * (bitDepth / 8), true)
    view.setUint16(34, bitDepth, true)
    writeString(view, 36, 'data')
    view.setUint32(40, dataLength, true)

    let offset = 44
    for (let i = 0; i < result.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, result[i]!))
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    }

    return new Blob([view], { type: 'audio/wav' })
}

/**
 * 离线渲染 Web Audio 特效 - 强化匿名版
 */
export async function applyVoiceMask(originalBlob: Blob, effectType?: string): Promise<Blob> {
    if (effectType === 'original' || !effectType) return originalBlob

    const arrayBuffer = await originalBlob.arrayBuffer()
    const AudioContextCtor = window.AudioContext || (window as WebAudioWindow).webkitAudioContext
    if (!AudioContextCtor) return originalBlob
    const ctx = new AudioContextCtor()
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

    const offlineCtx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate)

    const source = offlineCtx.createBufferSource()
    source.buffer = audioBuffer

    let lastNode: AudioNode = source

    if (effectType === 'robot') {
        // 机械音：高频环形调制 + 赛博粉碎
        const osc = offlineCtx.createOscillator()
        osc.type = 'sawtooth'
        osc.frequency.value = 250

        const gainNode = offlineCtx.createGain()
        gainNode.gain.value = 0.0

        const distortion = offlineCtx.createWaveShaper()
        const n_samples = 4096
        const curve = new Float32Array(n_samples)
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1
            curve[i] = Math.round(x * 4) / 4
        }
        distortion.curve = curve

        osc.connect(gainNode.gain)
        source.connect(distortion)
        distortion.connect(gainNode)

        lastNode = gainNode
        osc.start(0)
    } else if (effectType === 'deep') {
        // 匿名低沉音：重度低通滤波 + 浑厚失真
        const filter1 = offlineCtx.createBiquadFilter()
        filter1.type = 'lowpass'
        filter1.frequency.value = 400
        filter1.Q.value = 5.0

        const distortion = offlineCtx.createWaveShaper()
        function makeDistortionCurve(amount: number) {
            const k = typeof amount === 'number' ? amount : 150
            const n_samples = 44100
            const curve = new Float32Array(n_samples)
            let i = 0
            let x = 0
            for (; i < n_samples; ++i) {
                x = (i * 2) / n_samples - 1
                curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x))
            }
            return curve
        }
        distortion.curve = makeDistortionCurve(250) // 增加失真力度
        distortion.oversample = '4x'

        const compressor = offlineCtx.createDynamicsCompressor()
        compressor.threshold.value = -30

        source.connect(filter1)
        filter1.connect(distortion)
        distortion.connect(compressor)
        lastNode = compressor
    } else if (effectType === 'ethereal') {
        // 空灵音：深度多层迷幻延迟
        const delay1 = offlineCtx.createDelay()
        delay1.delayTime.value = 0.45
        const feedback1 = offlineCtx.createGain()
        feedback1.gain.value = 0.6

        const delay2 = offlineCtx.createDelay()
        delay2.delayTime.value = 0.85
        const feedback2 = offlineCtx.createGain()
        feedback2.gain.value = 0.4

        const lpf = offlineCtx.createBiquadFilter()
        lpf.type = 'lowpass'
        lpf.frequency.value = 1200

        const masterGain = offlineCtx.createGain()

        source.connect(masterGain)

        source.connect(delay1)
        delay1.connect(feedback1)
        feedback1.connect(delay1)
        delay1.connect(lpf)
        lpf.connect(masterGain)

        source.connect(delay2)
        delay2.connect(feedback2)
        feedback2.connect(delay2)
        delay2.connect(masterGain)

        lastNode = masterGain
    }

    lastNode.connect(offlineCtx.destination)
    source.start(0)

    const renderedBuffer = await offlineCtx.startRendering()
    return audioBufferToWav(renderedBuffer)
}
