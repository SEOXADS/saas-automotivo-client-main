// Tipos de usuário e autenticação
export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'manager' | 'salesperson' | 'user'
  phone?: string
  avatar?: string
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
  tenant_id: number
  tenant: Tenant
}

export interface TenantProfile {
  id: number
  name: string
  description?: string
  cnpj?: string
  phone?: string
  email?: string
  website?: string

  // Endereço completo
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zip_code: string
    country: string
  }

  // Horário de funcionamento
  business_hours: {
    monday: string[]
    tuesday: string[]
    wednesday: string[]
    thursday: string[]
    friday: string[]
    saturday: string[]
    sunday: string[]
  }

  // Redes sociais
  social_media: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    youtube?: string
    whatsapp?: string
  }

  // Imagens
  logo_url?: string
  favicon_url?: string
  banner_url?: string

  created_at: string
  updated_at: string
}

export interface TenantTheme {
  id: number

  // Cores
  colors: {
    primary: string
    secondary: string
    accent: string
    success: string
    warning: string
    danger: string
    info: string
    background: string
    surface: string
    text: string
    text_muted: string

    // Cores específicas do Head
    head: {
      background: string
      text: string
      border: string
    }

    // Cores específicas do Footer
    footer: {
      background: string
      text: string
      border: string
      columns: {
        background: string
        text: string
        title: string
      }
    }

    // Cores específicas do Banner
    banner: {
      background: string
      text: string
      overlay: string
    }

    // Cores específicas dos Botões
    buttons: {
      primary: {
        background: string
        text: string
        hover_background: string
        hover_text: string
        border: string
      }
      secondary: {
        background: string
        text: string
        hover_background: string
        hover_text: string
        border: string
      }
      accent: {
        background: string
        text: string
        hover_background: string
        hover_text: string
        border: string
      }
    }
  }

  // Tipografia
  typography: {
    font_family: string
    font_sizes: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
    }
    font_weights: {
      light: number
      normal: number
      medium: number
      semibold: number
      bold: number
    }
  }

  // Layout
  layout: {
    border_radius: string
    spacing: string
    container_max_width: string
    sidebar_width: string
  }

  // Componentes
  components: {
    buttons: {
      primary_style: string
      secondary_style: string
      size: string
    }
    cards: {
      shadow: string
      border: string
    }
    forms: {
      input_style: string
      label_style: string
    }
  }

  // Recursos
  features: {
    dark_mode: boolean
    animations: boolean
    transitions: boolean
  }

  // CSS customizado
  custom_css?: string
  css_variables: Record<string, string>

  created_at: string
  updated_at: string
}

export interface TenantSeo {
  id: number

  // Meta tags básicas
  meta: {
    title: string
    description: string
    keywords: string
    author: string
    robots: string
    canonical_url?: string
  }

  // Open Graph
  open_graph: {
    title: string
    description: string
    image_url?: string
    site_name: string
    type: string
    locale: string
  }

  // Twitter Card
  twitter_card: {
    card_type: string
    title: string
    description: string
    image_url?: string
    creator?: string
    site?: string
  }

  // Schema.org
  schema_org: {
    organization_type: string
    industry: string
    founding_date?: string
    contact_point?: {
      type: string
      telephone: string
      contact_type: string
    }
    same_as: string[]
  }

  // Recursos avançados
  advanced: {
    amp_enabled: boolean
    sitemap_enabled: boolean
    structured_data: boolean
  }

  created_at: string
  updated_at: string
}

export interface TenantPortalSettings {
  id: number

  // Funcionalidades
  features: {
    search: boolean
    filters: boolean
    comparison: boolean
    wishlist: boolean
    reviews: boolean
    financing_calculator: boolean
    vehicle_history: boolean
    whatsapp_button: boolean
  }

  // Exibição
  display: {
    vehicles_per_page: number
    max_comparison_items: number
    show_prices: boolean
    show_mileage: boolean
    show_fuel_consumption: boolean
    image_gallery: boolean
    video_support: boolean
  }

