/**
 * API helpers para gerenciamento de localizações
 * País -> Estado -> Cidade -> Bairro
 *
 * Estrutura da API:
 * - Endpoints públicos: /public/countries, /public/states, /public/cities, /public/neighborhoods
 * - CRUD por tenant: /tenant/countries, /tenant/states, /tenant/cities, /tenant/neighborhoods
 */

import { adminApi, ADMIN_API_CONFIG } from './admin-api'
import {
  Country,
  State,
  City,
  Neighborhood,
  CountryFormData,
  StateFormData,
  CityFormData,
  NeighborhoodFormData,
  TenantStateFormData,
  TenantCityFormData,
  TenantNeighborhoodFormData,
  LocationListResponse,
  LocationFilters
} from '@/types'

export const locationApiHelpers = 
{
  // ===== PAÍSES - ENDPOINTS PÚBLICOS =====

  /**
   * Busca lista de países públicos (dados globais da API)
   */
  async getPublicCountries(filters?: LocationFilters): Promise<LocationListResponse<Country>> {
    try {
      const queryString = filters ? new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''

      const endpoint = queryString ? `${ADMIN_API_CONFIG.ENDPOINTS.PUBLIC_COUNTRIES}?${queryString}` : ADMIN_API_CONFIG.ENDPOINTS.PUBLIC_COUNTRIES
      return await adminApi.get(endpoint)
    } catch (error) {
      console.error('Erro ao buscar países públicos:', error)
      return { data: [], current_page: 1, last_page: 1, per_page: 100, total: 0, from: 0, to: 0 }
    }
  },

  // ===== PAÍSES - CRUD POR TENANT =====

  /**
   * Busca lista de países do tenant
   */

  async getTenantCountries(user: any): Promise<LocationListResponse<Country>> {
    try {
      console.log("user passed to getTenantCountries:", user)
      
      // Debug: Check what's being passed
      if (user && user.user) {
        console.log("⚠️ Warning: User is wrapped in 'user' property. Using user.user instead.")
        user = user.user // Extract the actual user
      }
      
      // Now get tenant_id from the correct location
      const tenantId = user?.tenant_id || user?.tenant?.id
      
      console.log("Tenant ID found:", tenantId)
      console.log("Full user object for debugging:", user)
      
      if (!tenantId) {
        console.error('No tenant ID found in user object:', user)
        return { data: [], current_page: 1, last_page: 1, per_page: 100, total: 0, from: 0, to: 0 }
      }
      
      // Build query to filter by tenant_id
      const queryParams = {
        tenant_id: tenantId,
        // Add any other query parameters you need
      }
      
      const queryString = new URLSearchParams(queryParams).toString()
      const endpoint = queryString 
        ? `${ADMIN_API_CONFIG.ENDPOINTS.TENANT_COUNTRIES}?${queryString}` 
        : ADMIN_API_CONFIG.ENDPOINTS.TENANT_COUNTRIES
      
      console.log("API endpoint:", endpoint)
      
      return await adminApi.get(endpoint)
    } catch (error) {
      console.error('Erro ao buscar países do tenant:', error)
      return { data: [], current_page: 1, last_page: 1, per_page: 100, total: 0, from: 0, to: 0 }
    }
  },

  /*async getTenantCountries(filters?: LocationFilters): Promise<LocationListResponse<Country>> {
    try 
    {
      console.log("Filers", filters)
      const queryString = filters ? new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''

      const endpoint = queryString ? `${ADMIN_API_CONFIG.ENDPOINTS.TENANT_COUNTRIES}?${queryString}` : ADMIN_API_CONFIG.ENDPOINTS.TENANT_COUNTRIES
      return await adminApi.get(endpoint)
    } 
    catch (error) {
      console.error('Erro ao buscar países do tenant:', error)
      return { data: [], current_page: 1, last_page: 1, per_page: 100, total: 0, from: 0, to: 0 }
    }
  },*

  /**
   * Busca país do tenant por ID
   */
  async getTenantCountry(id: number): Promise<Country | null> {
    try {
      return await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_COUNTRIES}/${id}`)
    } catch (error) {
      console.error('Erro ao buscar país do tenant:', error)
      return null
    }
  },

  /**
   * Cria novo país para o tenant
   */
  async createTenantCountry(data: CountryFormData): Promise<Country | null> {
    try {
      console.log("ISIDE CREATE TENANT COUNTRY")
      console.log("BASE URL", ADMIN_API_CONFIG.BASE_URL)

      return await adminApi.post(ADMIN_API_CONFIG.ENDPOINTS.TENANT_COUNTRIES, data as unknown as Record<string, unknown>)
    } catch (error) {
      console.error('Erro ao criar país do tenant:', error)
      return null
    }
  },

  /**
   * Atualiza país do tenant
   */
  async updateTenantCountry(id: number, data: Partial<CountryFormData>): Promise<Country | null> {
    try {
      return await adminApi.put(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_COUNTRIES}/${id}`, data as unknown as Record<string, unknown>)
    } catch (error) {
      console.error('Erro ao atualizar país do tenant:', error)
      return null
    }
  },

  /**
   * Exclui país do tenant
   */
  async deleteTenantCountry(id: number): Promise<boolean> {
    try {
      console.log('🗑️ Tentando excluir país ID:', id)
      console.log('🔗 Endpoint:', `${ADMIN_API_CONFIG.ENDPOINTS.TENANT_COUNTRIES}/${id}`)

      const result = await adminApi.delete(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_COUNTRIES}/${id}`)
      console.log('✅ País excluído com sucesso:', result)
      return true
    } catch (error) {
      console.error('❌ Erro ao excluir país do tenant:', error)
      console.error('📋 Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      })
      return false
    }
  },

  // ===== ESTADOS - ENDPOINTS PÚBLICOS =====

  /**
   * Busca lista de estados públicos (dados globais da API)
   */
  async getPublicStates(filters?: LocationFilters): Promise<LocationListResponse<State>> {
    try {
      const queryString = filters ? new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''

      const endpoint = queryString ? `${ADMIN_API_CONFIG.ENDPOINTS.PUBLIC_STATES}?${queryString}` : ADMIN_API_CONFIG.ENDPOINTS.PUBLIC_STATES
      return await adminApi.get(endpoint)
    } catch (error) {
      console.error('Erro ao buscar estados públicos:', error)
      return { data: [], current_page: 1, last_page: 1, per_page: 100, total: 0, from: 0, to: 0 }
    }
  },

  /**
   * Busca estados públicos por país
   */
  async getTenantStatesByCountry(countryId: number): Promise<State[]> {
    try {
      const endpoint = `${ADMIN_API_CONFIG.ENDPOINTS.TENANT_STATES}?country_id=${countryId}`
      const response = await adminApi.get(endpoint)
      
      // Extract array from nested response
      const statesArray = response?.data?.data || response?.data || []
      return statesArray
    } catch (error) {
      console.error('Erro ao buscar estados do tenant:', error)
      return []
    }
  },

  // ===== ESTADOS - CRUD POR TENANT =====

  /**
   * Busca lista de estados do tenant
   */
  async getTenantStates(filters?: LocationFilters): Promise<LocationListResponse<State>> {
    try {
      const queryString = filters ? new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''

      const endpoint = queryString ? `${ADMIN_API_CONFIG.ENDPOINTS.TENANT_STATES}?${queryString}` : ADMIN_API_CONFIG.ENDPOINTS.TENANT_STATES
      return await adminApi.get(endpoint)
    } catch (error) {
      console.error('Erro ao buscar estados do tenant:', error)
      return { data: [], current_page: 1, last_page: 1, per_page: 30, total: 0, from: 0, to: 0 }
    }
  },

  /**
   * Busca estados do tenant por país
   */
  async getTenantStatesByCountry(countryId: number): Promise<State[]> {
    try {
      const response = await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_STATES}?country_id=${countryId}`) as { data?: State[] }
      return response.data || []
    } catch (error) {
      console.error('Erro ao buscar estados do tenant por país:', error)
      return []
    }
  },

  /**
   * Busca estado do tenant por ID
   */
  async getTenantState(id: number): Promise<State | null> {
    try {
      return await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_STATES}/${id}`)
    } catch (error) {
      console.error('Erro ao buscar estado do tenant:', error)
      return null
    }
  },

  /**
   * Cria novo estado para o tenant
   */
  async createTenantState(data: TenantStateFormData): Promise<State | null> {
    try {
      return await adminApi.post(ADMIN_API_CONFIG.ENDPOINTS.TENANT_STATES, data as unknown as Record<string, unknown>)
    } catch (error) {
      console.error('Erro ao criar estado do tenant:', error)
      return null
    }
  },

  /**
   * Atualiza estado do tenant
   */
  async updateTenantState(id: number, data: Partial<TenantStateFormData>): Promise<State | null> {
    try {
      return await adminApi.put(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_STATES}/${id}`, data as unknown as Record<string, unknown>)
    } catch (error) {
      console.error('Erro ao atualizar estado do tenant:', error)
      return null
    }
  },

  /**
   * Exclui estado do tenant
   */
  async deleteTenantState(id: number): Promise<boolean> {
    try {
      console.log('🗑️ Tentando excluir estado ID:', id)
      console.log('🔗 Endpoint:', `${ADMIN_API_CONFIG.ENDPOINTS.TENANT_STATES}/${id}`)

      const result = await adminApi.delete(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_STATES}/${id}`)
      console.log('✅ Estado excluído com sucesso:', result)
      return true
    } catch (error) {
      console.error('❌ Erro ao excluir estado do tenant:', error)
      console.error('📋 Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      })
      return false
    }
  },

  // ===== CIDADES - ENDPOINTS PÚBLICOS =====

  /**
   * Busca lista de cidades públicas (dados globais da API)
   */
  async getPublicCities(filters?: LocationFilters): Promise<LocationListResponse<City>> {
    try {
      const queryString = filters ? new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''

      const endpoint = queryString ? `${ADMIN_API_CONFIG.ENDPOINTS.PUBLIC_CITIES}?${queryString}` : ADMIN_API_CONFIG.ENDPOINTS.PUBLIC_CITIES
      return await adminApi.get(endpoint)
    } catch (error) {
      console.error('Erro ao buscar cidades públicas:', error)
      return { data: [], current_page: 1, last_page: 1, per_page: 100, total: 0, from: 0, to: 0 }
    }
  },

  /**
   * Busca cidades públicas por estado (para seleção)
   */
  async getPublicCitiesByState(stateId: number): Promise<City[]> {
    try {
      console.log("State id", stateId)
      const response = await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.PUBLIC_CITIES}?state_id=${stateId}&per_page=1000`) as { data?: City[] }
      return response.data || []
    } catch (error) {
      console.error('Erro ao buscar cidades públicas por estado:', error)
      return []
    }
  },

  // ===== CIDADES - CRUD POR TENANT =====

  /**
   * Busca lista de cidades do tenant
   */
  async getTenantCities(filters?: LocationFilters): Promise<LocationListResponse<City>> {
    try {
      const queryString = filters ? new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''

      const endpoint = queryString ? `${ADMIN_API_CONFIG.ENDPOINTS.TENANT_CITIES}?${queryString}` : ADMIN_API_CONFIG.ENDPOINTS.TENANT_CITIES
      return await adminApi.get(endpoint)
    } catch (error) {
      console.error('Erro ao buscar cidades do tenant:', error)
      return { data: [], current_page: 1, last_page: 1, per_page: 100, total: 0, from: 0, to: 0 }
    }
  },

  /**
   * Busca cidades do tenant por estado
   */
  async getTenantCitiesByState(stateId: number): Promise<City[]> {
    try {
      const response = await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_CITIES}?state_id=${stateId}`) as { data?: City[] }
      return response.data || []
    } catch (error) {
      console.error('Erro ao buscar cidades do tenant por estado:', error)
      return []
    }
  },

  /**
   * Busca cidades do tenant por estado
   */
  async getPublicStatesByCountry(countryId: number): Promise<State[]> {
    try {
      const endpoint = `${ADMIN_API_CONFIG.ENDPOINTS.PUBLIC_STATES}?country_id=${countryId}&per_page=100`
      const response = await adminApi.get(endpoint)
      
      // Extract array from nested response
      const statesArray = response?.data?.data || response?.data || []
      return statesArray
    } catch (error) {
      console.error('Erro ao buscar estados públicos:', error)
      return []
    }
  },

  /**
   * Busca cidade do tenant por ID
   */
  async getTenantCity(id: number): Promise<City | null> {
    try {
      return await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_CITIES}/${id}`)
    } catch (error) {
      console.error('Erro ao buscar cidade do tenant:', error)
      return null
    }
  },

  /**
   * Cria nova cidade para o tenant
   */
  async createTenantCity(data: TenantCityFormData): Promise<City | null> {
    try {
      return await adminApi.post(ADMIN_API_CONFIG.ENDPOINTS.TENANT_CITIES, data as unknown as Record<string, unknown>)
    } catch (error) {
      console.error('Erro ao criar cidade do tenant:', error)
      return null
    }
  },

  /**
   * Atualiza cidade do tenant
   */
  async updateTenantCity(id: number, data: Partial<TenantCityFormData>): Promise<City | null> {
    try {
      return await adminApi.put(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_CITIES}/${id}`, data as unknown as Record<string, unknown>)
    } catch (error) {
      console.error('Erro ao atualizar cidade do tenant:', error)
      return null
    }
  },

  /**
   * Exclui cidade do tenant
   */
  async deleteTenantCity(id: number): Promise<boolean> {
    try {
      console.log('🗑️ Tentando excluir cidade ID:', id)
      console.log('🔗 Endpoint:', `${ADMIN_API_CONFIG.ENDPOINTS.TENANT_CITIES}/${id}`)

      const result = await adminApi.delete(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_CITIES}/${id}`)
      console.log('✅ Cidade excluída com sucesso:', result)
      return true
    } catch (error) {
      console.error('❌ Erro ao excluir cidade do tenant:', error)
      console.error('📋 Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      })
      return false
    }
  },

  // ===== BAIRROS - ENDPOINTS PÚBLICOS =====

  /**
   * Busca lista de bairros públicos (dados globais da API)
   */
  async getPublicNeighborhoods(filters?: LocationFilters): Promise<LocationListResponse<Neighborhood>> {
    try {
      const queryString = filters ? new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''

      const endpoint = queryString ? `${ADMIN_API_CONFIG.ENDPOINTS.PUBLIC_NEIGHBORHOODS}?${queryString}` : ADMIN_API_CONFIG.ENDPOINTS.PUBLIC_NEIGHBORHOODS
      return await adminApi.get(endpoint)
    } catch (error) {
      console.error('Erro ao buscar bairros públicos:', error)
      return { data: [], current_page: 1, last_page: 1, per_page: 100, total: 0, from: 0, to: 0 }
    }
  },

  /**
   * Busca bairros públicos por cidade (para seleção)
   */
  async getPublicNeighborhoodsByCity(cityId: number): Promise<Neighborhood[]> {
    try {
      const response = await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.PUBLIC_NEIGHBORHOODS}?city_id=${cityId}&per_page=1000`) as { data?: Neighborhood[] }
      return response.data || []
    } catch (error) {
      console.error('Erro ao buscar bairros públicos por cidade:', error)
      return []
    }
  },

  // ===== BAIRROS - CRUD POR TENANT =====

  /**
   * Busca lista de bairros do tenant
   */
  async getTenantNeighborhoods(filters?: LocationFilters): Promise<LocationListResponse<Neighborhood>> {
    try {
      const queryString = filters ? new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>)
      ).toString() : ''

      const endpoint = queryString ? `${ADMIN_API_CONFIG.ENDPOINTS.TENANT_NEIGHBORHOODS}?${queryString}` : ADMIN_API_CONFIG.ENDPOINTS.TENANT_NEIGHBORHOODS
      return await adminApi.get(endpoint)
    } catch (error) {
      console.error('Erro ao buscar bairros do tenant:', error)
      return { data: [], current_page: 1, last_page: 1, per_page: 100, total: 0, from: 0, to: 0 }
    }
  },

  /**
   * Busca bairros do tenant por cidade
   */
  async getTenantNeighborhoodsByCity(cityId: number): Promise<Neighborhood[]> {
    try {
      const response = await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_NEIGHBORHOODS}?city_id=${cityId}`) as { data?: Neighborhood[] }
      return response.data || []
    } catch (error) {
      console.error('Erro ao buscar bairros do tenant por cidade:', error)
      return []
    }
  },

  /**
   * Busca bairro do tenant por ID
   */
  async getTenantNeighborhood(id: number): Promise<Neighborhood | null> {
    try {
      return await adminApi.get(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_NEIGHBORHOODS}/${id}`)
    } catch (error) {
      console.error('Erro ao buscar bairro do tenant:', error)
      return null
    }
  },

  /**
   * Cria novo bairro para o tenant
   */
  async createTenantNeighborhood(data: TenantNeighborhoodFormData): Promise<Neighborhood | null> {
    try {
      return await adminApi.post(ADMIN_API_CONFIG.ENDPOINTS.TENANT_NEIGHBORHOODS, data as unknown as Record<string, unknown>)
    } catch (error) {
      console.error('Erro ao criar bairro do tenant:', error)
      return null
    }
  },

  /**
   * Atualiza bairro do tenant
   */
  async updateTenantNeighborhood(id: number, data: Partial<TenantNeighborhoodFormData>): Promise<Neighborhood | null> {
    try {
      return await adminApi.put(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_NEIGHBORHOODS}/${id}`, data as unknown as Record<string, unknown>)
    } catch (error) {
      console.error('Erro ao atualizar bairro do tenant:', error)
      return null
    }
  },

  /**
   * Exclui bairro do tenant
   */
  async deleteTenantNeighborhood(id: number): Promise<boolean> {
    try {
      console.log('🗑️ Tentando excluir bairro ID:', id)
      console.log('🔗 Endpoint:', `${ADMIN_API_CONFIG.ENDPOINTS.TENANT_NEIGHBORHOODS}/${id}`)

      const result = await adminApi.delete(`${ADMIN_API_CONFIG.ENDPOINTS.TENANT_NEIGHBORHOODS}/${id}`)
      console.log('✅ Bairro excluído com sucesso:', result)
      return true
    } catch (error) {
      console.error('❌ Erro ao excluir bairro do tenant:', error)
      console.error('📋 Detalhes do erro:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      })
      return false
    }
  },

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Busca localização completa por CEP (se disponível)
   */
  async getLocationByZipCode(zipCode: string): Promise<{
    country?: Country
    state?: State
    city?: City
    neighborhood?: Neighborhood
  } | null> {
    try {
      return await adminApi.get(`/locations/zip-code/${zipCode}`)
    } catch (error) {
      console.error('Erro ao buscar localização por CEP:', error)
      return null
    }
  },

  /**
   * Busca hierarquia completa de localização
   */
  async getLocationHierarchy(neighborhoodId: number): Promise<{
    country: Country
    state: State
    city: City
    neighborhood: Neighborhood
  } | null> {
    try {
      return await adminApi.get(`/locations/hierarchy/${neighborhoodId}`)
    } catch (error) {
      console.error('Erro ao buscar hierarquia de localização:', error)
      return null
    }
  },

  /**
   * Busca estatísticas de localizações do tenant
   */
  async getTenantLocationStats(): Promise<{
    total_countries: number
    total_states: number
    total_cities: number
    total_neighborhoods: number
    countries_with_states: number
    states_with_cities: number
    cities_with_neighborhoods: number
  } | null> {
    try {
      return await adminApi.get('/tenant/locations/stats')
    } catch (error) {
      console.error('Erro ao buscar estatísticas de localização do tenant:', error)
      return null
    }
  },

  /**
   * Busca estatísticas de localizações públicas
   */
  async getPublicLocationStats(): Promise<{
    total_countries: number
    total_states: number
    total_cities: number
    total_neighborhoods: number
    countries_with_states: number
    states_with_cities: number
    cities_with_neighborhoods: number
  } | null> {
    try {
      return await adminApi.get('/locations/stats')
    } catch (error) {
      console.error('Erro ao buscar estatísticas de localização pública:', error)
      return null
    }
  },

  // ===== MÉTODOS DE COMPATIBILIDADE =====
  // Mantém os métodos antigos para não quebrar o código existente

  /**
   * @deprecated Use getTenantCountries() ou getPublicCountries() em vez disso
   */
  async getCountries(filters?: LocationFilters): Promise<LocationListResponse<Country>> {
    console.warn('getCountries() está depreciado. Use getTenantCountries() ou getPublicCountries()')
    return this.getTenantCountries(filters)
  },

  /**
   * @deprecated Use getTenantCountry() em vez disso
   */
  async getCountry(id: number): Promise<Country | null> {
    console.warn('getCountry() está depreciado. Use getTenantCountry()')
    return this.getTenantCountry(id)
  },

  /**
   * @deprecated Use createTenantCountry() em vez disso
   */
  async createCountry(data: CountryFormData): Promise<Country | null> {
    console.warn('createCountry() está depreciado. Use createTenantCountry()')
    return this.createTenantCountry(data)
  },

  /**
   * @deprecated Use updateTenantCountry() em vez disso
   */
  async updateCountry(id: number, data: Partial<CountryFormData>): Promise<Country | null> {
    console.warn('updateCountry() está depreciado. Use updateTenantCountry()')
    return this.updateTenantCountry(id, data)
  },

  /**
   * @deprecated Use deleteTenantCountry() em vez disso
   */
  async deleteCountry(id: number): Promise<boolean> {
    console.warn('deleteCountry() está depreciado. Use deleteTenantCountry()')
    return this.deleteTenantCountry(id)
  },

  /**
   * @deprecated Use getTenantStates() ou getPublicStates() em vez disso
   */
  async getStates(filters?: LocationFilters): Promise<LocationListResponse<State>> {
    console.warn('getStates() está depreciado. Use getTenantStates() ou getPublicStates()')
    return this.getTenantStates(filters)
  },

  /**
   * @deprecated Use getTenantStatesByCountry() ou getPublicStatesByCountry() em vez disso
   */
  async getStatesByCountry(countryId: number): Promise<State[]> {
    console.warn('getStatesByCountry() está depreciado. Use getTenantStatesByCountry() ou getPublicStatesByCountry()')
    return this.getTenantStatesByCountry(countryId)
  },

  /**
   * @deprecated Use getTenantState() em vez disso
   */
  async getState(id: number): Promise<State | null> {
    console.warn('getState() está depreciado. Use getTenantState()')
    return this.getTenantState(id)
  },

  /**
   * @deprecated Use createTenantState() em vez disso
   */
  async createState(data: StateFormData): Promise<State | null> {
    console.warn('createState() está depreciado. Use createTenantState()')
    // Converter StateFormData para TenantStateFormData
    return this.createTenantState({
      state_id: 0, // Precisa ser fornecido pelo usuário
      is_active: data.is_active
    })
  },

  /**
   * @deprecated Use updateTenantState() em vez disso
   */
  async updateState(id: number, data: Partial<StateFormData>): Promise<State | null> {
    console.warn('updateState() está depreciado. Use updateTenantState()')
    return this.updateTenantState(id, data)
  },

  /**
   * @deprecated Use deleteTenantState() em vez disso
   */
  async deleteState(id: number): Promise<boolean> {
    console.warn('deleteState() está depreciado. Use deleteTenantState()')
    return this.deleteTenantState(id)
  },

  /**
   * @deprecated Use getTenantCities() ou getPublicCities() em vez disso
   */
  async getCities(filters?: LocationFilters): Promise<LocationListResponse<City>> {
    console.warn('getCities() está depreciado. Use getTenantCities() ou getPublicCities()')
    return this.getTenantCities(filters)
  },

  /**
   * @deprecated Use getTenantCitiesByState() ou getPublicCitiesByState() em vez disso
   */
  async getCitiesByState(stateId: number): Promise<City[]> {
    console.warn('getCitiesByState() está depreciado. Use getTenantCitiesByState() ou getPublicCitiesByState()')
    return this.getTenantCitiesByState(stateId)
  },

  /**
   * @deprecated Use getTenantCity() em vez disso
   */
  async getCity(id: number): Promise<City | null> {
    console.warn('getCity() está depreciado. Use getTenantCity()')
    return this.getTenantCity(id)
  },

  /**
   * @deprecated Use createTenantCity() em vez disso
   */
  async createCity(data: CityFormData): Promise<City | null> {
    console.warn('createCity() está depreciado. Use createTenantCity()')
    // Converter CityFormData para TenantCityFormData
    return this.createTenantCity({
      city_id: 0, // Precisa ser fornecido pelo usuário
      is_active: data.is_active
    })
  },

  /**
   * @deprecated Use updateTenantCity() em vez disso
   */
  async updateCity(id: number, data: Partial<CityFormData>): Promise<City | null> {
    console.warn('updateCity() está depreciado. Use updateTenantCity()')
    return this.updateTenantCity(id, data)
  },

  /**
   * @deprecated Use deleteTenantCity() em vez disso
   */
  async deleteCity(id: number): Promise<boolean> {
    console.warn('deleteCity() está depreciado. Use deleteTenantCity()')
    return this.deleteTenantCity(id)
  },

  /**
   * @deprecated Use getTenantNeighborhoods() ou getPublicNeighborhoods() em vez disso
   */
  async getNeighborhoods(filters?: LocationFilters): Promise<LocationListResponse<Neighborhood>> {
    console.warn('getNeighborhoods() está depreciado. Use getTenantNeighborhoods() ou getPublicNeighborhoods()')
    return this.getTenantNeighborhoods(filters)
  },

  /**
   * @deprecated Use getTenantNeighborhoodsByCity() ou getPublicNeighborhoodsByCity() em vez disso
   */
  async getNeighborhoodsByCity(cityId: number): Promise<Neighborhood[]> {
    console.warn('getNeighborhoodsByCity() está depreciado. Use getTenantNeighborhoodsByCity() ou getPublicNeighborhoodsByCity()')
    return this.getTenantNeighborhoodsByCity(cityId)
  },

  /**
   * @deprecated Use getTenantNeighborhood() em vez disso
   */
  async getNeighborhood(id: number): Promise<Neighborhood | null> {
    console.warn('getNeighborhood() está depreciado. Use getTenantNeighborhood()')
    return this.getTenantNeighborhood(id)
  },

  /**
   * @deprecated Use createTenantNeighborhood() em vez disso
   */
  async createNeighborhood(data: NeighborhoodFormData): Promise<Neighborhood | null> {
    console.warn('createNeighborhood() está depreciado. Use createTenantNeighborhood()')
    // Converter NeighborhoodFormData para TenantNeighborhoodFormData
    return this.createTenantNeighborhood({
      neighborhood_id: 0, // Precisa ser fornecido pelo usuário
      is_active: data.is_active
    })
  },

  /**
   * @deprecated Use updateTenantNeighborhood() em vez disso
   */
  async updateNeighborhood(id: number, data: Partial<NeighborhoodFormData>): Promise<Neighborhood | null> {
    console.warn('updateNeighborhood() está depreciado. Use updateTenantNeighborhood()')
    return this.updateTenantNeighborhood(id, data)
  },

  /**
   * @deprecated Use deleteTenantNeighborhood() em vez disso
   */
  async deleteNeighborhood(id: number): Promise<boolean> {
    console.warn('deleteNeighborhood() está depreciado. Use deleteTenantNeighborhood()')
    return this.deleteTenantNeighborhood(id)
  },

  /**
   * @deprecated Use getTenantLocationStats() ou getPublicLocationStats() em vez disso
   */
  async getLocationStats(): Promise<{
    total_countries: number
    total_states: number
    total_cities: number
    total_neighborhoods: number
    countries_with_states: number
    states_with_cities: number
    cities_with_neighborhoods: number
  } | null> {
    console.warn('getLocationStats() está depreciado. Use getTenantLocationStats() ou getPublicLocationStats()')
    return this.getTenantLocationStats()
  }
}
