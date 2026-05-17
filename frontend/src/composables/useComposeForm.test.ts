import { describe, expect, it, vi } from 'vitest'
import { useComposeForm } from './useComposeForm'

describe('useComposeForm', () => {
    it('initializes compose state', () => {
        const compose = useComposeForm()

        expect(compose.form).toMatchObject({
            authorAlias: '',
            content: '',
            mood: '',
            theme: 'default'
        })
        expect(compose.imageFile.value).toBeNull()
        expect(compose.imagePreview.value).toBe('')
        expect(compose.isConfessionMode.value).toBe(false)
    })

    it('computes midnight window from clock state', () => {
        const compose = useComposeForm()

        compose.clockNow.value = new Date('2026-05-16T02:30:00')
        expect(compose.isMidnight.value).toBe(true)

        compose.clockNow.value = new Date('2026-05-16T12:30:00')
        expect(compose.isMidnight.value).toBe(false)
    })

    it('captures and clears selected images', () => {
        const createObjectURL = vi.fn(() => 'blob:preview')
        vi.stubGlobal('URL', { createObjectURL })

        const compose = useComposeForm()
        const file = new File(['image'], 'image.png', { type: 'image/png' })
        const event = { target: { files: [file] } } as unknown as Event

        compose.onImageSelect(event)
        expect(compose.imageFile.value).toBe(file)
        expect(compose.imagePreview.value).toBe('blob:preview')

        compose.clearImage()
        expect(compose.imageFile.value).toBeNull()
        expect(compose.imagePreview.value).toBe('')
    })
})