  // Formulários
  forms: {
    required_fields: string[]
    captcha_enabled: boolean
    gdpr_compliance: boolean
    privacy_policy_url?: string
    terms_url?: string
  }

  // Integrações
  integrations: {
    google_analytics_id?: string
    facebook_pixel_id?: string
    whatsapp_number?: string
    google_maps_api_key?: string
    recaptcha_site_key?: string
  }

  // Performance
  performance: {
    image_optimization: boolean
    lazy_loading: boolean
    cache_enabled: boolean
    cdn_enabled: boolean
  }

  created_at: string
  updated_at: string
}

// Nova interface principal do tenant
export interface TenantConfiguration {
  profile: TenantProfile
  theme: TenantTheme
  seo: TenantSeo
  portal_settings: TenantPortalSettings
}

// Interface para compatibilidade com código existente
export interface Tenant {
  id: number
  name: string
  subdomain: string
  custom_domain?: string | null
  description?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  theme_color?: string
  logo_url?: string | null
  logo?: string | null
  social_media?: {
    facebook?: string
    whatsapp?: string
    instagram?: string
  }
  business_hours?: {
    monday?: string[]
    tuesday?: string[]
    wednesday?: string[]
    thursday?: string[]
    friday?: string[]
    saturday?: string[]
    sunday?: string[]
  }

  // Novos campos da estrutura reorganizada
  configuration?: TenantConfiguration
}

export interface TenantSettings {
  company_name?: string
  company_logo?: string
  company_phone?: string
  company_email?: string
  company_address?: string
  theme_color?: string
  allow_financing?: boolean
  show_prices?: boolean
  contact_form_enabled?: boolean
  whatsapp_number?: string
}

// Tipos de veículos
export interface VehicleBrand {
  id: number
  name: string
  slug: string
  logo?: string | null
  description?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface VehicleModel {
  id: number
  brand_id: number
  name: string
  slug: string
  description?: string
  category: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  brand: VehicleBrand
}

export interface ApiBrandsResponse {
  success: boolean
  data: VehicleBrand[]
  message: string
}

export interface ApiModelsResponse {
  success: boolean
  data: VehicleModel[]
  message: string
}

export interface Vehicle {
  id: number
  tenant_id: number
  brand_id: number
  model_id: number
  title: string
  version: string
  year: number
  model_year: number
  color: string
  fuel_type: string
  transmission: string
  doors: number
  mileage: number
  price: string
  fipe_price: string | null
  accept_financing: boolean
  accept_exchange: boolean
  engine: string | null
  power: string | null
  torque: string | null
  consumption_city: string | null
  consumption_highway: string | null
  description: string
  plate: string | null
  chassi: string | null
  renavam: string | null
  owner_name: string | null
  owner_phone: string | null
  owner_email: string | null
  status: 'available' | 'sold' | 'reserved' | 'maintenance' | 'deleted'
  is_featured: boolean
  is_active: boolean
  views: number
  published_at: string
  created_by: {
    id: number
    tenant_id: number
    name: string
    email: string
    email_verified_at: string | null
    phone: string | null
    avatar: string | null
    role: string
    permissions: string | null
    is_active: boolean
    last_login_at: string | null
    created_at: string
    updated_at: string
  }
  updated_by: {
    id: number
    tenant_id: number
    name: string
    email: string
    email_verified_at: string | null
    phone: string | null
    avatar: string | null
    role: string
    permissions: string | null
    is_active: boolean
    last_login_at: string | null
    created_at: string
    updated_at: string
  } | null
  created_at: string
  updated_at: string
  brand: VehicleBrand
  model: VehicleModel
  images: VehicleImage[]
  main_image?: {
    id: number
    filename: string
    url: string
    image_url: string
    is_primary: boolean
    size: number
    mime_type: string
  }

  // Novos campos do formulário
  vehicle_type: '0km' | 'used'
  vehicle_category: 'car' | 'motorcycle' | 'truck' | 'van' | 'suv'
  video_link: string | null
  observation: string | null
  use_same_observation: boolean

