import request from '../request'

export const fileApi = {
  // 上传文件 (图片/语音)
  upload: (formData) => request.post('/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
