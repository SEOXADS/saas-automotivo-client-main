import { adminApi, ADMIN_API_CONFIG } from './admin-api'
import {
  UrlPattern,
  UrlRedirect,
  UrlPatternFormData,
  UrlRedirectFormData,
  UrlFilters,
  UrlListResponse
} from '@/types/url'

export const urlApiHelpers = {
  // ===== PATTERNS DE URL =====

  /**
   * Busca lista de patterns de URL do tenant
   */
  async getTenantUrlPatterns(filters?: UrlFilters): Promise<UrlListResponse<UrlPattern>> {
    try {
      const queryString = filters ? new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
          .map(([key, value]) => [key, String(value)])
      ).toString() : ''

      const endpoint = queryString ? `${ADMIN_API_CONFIG.ENDPOINTS.TENANT_URL_PATTERNS}?${queryString}` : ADMIN_API_CONFIG.ENDPOINTS.TENANT_URL_PATTERNS
      const response = await adminApi.get(endpoint) as {
        data?: UrlPattern[],
        current_page?: number,
        last_page?: number,
        per_page?: number,
        total?: number,
        from?: number,
        to?: number
      }

      return {
        data: response.data || [],
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
        per_page: response.per_page || 10,
        total: response.total || 0,
        from: response.from || 0,
        to: response.to || 0,
      }
    } catch (error) {
      console.error('Erro ao buscar patterns de URL:', error)
      return { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 }
    }
  },

  /**
   * Busca pattern de URL do tenant por ID
   */
  async getTenantUrlPattern(id: number): Promise<UrlPattern | null> {
    try {
      const response = await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_URL_PATTERNS}/${id}`) as { data?: UrlPattern }
      return response.data || null
    } catch (error) {
      console.error('Erro ao buscar pattern de URL:', error)
      return null
    }
  },

  /**
   * Cria novo pattern de URL para o tenant
   */
  async createTenantUrlPattern(data: UrlPatternFormData): Promise<UrlPattern | null> {
    try {
      const response = await adminApi.post(ADMIN_API_CONFIG.ENDPOINTS.TENANT_URL_PATTERNS, data as unknown as Record<string, unknown>) as { data?: UrlPattern }
      return response.data || null
    } catch (error) {
      console.error('Erro ao criar pattern de URL:', error)
      return null
    }
  },

  /**
   * Atualiza pattern de URL do tenant
   */
  async updateTenantUrlPattern(id: number, data: UrlPatternFormData): Promise<UrlPattern | null> {
    try {
      const response = await adminApi.put(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_URL_PATTERNS}/${id}`, data as unknown as Record<string, unknown>) as { data?: UrlPattern }
      return response.data || null
    } catch (error) {
      console.error('Erro ao atualizar pattern de URL:', error)
      return null
    }
  },

  /**
   * Exclui pattern de URL do tenant
   */
  async deleteTenantUrlPattern(id: number): Promise<boolean> {
    try {
      await adminApi.delete(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_URL_PATTERNS}/${id}`)
      return true
    } catch (error) {
      console.error('Erro ao excluir pattern de URL:', error)
      return false
    }
  },

  // ===== REDIRECTS DE URL =====

  /**
   * Busca lista de redirects de URL do tenant
   */
  async getTenantUrlRedirects(filters?: UrlFilters): Promise<UrlListResponse<UrlRedirect>> {
    try {
      const queryString = filters ? new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
          .map(([key, value]) => [key, String(value)])
      ).toString() : ''

      const endpoint = queryString ? `${ADMIN_API_CONFIG.ENDPOINTS.TENANT_URL_REDIRECTS}?${queryString}` : ADMIN_API_CONFIG.ENDPOINTS.TENANT_URL_REDIRECTS
      return await adminApi.get(endpoint)
    } catch (error) {
      console.error('Erro ao buscar redirects de URL:', error)
      return { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 }
    }
  },

  /**
   * Busca redirect de URL do tenant por ID
   */
  async getTenantUrlRedirect(id: number): Promise<UrlRedirect | null> {
    try {
      const response = await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_URL_REDIRECTS}/${id}`) as { data?: UrlRedirect }
      return response.data || null
    } catch (error) {
      console.error('Erro ao buscar redirect de URL:', error)
      return null
    }
  },

  /**
   * Cria novo redirect de URL para o tenant
   */
  async createTenantUrlRedirect(data: UrlRedirectFormData): Promise<UrlRedirect | null> {
    try {
      const response = await adminApi.post(ADMIN_API_CONFIG.ENDPOINTS.TENANT_URL_REDIRECTS, data as unknown as Record<string, unknown>) as { data?: UrlRedirect }
      return response.data || null
    } catch (error) {
      console.error('Erro ao criar redirect de URL:', error)
      return null
    }
  },

  /**
   * Atualiza redirect de URL do tenant
   */
  async updateTenantUrlRedirect(id: number, data: UrlRedirectFormData): Promise<UrlRedirect | null> {
    try {
      const response = await adminApi.put(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_URL_REDIRECTS}/${id}`, data as unknown as Record<string, unknown>) as { data?: UrlRedirect }
      return response.data || null
    } catch (error) {
      console.error('Erro ao atualizar redirect de URL:', error)
      return null
    }
  },

  /**
   * Exclui redirect de URL do tenant
   */
  async deleteTenantUrlRedirect(id: number): Promise<boolean> {
    try {
      await adminApi.delete(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_URL_REDIRECTS}/${id}`)
      return true
    } catch (error) {
      console.error('Erro ao excluir redirect de URL:', error)
      return false
    }
  },

  // ===== ESTATÍSTICAS =====

  /**
   * Busca estatísticas de URLs do tenant
   */
  async getTenantUrlStats(): Promise<{
    total_patterns: number
    active_patterns: number
    inactive_patterns: number
    total_redirects: number
    active_redirects: number
    inactive_redirects: number
  }> {
    try {
      const response = await adminApi.get('/tenant/urls/stats') as { data?: {
        total_patterns: number
        active_patterns: number
        inactive_patterns: number
        total_redirects: number
        active_redirects: number
        inactive_redirects: number
      }}
      return response.data || {
        total_patterns: 0,
        active_patterns: 0,
        inactive_patterns: 0,
        total_redirects: 0,
        active_redirects: 0,
        inactive_redirects: 0
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de URLs:', error)
      return {
        total_patterns: 0,
        active_patterns: 0,
        inactive_patterns: 0,
        total_redirects: 0,
        active_redirects: 0,
        inactive_redirects: 0
      }
    }
  }
}
