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
      return await adminApi.get(endpoint)
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
      const response = await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_SITEMAP_CONFIGS}/${id}`) as { data?: SitemapConfig }
      return response.data || null
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
      const response = await adminApi.post(ADMIN_API_CONFIG.ENDPOINTS.TENANT_SITEMAP_CONFIGS, data as unknown as Record<string, unknown>) as { data?: SitemapConfig }
      return response.data || null
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
      const response = await adminApi.put(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_SITEMAP_CONFIGS}/${id}`, data as unknown as Record<string, unknown>) as { data?: SitemapConfig }
      return response.data || null
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
      await adminApi.delete(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_SITEMAP_CONFIGS}/${id}`)
      return true
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
      const response = await adminApi.get(ADMIN_API_CONFIG.ENDPOINTS.TENANT_ROBOTS_TXT) as { data?: RobotsTxtConfig }
      return response.data || null
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
      const response = await adminApi.put(ADMIN_API_CONFIG.ENDPOINTS.TENANT_ROBOTS_TXT, data as unknown as Record<string, unknown>) as { data?: RobotsTxtConfig }
      return response.data || null
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
      const response = await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_ROBOTS_TXT}/preview`) as { data?: { content: string } }
      return response.data || { content: '' }
    } catch (error) {
      console.error('Erro ao buscar preview do robots.txt:', error)
      return { content: '' }
    }
  },

  // ===== GERAÇÃO DE ARQUIVOS =====

  /**
   * Gera sitemap.xml
   */
  async generateSitemap(type?: string): Promise<{ success: boolean; url?: string; message?: string }> {
    try {
      console.log('🗺️ Tentando gerar sitemap...')
      console.log('📋 Tipo:', type || 'todos os tipos')

      const endpoint = type ? `${ADMIN_API_CONFIG.ENDPOINTS.GENERATE_SITEMAP}?type=${type}` : ADMIN_API_CONFIG.ENDPOINTS.GENERATE_SITEMAP
      console.log('🔗 Endpoint:', endpoint)

      const response = await adminApi.post(endpoint) as { data?: { success: boolean; url?: string; message?: string } }
      console.log('📥 Resposta da API:', response)

      const result = response.data || { success: false, message: 'Erro ao gerar sitemap' }
      console.log('✅ Resultado final:', result)

      return result
    } catch (error) {
      console.error('❌ Erro ao gerar sitemap:', error)
      console.error('📋 Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      })

      // Verificar se é erro de autenticação ou endpoint não disponível
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
   * Gera robots.txt
   */
  async generateRobotsTxt(): Promise<{ success: boolean; url?: string; message?: string }> {
    try {
      console.log('🤖 Tentando gerar robots.txt...')
      console.log('🔗 Endpoint:', ADMIN_API_CONFIG.ENDPOINTS.GENERATE_ROBOTS_TXT)

      const response = await adminApi.post(ADMIN_API_CONFIG.ENDPOINTS.GENERATE_ROBOTS_TXT) as { data?: { success: boolean; url?: string; message?: string } }
      console.log('📥 Resposta da API:', response)

      const result = response.data || { success: false, message: 'Erro ao gerar robots.txt' }
      console.log('✅ Resultado final:', result)

      return result
    } catch (error) {
      console.error('❌ Erro ao gerar robots.txt:', error)
      console.error('📋 Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      })

      // Verificar se é erro de autenticação ou endpoint não disponível
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
      const response = await adminApi.get('/tenant/sitemap/stats') as { data?: {
        total_configs: number
        active_configs: number
        inactive_configs: number
        last_generated: string | null
        total_urls: number
        sitemap_size: number
      }}
      return response.data || {
        total_configs: 0,
        active_configs: 0,
        inactive_configs: 0,
        last_generated: null,
        total_urls: 0,
        sitemap_size: 0
      }
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
