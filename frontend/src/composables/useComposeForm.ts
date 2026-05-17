import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { ComposeFormDraft } from '@/types'

type PasteLikeEvent = ClipboardEvent & {
    originalEvent?: ClipboardEvent
}

export function useComposeForm() {
    const form = reactive<ComposeFormDraft>({ authorAlias: '', content: '', mood: '', theme: 'default' })
    const showTonePanel = ref(false)
    const toneSelectorRef = ref<HTMLElement | null>(null)
    const imageFile = ref<File | null>(null)
    const imagePreview = ref('')
    const isConfessionMode = ref(false)
    const clockNow = ref(new Date())
    const isMidnight = computed(() => {
        const hour = clockNow.value.getHours()
        return hour >= 0 && hour < 4
    })

    function setImagePreview(file: File) {
        if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
        imageFile.value = file
        imagePreview.value = URL.createObjectURL(file)
    }

    function onImageSelect(event: Event) {
        const input = event.target as HTMLInputElement | null
        const file = input?.files?.[0]
        if (file) setImagePreview(file)
    }

    function clearImage() {
        if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
        imageFile.value = null
        imagePreview.value = ''
    }

    function handlePaste(event: PasteLikeEvent) {
        const items = (event.clipboardData || event.originalEvent?.clipboardData)?.items
        if (!items) return
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile()
                if (file) {
                    setImagePreview(file)
                    ElMessage.success('已从剪贴板捕获图片 📸')
                }
            }
        }
    }

    function handleClickOutside(event: MouseEvent) {
        const target = event.target
        if (
            showTonePanel.value &&
            toneSelectorRef.value &&
            target instanceof Node &&
            !toneSelectorRef.value.contains(target)
        ) {
            showTonePanel.value = false
        }
    }

    function tickClock() {
        clockNow.value = new Date()
    }

    return {
        form,
        showTonePanel,
        toneSelectorRef,
        imageFile,
        imagePreview,
        isConfessionMode,
        clockNow,
        isMidnight,
        onImageSelect,
        clearImage,
        handlePaste,
        handleClickOutside,
        tickClock
    }
}
