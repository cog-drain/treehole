export interface ApiResponse<T = unknown> {
    code: number
    msg?: string
    data: T
}

export interface ApiErrorResponse<T = unknown> {
    code?: number
    msg?: string
    message?: string
    data?: T
}

export interface PageResult<T> {
    records?: T[]
    list?: T[]
    total: number
    current?: number
    size?: number
}

export interface NormalizedPageResult<T> {
    records: T[]
    total: number
    current?: number
    size?: number
}

export type Id = number | string

export interface PageParams {
    pageNum?: number
    pageSize?: number
    tag?: string
}

export interface NotificationPageParams {
    pageNum?: number
    pageSize?: number
    unreadOnly?: boolean
}

export interface UnreadCountResponse {
    unreadCount: number
}

export function toApiId(id: Id): string {
    return String(id)
}

export function isSameApiId(left: Id | null | undefined, right: Id | null | undefined): boolean {
    if (left === null || left === undefined || right === null || right === undefined) {
        return false
    }

    return toApiId(left) === toApiId(right)
}

export function normalizePageResult<T>(page: PageResult<T>): NormalizedPageResult<T> {
    return {
        records: page.records ?? page.list ?? [],
        total: page.total,
        current: page.current,
        size: page.size
    }
}

export function getApiErrorMessage(error: ApiErrorResponse | Error | unknown, fallback = '请求失败'): string {
    if (error instanceof Error && error.message) {
        return error.message
    }

    if (typeof error === 'object' && error !== null) {
        const response = error as ApiErrorResponse
        return response.msg || response.message || fallback
    }

    return fallback
}
