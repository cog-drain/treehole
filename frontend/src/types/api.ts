export interface ApiResponse<T = unknown> {
  code: number
  msg?: string
  data: T
}

export interface PageResult<T> {
  records?: T[]
  list?: T[]
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
