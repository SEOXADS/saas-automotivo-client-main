import { adminApi, ADMIN_API_CONFIG } from './admin-api'
import {
  SitemapConfig,
  RobotsTxtConfig,
  SitemapFormData,
  RobotsTxtFormData,
  SitemapFilters,
  SitemapListResponse
} from '@/types/sitemap'

export const sitemapApiHelpers = {
  // ===== CONFIGURAÇÕES DE SITEMAP =====

  /**
   * Busca lista de configurações de sitemap do tenant
   */
  async getTenantSitemapConfigs(filters?: SitemapFilters): Promise<SitemapListResponse<SitemapConfig>> {
    try {
      const queryString = filters ? new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
          .map(([key, value]) => [key, String(value)])
      ).toString() : ''

      const endpoint = queryString ? `${ADMIN_API_CONFIG.ENDPOINTS.TENANT_SITEMAP_CONFIGS}?${queryString}` : ADMIN_API_CONFIG.ENDPOINTS.TENANT_SITEMAP_CONFIGS
      const response = await adminApi.get(endpoint) as SitemapListResponse<SitemapConfig> & { data?: SitemapConfig[] }
      
      // ✅ FIX: Handle both response formats
      if (response && typeof response === 'object') {
        // If response has nested data property
        if ('data' in response && Array.isArray(response.data)) {
          return response as SitemapListResponse<SitemapConfig>
        }
        // If response is already the list response
        if ('current_page' in response) {
          return response as SitemapListResponse<SitemapConfig>
        }
      }
      
      return { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 }
    } catch (error) {
      console.error('Erro ao buscar configurações de sitemap:', error)
      return { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 }
    }
  },

  /**
   * Busca configuração de sitemap do tenant por ID
   */
  async getTenantSitemapConfig(id: number): Promise<SitemapConfig | null> {
    try {
      const response = await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_SITEMAP_CONFIGS}/${id}`) as { data?: SitemapConfig } | SitemapConfig
      
      // ✅ FIX: Handle both response formats
      if (response && typeof response === 'object') {
        if ('data' in response && response.data) {
          return response.data
        }
        if ('id' in response) {
          return response as SitemapConfig
        }
      }
      return null
    } catch (error) {
      console.error('Erro ao buscar configuração de sitemap:', error)
      return null
    }
  },

  /**
   * Cria nova configuração de sitemap para o tenant
   */
  async createTenantSitemapConfig(data: SitemapFormData): Promise<SitemapConfig | null> {
    try {
      const response = await adminApi.post(ADMIN_API_CONFIG.ENDPOINTS.TENANT_SITEMAP_CONFIGS, data as unknown as Record<string, unknown>) as { data?: SitemapConfig; success?: boolean } | SitemapConfig
      
      // ✅ FIX: Handle both response formats
      if (response && typeof response === 'object') {
        if ('data' in response && response.data) {
          return response.data
        }
        if ('id' in response) {
          return response as SitemapConfig
        }
      }
      return null
    } catch (error) {
      console.error('Erro ao criar configuração de sitemap:', error)
      return null
    }
  },

  /**
   * Atualiza configuração de sitemap do tenant
   */
  async updateTenantSitemapConfig(id: number, data: SitemapFormData): Promise<SitemapConfig | null> {
    try {
      const response = await adminApi.put(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_SITEMAP_CONFIGS}/${id}`, data as unknown as Record<string, unknown>) as { data?: SitemapConfig } | SitemapConfig
      
      // ✅ FIX: Handle both response formats
      if (response && typeof response === 'object') {
        if ('data' in response && response.data) {
          return response.data
        }
        if ('id' in response) {
          return response as SitemapConfig
        }
      }
      return null
    } catch (error) {
      console.error('Erro ao atualizar configuração de sitemap:', error)
      return null
    }
  },

  /**
   * Exclui configuração de sitemap do tenant
   */
  async deleteTenantSitemapConfig(id: number): Promise<boolean> {
    try {
      const response = await adminApi.delete(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_SITEMAP_CONFIGS}/${id}`) as { success?: boolean } | boolean
      
      // ✅ FIX: Handle both response formats
      if (typeof response === 'boolean') {
        return response
      }
      if (response && typeof response === 'object' && 'success' in response) {
        return response.success === true
      }
      return true // Assume success if no error thrown
    } catch (error) {
      console.error('Erro ao excluir configuração de sitemap:', error)
      return false
    }
  },

  // ===== ROBOTS.TXT =====

  /**
   * Busca configuração de robots.txt do tenant
   */
  async getTenantRobotsTxt(): Promise<RobotsTxtConfig | null> {
    try {
      const response = await adminApi.get(ADMIN_API_CONFIG.ENDPOINTS.TENANT_ROBOTS_TXT) as { data?: RobotsTxtConfig } | RobotsTxtConfig
      
      if (response && typeof response === 'object') {
        if ('data' in response && response.data) {
          return response.data
        }
        if ('content' in response || 'id' in response) {
          return response as RobotsTxtConfig
        }
      }
      return null
    } catch (error) {
      console.error('Erro ao buscar configuração de robots.txt:', error)
      return null
    }
  },

  /**
   * Atualiza configuração de robots.txt do tenant
   */
  async updateTenantRobotsTxt(data: RobotsTxtFormData): Promise<RobotsTxtConfig | null> {
    try {
      const response = await adminApi.put(ADMIN_API_CONFIG.ENDPOINTS.TENANT_ROBOTS_TXT, data as unknown as Record<string, unknown>) as { data?: RobotsTxtConfig } | RobotsTxtConfig
      
      if (response && typeof response === 'object') {
        if ('data' in response && response.data) {
          return response.data
        }
        if ('content' in response || 'id' in response) {
          return response as RobotsTxtConfig
        }
      }
      return null
    } catch (error) {
      console.error('Erro ao atualizar configuração de robots.txt:', error)
      return null
    }
  },

  /**
   * Preview do conteúdo do robots.txt
   */
  async getTenantRobotsTxtPreview(): Promise<{ content: string }> {
    try {
      const response = await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_ROBOTS_TXT}/preview`) as { data?: { content: string }; content?: string }
      
      if (response && typeof response === 'object') {
        if ('data' in response && response.data) {
          return response.data
        }
        if ('content' in response) {
          return { content: response.content || '' }
        }
      }
      return { content: '' }
    } catch (error) {
      console.error('Erro ao buscar preview do robots.txt:', error)
      return { content: '' }
    }
  },

  // ===== GERAÇÃO DE ARQUIVOS =====

  /**
   * Gera sitemap.xml - ✅ FIXED VERSION
   */
  async generateSitemap(type?: string): Promise<{ success: boolean; url?: string; message?: string; file_path?: string; generated_at?: string | number }> {
    try {
      console.log('🗺️ Tentando gerar sitemap...')
      console.log('📋 Tipo:', type || 'todos os tipos')

      const endpoint = type 
        ? `${ADMIN_API_CONFIG.ENDPOINTS.GENERATE_SITEMAP}?type=${type}` 
        : ADMIN_API_CONFIG.ENDPOINTS.GENERATE_SITEMAP
      console.log('🔗 Endpoint:', endpoint)

      const response = await adminApi.post(endpoint) as { 
        success?: boolean
        url?: string
        message?: string
        file_path?: string
        generated_at?: string | number
        data?: {
          success: boolean
          url?: string
          message?: string
          file_path?: string
          generated_at?: string | number
        }
      }
      
      console.log('📥 Resposta da API:', response)

      // ✅ FIX: Handle BOTH response formats
      // Format 1: { success: true, message: "...", url: "..." } (direct)
      // Format 2: { data: { success: true, message: "...", url: "..." } } (wrapped)
      
      let result: { success: boolean; url?: string; message?: string; file_path?: string; generated_at?: string | number }

      if (response && typeof response === 'object') {
        // Check if response has nested 'data' property with 'success'
        if ('data' in response && response.data && typeof response.data === 'object' && 'success' in response.data) {
          result = {
            success: response.data.success === true,
            message: response.data.message,
            url: response.data.url,
            file_path: response.data.file_path,
            generated_at: response.data.generated_at
          }
        }
        // Check if response itself has 'success' property (direct format)
        else if ('success' in response) {
          result = {
            success: response.success === true,
            message: response.message,
            url: response.url,
            file_path: response.file_path,
            generated_at: response.generated_at
          }
        }
        // Fallback
        else {
          result = { success: false, message: 'Resposta inválida da API' }
        }
      } else {
        result = { success: false, message: 'Resposta vazia da API' }
      }

      console.log('✅ Resultado final:', result)
      return result

    } catch (error) {
      console.error('❌ Erro ao gerar sitemap:', error)
      console.error('📋 Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      })

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      if (errorMessage.includes('401') || errorMessage.includes('Unauthenticated')) {
        return {
          success: false,
          message: 'Token de autenticação expirado. Faça login novamente.'
        }
      } else if (errorMessage.includes('404')) {
        return {
          success: false,
          message: 'Endpoint de geração de sitemap não está disponível no backend.'
        }
      }

      return { success: false, message: 'Erro ao gerar sitemap' }
    }
  },

  /**
   * Gera robots.txt - ✅ FIXED VERSION
   */
  async generateRobotsTxt(): Promise<{ success: boolean; url?: string; message?: string }> {
    try {
      console.log('🤖 Tentando gerar robots.txt...')
      console.log('🔗 Endpoint:', ADMIN_API_CONFIG.ENDPOINTS.GENERATE_ROBOTS_TXT)

      const response = await adminApi.post(ADMIN_API_CONFIG.ENDPOINTS.GENERATE_ROBOTS_TXT) as {
        success?: boolean
        url?: string
        message?: string
        data?: {
          success: boolean
          url?: string
          message?: string
        }
      }
      
      console.log('📥 Resposta da API:', response)

      // ✅ FIX: Handle BOTH response formats
      let result: { success: boolean; url?: string; message?: string }

      if (response && typeof response === 'object') {
        if ('data' in response && response.data && typeof response.data === 'object' && 'success' in response.data) {
          result = {
            success: response.data.success === true,
            message: response.data.message,
            url: response.data.url
          }
        } else if ('success' in response) {
          result = {
            success: response.success === true,
            message: response.message,
            url: response.url
          }
        } else {
          result = { success: false, message: 'Resposta inválida da API' }
        }
      } else {
        result = { success: false, message: 'Resposta vazia da API' }
      }

      console.log('✅ Resultado final:', result)
      return result

    } catch (error) {
      console.error('❌ Erro ao gerar robots.txt:', error)
      console.error('📋 Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      })

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      if (errorMessage.includes('401') || errorMessage.includes('Unauthenticated')) {
        return {
          success: false,
          message: 'Token de autenticação expirado. Faça login novamente.'
        }
      } else if (errorMessage.includes('404')) {
        return {
          success: false,
          message: 'Endpoint de geração de robots.txt não está disponível no backend.'
        }
      }

      return { success: false, message: 'Erro ao gerar robots.txt' }
    }
  },

  /**
   * Save raw robots.txt content
   */
  async saveRobotsTxtContent(content: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('📝 Salvando robots.txt...')
      
      const response = await adminApi.post(
        `${ADMIN_API_CONFIG.ENDPOINTS.TENANT_ROBOTS_TXT}/save`,
        { content } as Record<string, unknown>
      ) as { success?: boolean; message?: string; data?: { success: boolean; message?: string } }
      
      console.log('✅ Resposta:', response)
      
      // ✅ FIX: Handle both response formats
      if (response && typeof response === 'object') {
        if ('data' in response && response.data && typeof response.data === 'object') {
          return {
            success: response.data.success ?? true,
            message: response.data.message ?? 'Robots.txt salvo com sucesso'
          }
        }
        if ('success' in response) {
          return {
            success: response.success ?? true,
            message: response.message ?? 'Robots.txt salvo com sucesso'
          }
        }
      }
      
      return { success: true, message: 'Robots.txt salvo com sucesso' }
    } catch (error) {
      console.error('❌ Erro ao salvar robots.txt:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao salvar robots.txt'
      }
    }
  },

  // ===== ESTATÍSTICAS =====

  /**
   * Busca estatísticas de sitemap do tenant
   */
  async getTenantSitemapStats(): Promise<{
    total_configs: number
    active_configs: number
    inactive_configs: number
    last_generated: string | null
    total_urls: number
    sitemap_size: number
  }> {
    try {
      const response = await adminApi.get('/tenant/sitemap/stats') as {
        data?: {
          total_configs: number
          active_configs: number
          inactive_configs: number
          last_generated: string | null
          total_urls: number
          sitemap_size: number
        }
        total_configs?: number
        active_configs?: number
        inactive_configs?: number
        last_generated?: string | null
        total_urls?: number
        sitemap_size?: number
      }
      
      const defaultStats = {
        total_configs: 0,
        active_configs: 0,
        inactive_configs: 0,
        last_generated: null,
        total_urls: 0,
        sitemap_size: 0
      }
      
      // ✅ FIX: Handle both response formats
      if (response && typeof response === 'object') {
        if ('data' in response && response.data) {
          return { ...defaultStats, ...response.data }
        }
        if ('total_configs' in response) {
          return {
            total_configs: response.total_configs ?? 0,
            active_configs: response.active_configs ?? 0,
            inactive_configs: response.inactive_configs ?? 0,
            last_generated: response.last_generated ?? null,
            total_urls: response.total_urls ?? 0,
            sitemap_size: response.sitemap_size ?? 0
          }
        }
      }
      
      return defaultStats
    } catch (error) {
      console.error('Erro ao buscar estatísticas de sitemap:', error)
      return {
        total_configs: 0,
        active_configs: 0,
        inactive_configs: 0,
        last_generated: null,
        total_urls: 0,
        sitemap_size: 0
      }
    }
  }
}
