// Tipos para geração automática de URLs
export interface VehicleUrlGeneration {
  vehicle_id: number
  brand_slug: string
  model_slug: string
  year: number
  city_slug?: string
  state_slug?: string
  neighborhood_slug?: string
  language: string
  canonical_url: string
  related_urls: string[]
  spintext_variations: string[]
  syntaxtext_variations: string[]
}

export interface UrlGenerationRequest {
  vehicle_id: number
  brand: string
  model: string
  year: number
  city?: string
  state?: string
  neighborhood?: string
  language?: string
}

export interface UrlGenerationResponse {
  success: boolean
  generated_urls: VehicleUrlGeneration[]
  duplicates_found: string[]
  sitemap_updated: boolean
  message?: string
}

export interface SpinTextConfig {
  id: number
  name: string
  pattern: string
  variations: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SyntaxTextConfig {
  id: number
  name: string
  pattern: string
  syntax_rules: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CanonicalUrlConfig {
  id: number
  vehicle_id: number
  canonical_url: string
  related_urls: string[]
  language: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UrlDuplicateCheck {
  url: string
  is_duplicate: boolean
  existing_vehicle_id?: number
  conflict_type?: 'exact' | 'similar' | 'canonical'
}

export interface SitemapUpdateRequest {
  vehicle_id: number
  url_changes: {
    old_url: string
    new_url: string
    change_type: 'created' | 'updated' | 'redirected' | 'deleted'
  }[]
  update_timestamp: string
}
