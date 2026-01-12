// Tipos para URLs personalizadas
export interface UrlPattern {
  id: number
  pattern: string
  generated_url: string
  status: 'active' | 'inactive'
  is_active: boolean
  priority: number
  created_at: string
  updated_at: string
}

export interface UrlRedirect {
  id: number
  old_path: string
  new_path: string
  status_code: 301 | 302 | 307 | 308
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UrlPatternFormData {
  pattern: string
  priority: number
  is_active: boolean
}

export interface UrlRedirectFormData {
  old_path: string
  new_path: string
  status_code: 301 | 302 | 307 | 308
  is_active: boolean
}

export interface UrlFilters {
  search?: string
  is_active?: boolean
  page?: number
  per_page?: number
}

export interface UrlListResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}
