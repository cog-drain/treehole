import request from '../request'
import type { ApiResponse } from '@/types'

export const fileApi = {
    // 上传文件 (图片/语音)
    upload: (formData: FormData) =>
        request.post<unknown, ApiResponse<string>>('/file/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
}
