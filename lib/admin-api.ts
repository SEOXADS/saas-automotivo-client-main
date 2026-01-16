/**
 * Configuração centralizada da API do Admin
 * Centraliza URLs, headers e configurações da API
 */

export const ADMIN_API_CONFIG = {
  // URL base da API
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://www.api.omegaveiculos.com.br/api',

  // Headers padrão
  DEFAULT_HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },

  // Endpoints principais
  ENDPOINTS: {
    // Autenticação
    LOGIN: '/tenant/login',
    LOGOUT: '/tenant/logout',
    ME: '/tenant/me',

    // Dashboard
    DASHBOARD: '/dashboard',

    // Veículos
    VEHICLES: '/vehicles',
    VEHICLE_BY_ID: (id: number) => `/vehicles/${id}`,
    VEHICLE_IMAGES: (id: number) => `/vehicles/${id}/images`,

    // Leads
    LEADS: '/leads',
    LEAD_BY_ID: (id: number) => `/leads/${id}`,

    // Usuários
    USERS: '/users',
    USER_BY_ID: (id: number) => `/users/${id}`,

    // Relatórios
    REPORTS: '/reports',

    // Configurações
    SETTINGS: '/settings',
    TENANT_INFO: '/portal/tenant-info',

    // Marcas e modelos
    BRANDS: '/brands',
    MODELS: '/models',

    // Localizações - Endpoints públicos
    PUBLIC_COUNTRIES: '/locations/countries',
    PUBLIC_STATES: '/locations/states',
    PUBLIC_CITIES: '/locations/cities',
    PUBLIC_NEIGHBORHOODS: '/locations/neighborhoods',

    // Localizações - CRUD por tenant
    TENANT_COUNTRIES: '/tenant/locations/countries',
    TENANT_STATES: '/tenant/locations/states',
    TENANT_CITIES: '/tenant/locations/cities',
    TENANT_NEIGHBORHOODS: '/tenant/locations/neighborhoods',

    // URLs personalizadas
    TENANT_URL_PATTERNS: '/tenant/urls/patterns',
    TENANT_URL_REDIRECTS: '/tenant/urls/redirects',

    // Sitemap e SEO
    TENANT_SITEMAP_CONFIGS: '/tenant/sitemap/configs',
    TENANT_ROBOTS_TXT: '/tenant/robots-txt',
    GENERATE_SITEMAP: '/tenant/sitemap/generate',
    GENERATE_ROBOTS_TXT: '/tenant/robots-txt/generate',

    // Geração automática de URLs para veículos
    GENERATE_VEHICLE_URLS: '/tenant/vehicles/generate-urls',
    CHECK_URL_DUPLICATES: '/tenant/urls/check-duplicates',
    UPDATE_SITEMAP_ON_REDIRECT: '/tenant/sitemap/update-on-redirect',
    SPINTEXT_CONFIGS: '/tenant/spintext/configs',
    SYNTAXTEXT_CONFIGS: '/tenant/syntaxtext/configs',
    CANONICAL_URLS: '/tenant/canonical-urls',
  },

  // Configurações de timeout
  TIMEOUT: 10000, // 10 segundos

  // Configurações de retry
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 segundo
  }
}

/**
 * Classe para gerenciar requisições da API do Admin
 */