  // Características
  characteristics: VehicleCharacteristic[]

  // Opcionais
  optionals: VehicleOptional[]

  // Informações personalizadas por classificado
  classified_info: ClassifiedInfo[]
}

export interface VehicleCharacteristic {
  id: number
  name: string
  slug: string
  is_active: boolean
}

export interface VehicleOptional {
  id: number
  name: string
  slug: string
  category: string
  is_active: boolean
}

// Características padrão do sistema
export const DEFAULT_VEHICLE_CHARACTERISTICS = [
  { id: 1, name: 'Adaptado para Def. Físico', slug: 'adapted_physical_disability', is_active: true },
  { id: 2, name: 'Blindado', slug: 'armored', is_active: true },
  { id: 3, name: 'Chave Reserva', slug: 'spare_key', is_active: true },
  { id: 4, name: 'Garantia de Fábrica', slug: 'factory_warranty', is_active: true },
  { id: 5, name: 'IPVA Pago', slug: 'ipva_paid', is_active: true },
  { id: 6, name: 'Licenciado', slug: 'licensed', is_active: true },
  { id: 7, name: 'Manual', slug: 'manual', is_active: true },
  { id: 8, name: 'Passagem por leilão', slug: 'auctioned', is_active: true },
  { id: 9, name: 'Revisado em Concessionária', slug: 'dealer_serviced', is_active: true },
  { id: 10, name: 'Único Dono', slug: 'single_owner', is_active: true }
]

// Opcionais padrão do sistema
export const DEFAULT_VEHICLE_OPTIONALS = [
  // Coluna 1
  { id: 1, name: 'Airbag laterais', slug: 'side_airbags', category: 'safety', is_active: true },
  { id: 2, name: 'Airbag motorista', slug: 'driver_airbag', category: 'safety', is_active: true },
  { id: 3, name: 'Airbag passageiro', slug: 'passenger_airbag', category: 'safety', is_active: true },
  { id: 4, name: 'Alarme', slug: 'alarm', category: 'security', is_active: true },
  { id: 5, name: 'Ar condicionado', slug: 'air_conditioning', category: 'comfort', is_active: true },
  { id: 6, name: 'Ar condicionado Digital', slug: 'digital_air_conditioning', category: 'comfort', is_active: true },
  { id: 7, name: 'Ar quente', slug: 'heater', category: 'comfort', is_active: true },
  { id: 8, name: 'Banco do motorista com ajuste de altura', slug: 'driver_seat_height_adjustment', category: 'comfort', is_active: true },
  { id: 9, name: 'Bancos de Couro', slug: 'leather_seats', category: 'comfort', is_active: true },
  { id: 10, name: 'Bancos dianteiros com aquecimento', slug: 'heated_front_seats', category: 'comfort', is_active: true },
  { id: 11, name: 'Câmera de ré', slug: 'rear_camera', category: 'safety', is_active: true },
  { id: 12, name: 'Capota Marítima', slug: 'tonneau_cover', category: 'exterior', is_active: true },

  // Coluna 2
  { id: 13, name: 'CD player', slug: 'cd_player', category: 'entertainment', is_active: true },
  { id: 14, name: 'CD player com MP3', slug: 'cd_player_mp3', category: 'entertainment', is_active: true },
  { id: 15, name: 'Computador de bordo', slug: 'onboard_computer', category: 'technology', is_active: true },
  { id: 16, name: 'Controle de som no volante', slug: 'steering_wheel_audio_controls', category: 'entertainment', is_active: true },
  { id: 17, name: 'Controle de tração', slug: 'traction_control', category: 'safety', is_active: true },
  { id: 18, name: 'Controle de velocidade', slug: 'cruise_control', category: 'safety', is_active: true },
  { id: 19, name: 'Desembaçador traseiro', slug: 'rear_defogger', category: 'comfort', is_active: true },
  { id: 20, name: 'Direção Elétrica', slug: 'electric_power_steering', category: 'comfort', is_active: true },
  { id: 21, name: 'Direção Hidráulica', slug: 'hydraulic_power_steering', category: 'comfort', is_active: true },
  { id: 22, name: 'DVD player', slug: 'dvd_player', category: 'entertainment', is_active: true },
  { id: 23, name: 'Encosto de cabeça traseiro', slug: 'rear_headrest', category: 'comfort', is_active: true },
  { id: 24, name: 'Entrada USB', slug: 'usb_input', category: 'technology', is_active: true },

  // Coluna 3
  { id: 25, name: 'Faróis de xenon', slug: 'xenon_headlights', category: 'exterior', is_active: true },
  { id: 26, name: 'Farol de milha', slug: 'mile_light', category: 'exterior', is_active: true },
  { id: 27, name: 'Farol de neblina', slug: 'fog_lights', category: 'exterior', is_active: true },
  { id: 28, name: 'Freios ABS', slug: 'abs_brakes', category: 'safety', is_active: true },
  { id: 29, name: 'GPS', slug: 'gps', category: 'technology', is_active: true },
  { id: 30, name: 'Insulfilm', slug: 'window_tint', category: 'exterior', is_active: true },
  { id: 31, name: 'Limpador traseiro', slug: 'rear_wiper', category: 'exterior', is_active: true },
  { id: 32, name: 'Multimídia', slug: 'multimedia', category: 'entertainment', is_active: true },
  { id: 33, name: 'Pára-choques na cor do veículo', slug: 'body_colored_bumpers', category: 'exterior', is_active: true },
  { id: 34, name: 'Piloto automático', slug: 'autopilot', category: 'safety', is_active: true },
  { id: 35, name: 'Porta copos', slug: 'cup_holder', category: 'comfort', is_active: true },
  { id: 36, name: 'Protetor de Caçamba', slug: 'bed_liner', category: 'exterior', is_active: true },
  { id: 37, name: 'Retrovisor fotocrômico', slug: 'auto_dimming_mirror', category: 'exterior', is_active: true },
  { id: 38, name: 'Retrovisores elétricos', slug: 'power_mirrors', category: 'exterior', is_active: true },
  { id: 39, name: 'Rodas de liga leve', slug: 'alloy_wheels', category: 'exterior', is_active: true },
  { id: 40, name: 'Sensor de chuva', slug: 'rain_sensor', category: 'technology', is_active: true },
  { id: 41, name: 'Sensor de estacionamento', slug: 'parking_sensor', category: 'safety', is_active: true },
  { id: 42, name: 'Sensor de Luminosidade', slug: 'light_sensor', category: 'technology', is_active: true },
  { id: 43, name: 'Teto solar', slug: 'sunroof', category: 'exterior', is_active: true },
  { id: 44, name: 'Tração 4x4', slug: '4x4_drive', category: 'performance', is_active: true },
  { id: 45, name: 'Travas elétricas', slug: 'power_locks', category: 'comfort', is_active: true },
  { id: 46, name: 'Vidros elétricos', slug: 'power_windows', category: 'comfort', is_active: true },
  { id: 47, name: 'Vidros elétricos Traseiros', slug: 'rear_power_windows', category: 'comfort', is_active: true },
  { id: 48, name: 'Volante com regulagem de altura', slug: 'height_adjustable_steering', category: 'comfort', is_active: true }
]

export interface ClassifiedInfo {
  id: number
  classified_name: string
  observation: string | null
  price: string | null
}

export interface VehicleImage {
  id: number
  vehicle_id: number
  image_url: string
  url?: string // Adicionado para compatibilidade com a API
  is_primary: boolean
  sort_order: number
  alt_text?: string
  caption?: string
  file_size?: number
  mime_type?: string
  width?: number
  height?: number
  created_at: string
  updated_at: string
}

export interface ApiVehiclesResponse {
  data: Vehicle[]
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface VehicleFeature {
  id: number
  vehicle_id: number
  feature_name: string
  feature_value: string
  category: 'safety' | 'comfort' | 'technology' | 'performance' | 'exterior' | 'interior'
  created_at: string
  updated_at: string
}

// Tipos de leads
export interface Lead {
  id: number
  name: string
  email: string
  phone: string
  message?: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  source: 'site' | 'whatsapp' | 'phone' | 'email' | 'facebook' | 'instagram' | 'referral' | 'other'
  interest_type: 'buy' | 'sell' | 'exchange' | 'financing'
  budget_min?: number
  budget_max?: number
  preferred_brand?: string
  preferred_model?: string
  preferred_year?: number
  notes?: string
  assigned_to?: number
  assigned_user?: User
  vehicle_id?: number
  vehicle?: Vehicle
  last_contact?: string
  next_followup?: string
  conversion_date?: string
  created_at: string
  updated_at: string
  tenant_id: number
}

// Tipos para dashboard
export interface DashboardStats {
  total_leads: number
  new_leads: number
  converted_leads: number
  conversion_rate: number
  total_vehicles: number
  available_vehicles: number
  sold_vehicles: number
  total_revenue: number
  average_price: number
  popular_brands: string[]
  monthly_sales: Array<{ month: string; value: number }>
  lead_sources: Array<{ source: string; count: number }>
}

// ✅ NOVO: Estrutura conforme backend para dashboard de leads
export interface LeadsDashboardData {
  total_leads: number
  new_leads: number
  contacted_leads: number
  qualified_leads: number
  closed_won: number
  closed_lost: number
  conversion_rate: number
  leads_by_source: Record<string, number>
  recent_leads: Array<{
    id: number
    name: string
    email: string
    status: string
    created_at: string
  }>
}

// ✅ NOVO: Estrutura conforme backend para dashboard geral
export interface GeneralDashboardData {
  stats: {
    total_vehicles: number
    active_vehicles: number
    total_leads: number
    new_leads: number
    total_users: number
    active_users: number
  }
  recent_leads: Array<{
    id: number
    name: string
    email: string
    status: string
    vehicle?: Vehicle
    assigned_to?: User
    created_at: string
  }>
  recent_vehicles: Array<{
    id: number
    title: string
    brand?: VehicleBrand
    model?: VehicleModel
    images?: VehicleImage[]
    created_at: string
  }>
}

// Tipos para filtros
export interface VehicleFilters {
  brand_id?: number
  model_id?: number
  year_min?: number
  year_max?: number
  price_min?: number
  price_max?: number
  fuel_type?: string
  transmission?: string
  condition?: string
  status?: string
  mileage_max?: number
  search?: string
  is_featured?: boolean
  page?: number
  per_page?: number
  sort_by?: 'price_asc' | 'price_desc' | 'year_asc' | 'year_desc' | 'mileage_asc' | 'mileage_desc' | 'created_at_desc'
}

export interface LeadFilters {
  status?: string
  source?: string
  interest_type?: string
  assigned_to?: number
  date_from?: string
  date_to?: string
  search?: string
  page?: number
  per_page?: number
  sort_by?: 'created_at_desc' | 'created_at_asc' | 'name_asc' | 'name_desc'
}

export interface VehicleFormData {
  // Relacionamentos
  brand_id: number
  model_id: number

