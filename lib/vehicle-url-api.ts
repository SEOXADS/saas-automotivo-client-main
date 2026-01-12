import { adminApi, ADMIN_API_CONFIG } from './admin-api'
import {
  UrlGenerationRequest,
  UrlGenerationResponse,
  SpinTextConfig,
  SyntaxTextConfig,
  CanonicalUrlConfig,
  UrlDuplicateCheck,
  SitemapUpdateRequest
} from '@/types/vehicle-urls'

export const vehicleUrlApiHelpers = {
  // ===== GERAÇÃO AUTOMÁTICA DE URLs =====

  /**
   * Gera todas as URLs possíveis para um veículo
   */
  async generateVehicleUrls(request: UrlGenerationRequest): Promise<UrlGenerationResponse> {
    try {
      const response = await adminApi.post(
        ADMIN_API_CONFIG.ENDPOINTS.GENERATE_VEHICLE_URLS,
        request as unknown as Record<string, unknown>
      ) as { data?: UrlGenerationResponse }
      return response.data || {
        success: false,
        generated_urls: [],
        duplicates_found: [],
        sitemap_updated: false,
        message: 'Erro ao gerar URLs'
      }
    } catch (error) {
      console.error('Erro ao gerar URLs do veículo:', error)
      return {
        success: false,
        generated_urls: [],
        duplicates_found: [],
        sitemap_updated: false,
        message: 'Erro ao gerar URLs'
      }
    }
  },

  /**
   * Verifica duplicidades de URLs
   */
  async checkUrlDuplicates(urls: string[]): Promise<UrlDuplicateCheck[]> {
    try {
      const response = await adminApi.post(
        ADMIN_API_CONFIG.ENDPOINTS.CHECK_URL_DUPLICATES,
        { urls } as unknown as Record<string, unknown>
      ) as { data?: UrlDuplicateCheck[] }
      return response.data || []
    } catch (error) {
      console.error('Erro ao verificar duplicidades:', error)
      return []
    }
  },

  /**
   * Atualiza sitemap quando há redirect
   */
  async updateSitemapOnRedirect(request: SitemapUpdateRequest): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await adminApi.post(
        ADMIN_API_CONFIG.ENDPOINTS.UPDATE_SITEMAP_ON_REDIRECT,
        request as unknown as Record<string, unknown>
      ) as { data?: { success: boolean; message?: string } }
      return response.data || { success: false, message: 'Erro ao atualizar sitemap' }
    } catch (error) {
      console.error('Erro ao atualizar sitemap:', error)
      return { success: false, message: 'Erro ao atualizar sitemap' }
    }
  },

  // ===== CONFIGURAÇÕES SPINTEXT =====

  /**
   * Busca configurações do SpinText
   */
  async getSpinTextConfigs(): Promise<SpinTextConfig[]> {
    try {
      const response = await adminApi.get(ADMIN_API_CONFIG.ENDPOINTS.SPINTEXT_CONFIGS) as { data?: SpinTextConfig[] }
      return response.data || []
    } catch (error) {
      console.error('Erro ao buscar configurações do SpinText:', error)
      return []
    }
  },

  /**
   * Cria configuração do SpinText
   */
  async createSpinTextConfig(data: Omit<SpinTextConfig, 'id' | 'created_at' | 'updated_at'>): Promise<SpinTextConfig | null> {
    try {
      const response = await adminApi.post(
        ADMIN_API_CONFIG.ENDPOINTS.SPINTEXT_CONFIGS,
        data as unknown as Record<string, unknown>
      ) as { data?: SpinTextConfig }
      return response.data || null
    } catch (error) {
      console.error('Erro ao criar configuração do SpinText:', error)
      return null
    }
  },

  /**
   * Atualiza configuração do SpinText
   */
  async updateSpinTextConfig(id: number, data: Omit<SpinTextConfig, 'id' | 'created_at' | 'updated_at'>): Promise<SpinTextConfig | null> {
    try {
      const response = await adminApi.put(
        `${ADMIN_API_CONFIG.ENDPOINTS.SPINTEXT_CONFIGS}/${id}`,
        data as unknown as Record<string, unknown>
      ) as { data?: SpinTextConfig }
      return response.data || null
    } catch (error) {
      console.error('Erro ao atualizar configuração do SpinText:', error)
      return null
    }
  },

  /**
   * Exclui configuração do SpinText
   */
  async deleteSpinTextConfig(id: number): Promise<boolean> {
    try {
      await adminApi.delete(`${ADMIN_API_CONFIG.ENDPOINTS.SPINTEXT_CONFIGS}/${id}`)
      return true
    } catch (error) {
      console.error('Erro ao excluir configuração do SpinText:', error)
      return false
    }
  },

  // ===== CONFIGURAÇÕES SYNTAXTEXT =====

  /**
   * Busca configurações do SyntaxText
   */
  async getSyntaxTextConfigs(): Promise<SyntaxTextConfig[]> {
    try {
      const response = await adminApi.get(ADMIN_API_CONFIG.ENDPOINTS.SYNTAXTEXT_CONFIGS) as { data?: SyntaxTextConfig[] }
      return response.data || []
    } catch (error) {
      console.error('Erro ao buscar configurações do SyntaxText:', error)
      return []
    }
  },

  /**
   * Cria configuração do SyntaxText
   */
  async createSyntaxTextConfig(data: Omit<SyntaxTextConfig, 'id' | 'created_at' | 'updated_at'>): Promise<SyntaxTextConfig | null> {
    try {
      const response = await adminApi.post(
        ADMIN_API_CONFIG.ENDPOINTS.SYNTAXTEXT_CONFIGS,
        data as unknown as Record<string, unknown>
      ) as { data?: SyntaxTextConfig }
      return response.data || null
    } catch (error) {
      console.error('Erro ao criar configuração do SyntaxText:', error)
      return null
    }
  },

  /**
   * Atualiza configuração do SyntaxText
   */
  async updateSyntaxTextConfig(id: number, data: Omit<SyntaxTextConfig, 'id' | 'created_at' | 'updated_at'>): Promise<SyntaxTextConfig | null> {
    try {
      const response = await adminApi.put(
        `${ADMIN_API_CONFIG.ENDPOINTS.SYNTAXTEXT_CONFIGS}/${id}`,
        data as unknown as Record<string, unknown>
      ) as { data?: SyntaxTextConfig }
      return response.data || null
    } catch (error) {
      console.error('Erro ao atualizar configuração do SyntaxText:', error)
      return null
    }
  },

  /**
   * Exclui configuração do SyntaxText
   */
  async deleteSyntaxTextConfig(id: number): Promise<boolean> {
    try {
      await adminApi.delete(`${ADMIN_API_CONFIG.ENDPOINTS.SYNTAXTEXT_CONFIGS}/${id}`)
      return true
    } catch (error) {
      console.error('Erro ao excluir configuração do SyntaxText:', error)
      return false
    }
  },

  // ===== URLs CANÔNICAS =====

  /**
   * Busca URLs canônicas por veículo
   */
  async getCanonicalUrlsByVehicle(vehicleId: number): Promise<CanonicalUrlConfig[]> {
    try {
      const response = await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.CANONICAL_URLS}?vehicle_id=${vehicleId}`) as { data?: CanonicalUrlConfig[] }
      return response.data || []
    } catch (error) {
      console.error('Erro ao buscar URLs canônicas:', error)
      return []
    }
  },

  /**
   * Cria URL canônica
   */
  async createCanonicalUrl(data: Omit<CanonicalUrlConfig, 'id' | 'created_at' | 'updated_at'>): Promise<CanonicalUrlConfig | null> {
    try {
      const response = await adminApi.post(
        ADMIN_API_CONFIG.ENDPOINTS.CANONICAL_URLS,
        data as unknown as Record<string, unknown>
      ) as { data?: CanonicalUrlConfig }
      return response.data || null
    } catch (error) {
      console.error('Erro ao criar URL canônica:', error)
      return null
    }
  },

  /**
   * Atualiza URL canônica
   */
  async updateCanonicalUrl(id: number, data: Omit<CanonicalUrlConfig, 'id' | 'created_at' | 'updated_at'>): Promise<CanonicalUrlConfig | null> {
    try {
      const response = await adminApi.put(
        `${ADMIN_API_CONFIG.ENDPOINTS.CANONICAL_URLS}/${id}`,
        data as unknown as Record<string, unknown>
      ) as { data?: CanonicalUrlConfig }
      return response.data || null
    } catch (error) {
      console.error('Erro ao atualizar URL canônica:', error)
      return null
    }
  },

  /**
   * Exclui URL canônica
   */
  async deleteCanonicalUrl(id: number): Promise<boolean> {
    try {
      await adminApi.delete(`${ADMIN_API_CONFIG.ENDPOINTS.CANONICAL_URLS}/${id}`)
      return true
    } catch (error) {
      console.error('Erro ao excluir URL canônica:', error)
      return false
    }
  }
}