export class AdminApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor() {
    this.baseUrl = ADMIN_API_CONFIG.BASE_URL
    this.defaultHeaders = ADMIN_API_CONFIG.DEFAULT_HEADERS
  }

  /**
   * Faz uma requisição GET
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, headers)
  }

  /**
   * Faz uma requisição POST
   */
  async post<T>(endpoint: string, data?: Record<string, unknown>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', endpoint, data, headers)
  }

  /**
   * Faz uma requisição PUT
   */
  async put<T>(endpoint: string, data?: Record<string, unknown>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', endpoint, data, headers)
  }

  /**
   * Faz uma requisição DELETE
   */
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, headers)
  }

  /**
   * Método principal para fazer requisições
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: Record<string, unknown>,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = { ...this.defaultHeaders, ...customHeaders }

    // Adicionar token de autenticação se disponível
    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Adicionar subdomain do tenant se disponível
    const subdomain = this.getTenantSubdomain()
    if (subdomain) {
      headers['X-Tenant-Subdomain'] = subdomain
    }

    const config: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    }


    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error(`Erro na requisição ${method} ${url}:`, error)
      throw error
    }
  }

  /**
   * Obtém o token de autenticação
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null

    // Tentar obter do localStorage primeiro
    const demoToken = localStorage.getItem('demo_token')
    const fallbackToken = localStorage.getItem('fallback_token')

    if (demoToken) return demoToken
    if (fallbackToken) return fallbackToken

    // Tentar obter dos cookies
    const cookies = document.cookie.split(';')
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='))

    if (authCookie) {
      return authCookie.split('=')[1]
    }

    return null
  }

  /**
   * Obtém o subdomain do tenant
   */
  private getTenantSubdomain(): string | null {
    if (typeof window === 'undefined') return null

    // Tentar obter do localStorage primeiro
    const demoSubdomain = localStorage.getItem('demo_subdomain')
    const fallbackSubdomain = localStorage.getItem('fallback_subdomain')

    if (demoSubdomain) return demoSubdomain
    if (fallbackSubdomain) return fallbackSubdomain

    // Tentar obter dos cookies
    const cookies = document.cookie.split(';')
    const tenantCookie = cookies.find(cookie => cookie.trim().startsWith('tenant_subdomain='))

    if (tenantCookie) {
      return tenantCookie.split('=')[1]
    }

    return null
  }
}

// Instância singleton do cliente da API
export const adminApi = new AdminApiClient()

/**
 * Funções auxiliares para facilitar o uso
 */
export const adminApiHelpers = {
  /**
   * Busca dados do dashboard
   */
  async getDashboardData() {
    try {
      return await adminApi.get(ADMIN_API_CONFIG.ENDPOINTS.DASHBOARD)
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
      // Retornar dados mock em caso de erro
      return {
        stats: {
          total_vehicles: 0,
          available_vehicles: 0,
          total_leads: 0,
          new_leads: 0,
          total_users: 0,
          active_users: 0
        },
        recent_leads: [],
        recent_vehicles: []
      }
    }
  },

  /**
   * Busca lista de veículos
   */
  async getVehicles(params?: Record<string, string | number | boolean>) {
    try {
      const queryString = params ? new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          acc[key] = String(value)
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''
      const endpoint = queryString ? `${ADMIN_API_CONFIG.ENDPOINTS.VEHICLES}?${queryString}` : ADMIN_API_CONFIG.ENDPOINTS.VEHICLES
      return await adminApi.get(endpoint)
    } catch (error) {
      console.error('Erro ao buscar veículos:', error)
      return { data: [], total: 0, current_page: 1, last_page: 1 }
    }
  },

  /**
   * Busca lista de leads
   */
  async getLeads(params?: Record<string, string | number | boolean>) {
    try {
      const queryString = params ? new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          acc[key] = String(value)
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''
      const endpoint = queryString ? `${ADMIN_API_CONFIG.ENDPOINTS.LEADS}?${queryString}` : ADMIN_API_CONFIG.ENDPOINTS.LEADS
      return await adminApi.get(endpoint)
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
      return { data: [], total: 0, current_page: 1, last_page: 1 }
    }
  },

  /**
   * Busca lista de usuários
   */
  async getUsers(params?: Record<string, string | number | boolean>) {
    try {
      const queryString = params ? new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          acc[key] = String(value)
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''
      const endpoint = queryString ? `${ADMIN_API_CONFIG.ENDPOINTS.USERS}?${queryString}` : ADMIN_API_CONFIG.ENDPOINTS.USERS
      return await adminApi.get(endpoint)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      return { data: [], total: 0, current_page: 1, last_page: 1 }
    }
  },

  /**
   * Busca informações do tenant
   */
  async getTenantInfo() {
    try {
      return await adminApi.get(ADMIN_API_CONFIG.ENDPOINTS.TENANT_INFO)
    } catch (error) {
      console.error('Erro ao buscar informações do tenant:', error)
      return null
    }
  }
}