  // Tipo e condição
  vehicle_type: 'car' | 'motorcycle' | 'truck' | 'suv' | 'pickup' | 'van' | 'bus' | 'other'
  condition: 'new' | 'used'

  // Dados básicos
  title: string
  version: string
  year: number
  model_year: number
  color: VehicleColor
  fuel_type: VehicleFuelType
  transmission: VehicleTransmission
  doors: number
  mileage: number
  hide_mileage: number // tinyint (0 ou 1)
  price: number
  classified_price: number
  fipe_price: number
  cost_type: string
  engine: string
  power: string
  torque: string
  consumption_city: string
  consumption_highway: string
  description: string
  use_same_observation: number // tinyint (0 ou 1)
  custom_observation: string
  classified_observations: string[] // JSON [string]
  standard_features: string[] // JSON [string]
  optional_features: string[] // JSON [string]
  plate: string
  chassi: string
  renavam: string
  video_link: string
  owner_name: string
  owner_phone: string
  owner_email: string
  accept_financing: number // tinyint (0 ou 1)
  accept_exchange: number // tinyint (0 ou 1)
  is_featured: number // tinyint (0 ou 1)
  is_licensed: number // tinyint (0 ou 1)
  has_warranty: number // tinyint (0 ou 1)
  is_adapted: number // tinyint (0 ou 1)
  is_armored: number // tinyint (0 ou 1)
  has_spare_key: number // tinyint (0 ou 1)
  ipva_paid: number // tinyint (0 ou 1)
  has_manual: number // tinyint (0 ou 1)
  auction_history: number // tinyint (0 ou 1)
  dealer_serviced: number // tinyint (0 ou 1)
  single_owner: number // tinyint (0 ou 1)
  is_active: number // tinyint (0 ou 1)
  views: number // int
  status: 'available' | 'sold' | 'reserved' | 'maintenance' | 'deleted'
  images: File[]
  image_paths?: string[] // Caminhos das imagens após upload
  primary_image_path?: string // Caminho da imagem principal
}

// Enums para valores específicos
export type VehicleFuelType = 'gasoline' | 'ethanol' | 'flex' | 'diesel' | 'electric' | 'hybrid'
export type VehicleTransmission = 'manual' | 'automatic' | 'cvt' | 'semi_automatic'
export type VehicleColor = 'white' | 'black' | 'silver' | 'gray' | 'blue' | 'red' | 'green' | 'yellow' | 'orange' | 'brown'

export interface FeatureFormData {
  feature_name: string
  feature_value: string
  category: string
}

export interface LeadFormData {
  name: string
  email: string
  phone: string
  message?: string
  status: string
  source: string
  interest_type: string
  budget_min?: number
  budget_max?: number
  preferred_brand?: string
  preferred_model?: string
  preferred_year?: number
  notes?: string
  assigned_to?: number
  vehicle_id?: number
  next_followup?: string
}

export interface CreateVehicleForm {
  brand_id: number
  model_id: number
  title: string
  version: string
  model_year: number
  color: string
  fuel_type: 'gasoline' | 'ethanol' | 'flex' | 'diesel' | 'electric' | 'hybrid'
  transmission: 'manual' | 'automatic' | 'cvt' | 'semi_automatic'
  doors: number
  mileage: number
  price: number
  description: string
  is_active: boolean
}

// Tipos para paginação
export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface PaginatedData<T> {
  data: T[]
  meta: PaginationMeta
}

// Tipos para upload
export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResponse {
  success: boolean
  file_path: string
  file_url: string
  message?: string
}

export interface VehicleImageUpload {
  vehicle_id: number
  image: File
  is_primary?: boolean
  sort_order?: number
  alt_text?: string
  caption?: string
}

export interface VehicleImageUpdate {
  id: number
  is_primary?: boolean
  sort_order?: number
  alt_text?: string
  caption?: string
}

export interface VehicleImageResponse {
  message: string
  data: VehicleImage
}

export interface VehicleImagesResponse {
  message: string
  data: VehicleImage[]
}

// SweetAlert2 types
declare global {
  interface Window {
    Swal: {
      fire: (options: SweetAlertOptions) => Promise<unknown>
      success: (options: SweetAlertOptions) => Promise<unknown>
      error: (options: SweetAlertOptions) => Promise<unknown>
      warning: (options: SweetAlertOptions) => Promise<unknown>
      info: (options: SweetAlertOptions) => Promise<unknown>
      question: (options: SweetAlertOptions) => Promise<unknown>
      confirm: (options: SweetAlertOptions) => Promise<unknown>
    }
  }
}

export interface SweetAlertOptions {
  title?: string
  text?: string
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question'
  confirmButtonText?: string
  cancelButtonText?: string
  showCancelButton?: boolean
  allowOutsideClick?: boolean
  timer?: number
  timerProgressBar?: boolean
}

// Exportar tipos de localização
export * from './location'
