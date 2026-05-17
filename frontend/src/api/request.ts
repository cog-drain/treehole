import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { getOrCreateUserIdentity } from '@/utils/clientIdentity'
import type { ApiResponse, UserIdentity } from '@/types'

const request = axios.create({
    baseURL: '/api',
    timeout: 20000
})

/** 获取或初始化本地身份 (MVP 方案) */
export function getUserIdentity(): UserIdentity {
    return getOrCreateUserIdentity()
}

// 请求拦截器
request.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const identity = getUserIdentity()
        config.headers['X-User-Id'] = identity.userId

        if (!config.headers['Authorization']) {
            config.headers['Authorization'] = `Bearer ${identity.userId}`
        }
        return config
    },
    error => Promise.reject(error)
)

type ApiResponseInterceptor = {
    use: (
        onFulfilled: (response: { data: ApiResponse }) => ApiResponse | Promise<never>,
        onRejected: (error: AxiosError<ApiResponse>) => Promise<never>
    ) => void
}

// 响应拦截器
;(request.interceptors.response as unknown as ApiResponseInterceptor).use(
    response => {
        const res = response.data as ApiResponse
        if (res.code !== undefined && res.code !== 200 && res.code !== 0) {
            ElMessage.error(res.msg || '请求失败')
            return Promise.reject(new Error(res.msg || 'Error'))
        }
        return res
    },
    (error: AxiosError<ApiResponse>) => {
        if (!window.navigator.onLine || error.message === 'Network Error' || error.code === 'ECONNABORTED') {
            // 离线处理逻辑交由具体模块或全局 UI 处理
        } else {
            const res = error.response && error.response.data
            if (res && res.msg) {
                ElMessage.error(res.msg)
            } else {
                ElMessage.error('服务响应异常')
            }
        }
        return Promise.reject(error)
    }
)

export default request
