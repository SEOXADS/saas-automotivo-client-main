/**
 * Interfaces para o módulo de localizações
 * País -> Estado -> Cidade -> Bairro
 */

export interface Country {
  id: number
  name: string
  code: string // ISO 3166-1 alpha-2 (ex: BR, US)
  phone_code?: string
  currency?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface State {
  id: number
  name: string
  code: string // Código do estado (ex: SP, RJ)
  country_id: number
  country?: Country
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface City {
  id: number
  name: string
  state_id: number
  state?: State
  country_id?: number
  country?: Country
  ibge_code?: string // Código IBGE
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Neighborhood {
  id: number
  name: string
  city_id: number
  city?: City
  state_id?: number
  state?: State
  country_id?: number
  country?: Country
  zip_code?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Interfaces para formulários
export interface CountryFormData {
  name: string
  code: string
  phone_code?: string
  currency?: string
  is_active: boolean
  country_id?: number // ID do país público para referência
}

export interface StateFormData {
  name: string
  code: string
  country_id: number
  is_active: boolean
}

export interface TenantStateFormData {
  state_id: number
  is_active: boolean
}

export interface CityFormData {
  name: string
  state_id: number
  ibge_code?: string
  is_active: boolean
}

export interface TenantCityFormData {
  city_id: number
  is_active: boolean
}

export interface NeighborhoodFormData {
  name: string
  city_id: number
  zip_code?: string
  is_active: boolean
}

export interface TenantNeighborhoodFormData {
  neighborhood_id: number
  is_active: boolean
}

// Interfaces para listagem com paginação
export interface LocationListResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

// Interfaces para filtros
export interface LocationFilters {
  search?: string
  is_active?: boolean
  country_id?: number
  state_id?: number
  city_id?: number
  page?: number
  per_page?: number
  sort?: string
  order?: 'asc' | 'desc'
}
