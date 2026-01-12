// 🚗 Tipos TypeScript para Endpoints FIPE
// Baseado nos novos endpoints implementados pelo backend
// API Local: http://127.0.0.1:8000/api/documentation#/

export type VehicleType = 'cars' | 'motorcycles' | 'trucks'

export interface FipeReference {
  id: number
  month: string
  code: number
  year: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface FipeBrand {
  id: number
  name: string
  code: string
  vehicle_type: VehicleType
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface FipeModel {
  id: number
  name: string
  code: string
  brand_id: number
  vehicle_type: VehicleType
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface FipeYear {
  id: number
  year: number
  model_id: number
  brand_id: number
  vehicle_type: VehicleType
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface FipeVehicle {
  id: number
  brand: FipeBrand
  model: FipeModel
  year: FipeYear
  vehicle_type: VehicleType
  reference: number
  fipe_price: number
  fipe_code: string
  fuel_type: string
  transmission: string
  engine_size: string
  doors: number
  seats: number
  specifications: Record<string, any>
  created_at?: string
  updated_at?: string
}

export interface FipeSearchParams {
  vehicle_type: VehicleType
  brand_id?: number
  model_id?: number
  year?: number
  reference?: number
}

export interface FipeSearchResult {
  id: number
  brand: string
  model: string
  year: number
  vehicle_type: VehicleType
  fipe_price: number
  fipe_code: string
  fuel_type?: string
  transmission?: string
}

// Tipos para respostas da API
export interface FipeApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

export interface FipePaginatedResponse<T> {
  success: boolean
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
  message?: string
}

// Tipos para filtros avançados
export interface FipeFilterParams {
  vehicle_type: VehicleType
  brand_id?: number
  model_id?: number
  year_min?: number
  year_max?: number
  fuel_type?: string
  transmission?: string
  price_min?: number
  price_max?: number
  doors?: number
  seats?: number
  reference?: number
}

// Tipos para histórico de consultas
export interface FipeSearchHistory {
  id: string
  query: string
  results_count: number
  search_params: FipeSearchParams
  created_at: string
  user_id?: number
}

// Tipos para favoritos FIPE
export interface FipeFavorite {
  id: string
  vehicle: FipeVehicle
  user_id: number
  notes?: string
  created_at: string
}

// Tipos para comparação de veículos
export interface FipeComparison {
  id: string
  vehicles: FipeVehicle[]
  user_id: number
  name?: string
  created_at: string
}

// Tipos para estatísticas de uso
export interface FipeUsageStats {
  total_searches: number
  popular_brands: Array<{ brand: string; count: number }>
  popular_models: Array<{ model: string; count: number }>
  search_trends: Array<{ date: string; count: number }>
  average_results_per_search: number
}

// Tipos para configurações FIPE
export interface FipeSettings {
  auto_refresh_prices: boolean
  price_update_frequency: 'daily' | 'weekly' | 'monthly'
  show_historical_prices: boolean
  default_currency: 'BRL' | 'USD' | 'EUR'
  language: 'pt-BR' | 'en-US' | 'es-ES'
  default_vehicle_type: VehicleType
}

// Tipos para notificações de preço
export interface FipePriceAlert {
  id: string
  vehicle: FipeVehicle
  target_price: number
  current_price: number
  user_id: number
  is_active: boolean
  created_at: string
  triggered_at?: string
}

// Tipos para relatórios FIPE
export interface FipeReport {
  id: string
  type: 'price_analysis' | 'market_trends' | 'brand_comparison' | 'custom'
  title: string
  description?: string
  data: any
  filters: FipeFilterParams
  user_id: number
  created_at: string
  expires_at?: string
}

// Tipos para exportação de dados
export interface FipeExportOptions {
  format: 'csv' | 'xlsx' | 'pdf' | 'json'
  include_specifications: boolean
  include_historical_data: boolean
  date_range?: {
    start: string
    end: string
  }
  filters?: FipeFilterParams
}

// Tipos para cache local
export interface FipeCacheEntry<T> {
  data: T
  timestamp: number
  expires_at: number
  key: string
}

// Tipos para erros da API FIPE
export interface FipeApiError {
  code: string
  message: string
  details?: any
  timestamp: string
  request_id?: string
}

// Tipos para validação de entrada
export interface FipeValidationError {
  field: string
  message: string
  value?: any
  rule?: string
}

// Tipos para logs de auditoria
export interface FipeAuditLog {
  id: string
  action: 'search' | 'view' | 'export' | 'favorite' | 'compare'
  user_id?: number
  ip_address?: string
  user_agent?: string
  details: any
  created_at: string
}

// Tipos para métricas de performance
export interface FipePerformanceMetrics {
  response_time: number
  cache_hit_rate: number
  error_rate: number
  requests_per_minute: number
  average_results_count: number
  timestamp: string
}

// Tipos para dados de referência FIPE
export interface FipeReferenceData {
  current_reference: FipeReference
  available_references: FipeReference[]
  last_update: string
  next_update?: string
}

// Tipos para dados de veículo com histórico de preços
export interface FipeVehicleWithHistory extends FipeVehicle {
  price_history: Array<{
    reference: number
    month: string
    year: number
    price: number
    variation: number
  }>
  average_price: number
  price_trend: 'up' | 'down' | 'stable'
}

// Tipos para busca por texto livre
export interface FipeTextSearchParams {
  query: string
  vehicle_type?: VehicleType
  limit?: number
  offset?: number
}

// Tipos para resultados de busca por texto
export interface FipeTextSearchResult {
  id: number
  brand: string
  model: string
  year: number
  vehicle_type: VehicleType
  fipe_price: number
  fipe_code: string
  relevance_score: number
  exact_match: boolean
}
