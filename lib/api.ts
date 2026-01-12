import axios, { AxiosInstance } from 'axios'
import { getAuthToken, getTenantSubdomain } from './auth'

// Função para limpar tokens incorretos (sem definir token fixo)
export const clearIncorrectTokens = () => {
  console.log('🧹 ClearTokens - Limpando tokens incorretos...')

  // Limpar localStorage
  localStorage.removeItem('auth-storage')
  localStorage.removeItem('demo_user')
  localStorage.removeItem('demo_token')
  localStorage.removeItem('demo_subdomain')
  localStorage.removeItem('fallback_user')
  localStorage.removeItem('fallback_token')
  localStorage.removeItem('fallback_subdomain')

  // Limpar cookies
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  document.cookie = 'tenant_subdomain=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

  console.log('✅ ClearTokens - Tokens limpos!')
}

// Configuração base da API
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://www.api.webcarros.app.br/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    console.log('🔐 Interceptor - Token encontrado:', token ? `${token.substring(0, 20)}...` : 'null')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔐 Interceptor - Header Authorization adicionado')
    }

    const subdomain = getTenantSubdomain()
    console.log('🔐 Interceptor - Subdomain encontrado:', subdomain)

//    if (subdomain) {
//     config.headers['X-Tenant-Subdomain'] = subdomain
//      console.log('🔐 Interceptor - Header X-Tenant-Subdomain adicionado')
//    }

	if (subdomain) {
	  config.headers['X-Tenant'] = subdomain  // ✅ Change from X-Tenant-Subdomain to X-Tenant
	  console.log('🔐 Interceptor - Header X-Tenant adicionado:', subdomain)
	}


    console.log('🔐 Interceptor - Headers finais:', config.headers)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔐 Token expirado ou inválido, ativando modo demo')
      localStorage.setItem('demo_token_123', 'demo_mode_activated')
    }
      return Promise.reject(error)
    }
)

// ✅ DEDICATED LOGIN FUNCTION - Bypasses interceptor, explicitly sets X-Tenant header
export const apiLogin = async (
  email: string, 
  password: string, 
  subdomain: string
): Promise<{
  access_token: string
  token_type: string
  expires_in: number
  user: unknown
}> => {
  console.log('🔐 apiLogin: Fazendo login com subdomain explícito:', subdomain)
  
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL || 'https://www.api.webcarros.app.br/api'}/tenant/login`,
    { 
      email, 
      password,
      tenant_subdomain: subdomain  // ✅ Include in body as backup
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Tenant': subdomain,  // ✅ Explicitly set the header
      },
      timeout: 30000
    }
  )
  
  console.log('✅ apiLogin: Resposta recebida:', response.status)
  return response.data
}




// Tipos da API
export interface ApiResponse {
  success: boolean
  data?: unknown
  message?: string
  error?: string
  errors?: Record<string, unknown>
  _source?: string
  _lastSaved?: string
  _note?: string
  _error?: string
}

// Função para verificar se está em modo demo
export const isDemoMode = (): boolean => {
  try {
    console.log('🔍 isDemoMode: FORÇANDO MODO REAL (tenant real)')
    // FORÇAR MODO REAL - SEMPRE RETORNAR FALSE
    return false
  } catch (error) {
    console.error('❌ Erro ao verificar modo demo:', error)
    return false
  }
}

// Função para tratamento centralizado de erros da API
const handleApiError = (error: unknown, section: string, data: unknown): ApiResponse => {
  console.error(`❌ Erro na API (${section}):`, error)

  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const message = error.response?.data?.message || 'Erro desconhecido na API'
    const serverData = error.response?.data

    // Tratamento específico para erro 400
    if (status === 400) {
      console.error('❌ Erro 400 - Bad Request:')
      console.error('❌ Resposta do servidor:', serverData)
      console.error('❌ Dados enviados:', data)

      // Verificar se há erros de validação específicos
      if (serverData?.errors) {
        console.error('❌ Erros de validação:', serverData.errors)
        return {
          success: false,
          error: `Erro de validação: ${JSON.stringify(serverData.errors)}`,
          errors: serverData.errors,
          _source: 'validation_error'
        }
      }

      // Verificar se há campos obrigatórios faltando
      if (serverData?.message?.includes('required') || serverData?.message?.includes('obrigatório')) {
        console.error('❌ Campos obrigatórios faltando')
        return {
          success: false,
          error: `Campos obrigatórios faltando: ${serverData.message}`,
          _source: 'missing_required_fields'
        }
      }

      return {
        success: false,
        error: `Erro 400: ${message}`,
        _source: 'bad_request'
      }
    }

    // Se for erro 404, salvar no localStorage como fallback
    if (status === 404) {
      try {
        const existingConfig = localStorage.getItem('tenant_configuration')
        const existingData = existingConfig ? JSON.parse(existingConfig) : {}
        const updatedConfig = { ...existingData, [section]: data }
        localStorage.setItem('tenant_configuration', JSON.stringify(updatedConfig))
        localStorage.setItem('last_config_save', new Date().toISOString())

        return {
          success: true,
          data: {
            message: `Dados salvos temporariamente no navegador (${section})`,
            timestamp: new Date().toISOString(),
            note: 'API retornou erro, mas dados foram salvos localmente'
          },
          message: `✅ Dados salvos temporariamente no navegador (${section})`
        }
      } catch (localStorageError) {
        console.error('❌ Erro ao salvar no localStorage:', localStorageError)
      }
    }

    return {
      success: false,
      error: message,
      errors: error.response?.data?.errors
    }
  }

  return {
    success: false,
    error: 'Erro de conexão. Tente novamente.'
  }
}

/**
 * Obter configurações completas do tenant
 * GET /api/tenant/configuration
 */
export const getTenantConfiguration = async (): Promise<ApiResponse> => {
  try {
    console.log('🔧 Buscando configurações do tenant...')

    // Verificar se há token de autenticação
    const token = getAuthToken()
    if (!token) {
      console.log('⚠️ Nenhum token de autenticação encontrado')
      return {
        success: false,
        error: 'Usuário não autenticado. Faça login para continuar.',
        _source: 'no_token'
      }
    }

    console.log('🔑 Token encontrado, tentando buscar configurações da API...')

    const response = await api.get('/tenant/configuration')
    console.log('✅ Configurações carregadas com sucesso:', response.data)
    console.log('🔍 Estrutura da resposta:', {
      hasData: !!response.data.data,
      dataKeys: response.data.data ? Object.keys(response.data.data) : [],
      responseKeys: Object.keys(response.data)
    })

    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Configurações carregadas com sucesso'
    }
  } catch (error) {
    console.error('❌ Erro ao carregar configurações:', error)

    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const message = error.response?.data?.message || 'Erro desconhecido na API'

      console.log('🔍 Detalhes do erro da API:')
      console.log('🔍 Status:', status)
      console.log('🔍 Mensagem:', message)

      // Se for erro 401, o usuário não está autenticado
      if (status === 401) {
        return {
          success: false,
          error: 'Sessão expirada. Faça login novamente para continuar.',
          _source: 'unauthorized'
        }
      }

      // Se for erro 404, o endpoint não existe
      if (status === 404) {
        return {
          success: false,
          error: 'Endpoint de configurações não encontrado.',
          _source: 'not_found'
        }
      }

      // Outros erros da API
      return {
        success: false,
        error: `Erro da API: ${message}`,
        _source: 'api_error'
      }
    }

    return {
      success: false,
      error: 'Erro de conexão. Verifique sua conexão com a internet.',
      _source: 'connection_error'
    }
  }
}

/**
 * Obter perfil da empresa
 * GET /api/tenant/configuration
 */
export const getTenantProfile = async (): Promise<ApiResponse> => {
  try {
    console.log('🏢 Buscando perfil da empresa...')
    const response = await api.get('/tenant/configuration')
    console.log('✅ Perfil da empresa carregado:', response.data)

    // Extrair dados do perfil da resposta completa
    const profileData = response.data?.data?.profile || response.data?.profile || response.data

    return {
      success: true,
      data: profileData,
      message: 'Perfil da empresa carregado com sucesso'
    }
  } catch (error) {
    console.error('❌ Erro ao carregar perfil da empresa:', error)
    return handleApiError(error, 'profile', null)
  }
}

/**
 * Obter tema do tenant
 * GET /api/tenant/configuration/theme
 */
export const getTenantTheme = async (): Promise<ApiResponse> => {
  try {
    console.log('🎨 Buscando tema do tenant...')
    const response = await api.get('/tenant/configuration/theme')
    console.log('✅ Tema do tenant carregado:', response.data)

    return {
      success: true,
      data: response.data,
      message: 'Tema do tenant carregado com sucesso'
    }
  } catch (error) {
    console.error('❌ Erro ao carregar tema do tenant:', error)
    return handleApiError(error, 'theme', null)
  }
}

/**
 * Obter configurações SEO do tenant
 * GET /api/tenant/configuration/seo
 */
export const getTenantSeo = async (): Promise<ApiResponse> => {
  try {
    console.log('🔍 Buscando configurações SEO...')
    const response = await api.get('/tenant/configuration/seo')
    console.log('✅ Configurações SEO carregadas:', response.data)

    return {
      success: true,
      data: response.data,
      message: 'Configurações SEO carregadas com sucesso'
    }
  } catch (error) {
    console.error('❌ Erro ao carregar configurações SEO:', error)
    return handleApiError(error, 'seo', null)
  }
}

/**
 * Obter configurações do portal
 * GET /api/tenant/configuration/portal
 */
export const getTenantPortal = async (): Promise<ApiResponse> => {
  try {
    console.log('🌐 Buscando configurações do portal...')
    const response = await api.get('/tenant/configuration/portal')
    console.log('✅ Configurações do portal carregadas:', response.data)

    return {
      success: true,
      data: response.data,
      message: 'Configurações do portal carregadas com sucesso'
    }
  } catch (error) {
    console.error('❌ Erro ao carregar configurações do portal:', error)
    return handleApiError(error, 'portal', null)
  }
}

/**
 * Atualizar perfil da empresa
 * PUT /api/tenant/configuration/profile
 */
export const updateTenantProfile = async (profile: {
  id?: number
  name: string
  description?: string
  cnpj?: string
  phone?: string
  email?: string
  website?: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  business_hours?: {
    monday: string[]
    tuesday: string[]
    wednesday: string[]
    thursday: string[]
    friday: string[]
    saturday: string[]
    sunday: string[]
  }
  social_media?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    youtube?: string
    whatsapp?: string
  }
  logo_url?: string
  favicon_url?: string
  banner_url?: string
  created_at?: string
  updated_at?: string
}): Promise<ApiResponse> => {
  try {
    console.log('🔧 Atualizando perfil da empresa:', profile)

    // Carregar dados existentes do tenant para garantir campos obrigatórios
    let existingProfile: Record<string, unknown> | null = null
    try {
      const existingResponse = await getTenantProfile()
      if (existingResponse.success && existingResponse.data) {
        existingProfile = existingResponse.data as Record<string, unknown>
        console.log('📋 Dados existentes carregados:', existingProfile)
        console.log('📋 Social media existente:', existingProfile.social_media)
      }
    } catch (error) {
      console.warn('⚠️ Não foi possível carregar dados existentes:', error)
    }

    // Converter para estrutura da API com fallback para dados existentes
    const apiData = {
      company_name: profile.name || existingProfile?.company_name || 'Empresa',
      company_description: profile.description || existingProfile?.company_description || '',
      company_cnpj: profile.cnpj || existingProfile?.company_cnpj || '',
      company_phone: profile.phone || existingProfile?.company_phone || '',
      company_email: profile.email || existingProfile?.company_email || 'contato@empresa.com',
      company_website: profile.website || existingProfile?.company_website || '',
      // Endereço - campos separados
      address_street: profile.address?.street || existingProfile?.address_street || '',
      address_number: profile.address?.number || existingProfile?.address_number || '',
      address_complement: profile.address?.complement || existingProfile?.address_complement || '',
      address_district: profile.address?.neighborhood || existingProfile?.address_district || '',
      address_city: profile.address?.city || existingProfile?.address_city || '',
      address_state: profile.address?.state || existingProfile?.address_state || '',
      address_zipcode: profile.address?.zip_code || existingProfile?.address_zipcode || '',
      address_country: profile.address?.country || existingProfile?.address_country || 'Brasil',
      // Redes sociais - enviar como array
      social_media: profile.social_media ?
        Object.entries(profile.social_media)
          .filter(([key, value]) => {
            console.log(`🔍 Validando rede social ${key}:`, { value, type: typeof value })
            try {
              const isValid = value && typeof value === 'string' && value.trim() !== ''
              console.log(`✅ Rede social ${key} válida:`, isValid)
              return isValid
            } catch (error) {
              console.warn('⚠️ Erro ao validar valor de social_media:', value, error)
              return false
            }
          })
          .map(([key, value]) => {
            const result = { platform: key, url: value }
            console.log(`📤 Mapeando rede social ${key}:`, result)
            return result
          }) :
        [],
      // Imagens - otimizar Base64 para evitar erro 500
      logo_url: (() => {
        const logoUrl = String(profile.logo_url || existingProfile?.logo_url || '')
        if (logoUrl.startsWith('data:image/')) {
          // Para SVG, converter para PNG ou limitar drasticamente
          if (logoUrl.includes('svg') && logoUrl.length > 50000) {
            console.warn('⚠️ Logo SVG Base64 muito longo, removendo para evitar erro 500')
            return ''
          }
          // Para outros formatos, limite mais generoso
          if (!logoUrl.includes('svg') && logoUrl.length > 100000) {
            console.warn('⚠️ Logo Base64 muito longo, removendo para evitar erro 500')
            return ''
          }
        }
        return logoUrl
      })(),
      favicon_url: (() => {
        const faviconUrl = String(profile.favicon_url || existingProfile?.favicon_url || '')
        console.log('🔍 Processando favicon_url:', {
          original: profile.favicon_url,
          existing: existingProfile?.favicon_url,
          final: faviconUrl,
          length: faviconUrl.length,
          isBase64: faviconUrl.startsWith('data:image/')
        })
        if (faviconUrl.startsWith('data:image/')) {
          // Favicon deve ser pequeno, limite mais restritivo
          if (faviconUrl.length > 20000) {
            console.warn('⚠️ Favicon Base64 muito longo, removendo para evitar erro 500')
            return ''
          }
        }
        return faviconUrl
      })(),
      banner_url: (() => {
        const bannerUrl = String(profile.banner_url || existingProfile?.banner_url || '')
        console.log('🔍 Processando banner_url:', {
          original: profile.banner_url,
          existing: existingProfile?.banner_url,
          final: bannerUrl,
          length: bannerUrl.length,
          isBase64: bannerUrl.startsWith('data:image/')
        })
        if (bannerUrl.startsWith('data:image/')) {
          // Banner pode ser maior, mas ainda com limite
          if (bannerUrl.length > 150000) {
            console.warn('⚠️ Banner Base64 muito longo, removendo para evitar erro 500')
            return ''
          }
        }
        return bannerUrl
      })()
    }

    console.log('🔧 Dados convertidos para API:', JSON.stringify(apiData, null, 2))
    console.log('🔧 Social Media convertido:', apiData.social_media)
    console.log('🔧 Tipo do social_media:', typeof apiData.social_media)
    console.log('🔧 É array?', Array.isArray(apiData.social_media))
    console.log('🔧 Social Media original:', profile.social_media)
    console.log('🔧 Tipo do social_media original:', typeof profile.social_media)
    console.log('🔧 Social Media original keys:', profile.social_media ? Object.keys(profile.social_media) : 'N/A')
    console.log('🔧 Social Media original values:', profile.social_media ? Object.values(profile.social_media) : 'N/A')

    // Logs específicos para imagens
    console.log('🖼️ Logo URL processado:', {
      original: profile.logo_url,
      processed: apiData.logo_url,
      length: apiData.logo_url?.length || 0,
      isBase64: apiData.logo_url?.startsWith('data:image/') || false
    })
    console.log('🖼️ Favicon URL processado:', {
      original: profile.favicon_url,
      processed: apiData.favicon_url,
      length: apiData.favicon_url?.length || 0,
      isBase64: apiData.favicon_url?.startsWith('data:image/') || false
    })
    console.log('🖼️ Banner URL processado:', {
      original: profile.banner_url,
      processed: apiData.banner_url,
      length: apiData.banner_url?.length || 0,
      isBase64: apiData.banner_url?.startsWith('data:image/') || false
    })

    // Debug: Verificar se há campos obrigatórios faltando
    const requiredFields = ['company_name', 'company_email']
    const missingFields = requiredFields.filter(field => {
      const value = apiData[field as keyof typeof apiData]
      return !value || (typeof value === 'string' && value.trim() === '')
    })

    if (missingFields.length > 0) {
      console.error('❌ Campos obrigatórios faltando:', missingFields)
      console.error('❌ Valores atuais:', {
        company_name: apiData.company_name,
        company_email: apiData.company_email
      })
      return {
        success: false,
        error: `Campos obrigatórios faltando: ${missingFields.join(', ')}. Estes campos devem ter valores válidos.`
      }
    }

    // Debug: Verificar se campos de imagem estão sendo enviados
    console.log('🔍 Verificação final dos campos de imagem:', {
      logo_url: {
        value: apiData.logo_url,
        length: apiData.logo_url?.length || 0,
        isEmpty: !apiData.logo_url || apiData.logo_url.trim() === ''
      },
      favicon_url: {
        value: apiData.favicon_url,
        length: apiData.favicon_url?.length || 0,
        isEmpty: !apiData.favicon_url || apiData.favicon_url.trim() === ''
      },
      banner_url: {
        value: apiData.banner_url,
        length: apiData.banner_url?.length || 0,
        isEmpty: !apiData.banner_url || apiData.banner_url.trim() === ''
      }
    })

    // Debug: Verificar se social_media está no formato correto
    if (apiData.social_media && !Array.isArray(apiData.social_media)) {
      console.error('❌ Social media não é um array:', apiData.social_media)
      apiData.social_media = []
    }

    // Debug: Verificar se social_media tem estrutura válida
    if (Array.isArray(apiData.social_media)) {
      console.log('🔍 Validando estrutura do social_media array:')
      apiData.social_media.forEach((item, index) => {
        console.log(`  Item ${index}:`, item)
        if (!item.platform || !item.url) {
          console.error(`❌ Item ${index} inválido:`, item)
        }
      })
    }

    console.log('🔧 Dados finais antes do envio:', JSON.stringify(apiData, null, 2))
    console.log('🔧 URL da requisição:', '/tenant/configuration/profile')
    console.log('🔧 Tipo de dados:', typeof apiData)
    console.log('🔧 Social media final:', apiData.social_media)

    try {
      const response = await api.put('/tenant/configuration/profile', apiData)
      console.log('✅ Resposta da API:', response.data)
      console.log('✅ Perfil da empresa atualizado com sucesso')

      // Salvar no localStorage como fallback
      try {
        const existingConfig = localStorage.getItem('tenant_configuration')
        const existingData = existingConfig ? JSON.parse(existingConfig) : {}
        const updatedConfig = { ...existingData, profile }
        localStorage.setItem('tenant_configuration', JSON.stringify(updatedConfig))
        localStorage.setItem('last_config_save', new Date().toISOString())
      } catch (localStorageError) {
        console.warn('⚠️ Erro ao salvar no localStorage:', localStorageError)
      }

      return {
        success: true,
        data: response.data,
        message: 'Perfil da empresa atualizado com sucesso'
      }
    } catch (error) {
      console.error('❌ Erro na requisição PUT:', error)
      if (axios.isAxiosError(error)) {
        console.error('❌ Status:', error.response?.status)
        console.error('❌ Dados da resposta:', error.response?.data)
        console.error('❌ Headers da resposta:', error.response?.headers)
        console.error('❌ Dados enviados:', apiData)
      }
      throw error
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil da empresa:', error)

    if (axios.isAxiosError(error)) {
      console.log('🔍 Detalhes do erro da API:')
      console.log('🔍 Status:', error.response?.status)
      console.log('🔍 Mensagem:', error.response?.data?.message)
      console.log('🔍 Erros:', error.response?.data?.errors)

      // Recriar apiData para o log de erro
      const apiDataForLog = {
        company_name: profile.name || '',
        company_description: profile.description || '',
        company_cnpj: profile.cnpj || '',
        company_phone: profile.phone || '',
        company_email: profile.email || '',
        company_website: profile.website || '',
        // Endereço - campos separados
        address_street: profile.address?.street || '',
        address_number: profile.address?.number || '',
        address_complement: profile.address?.complement || '',
        address_district: profile.address?.neighborhood || '',
        address_city: profile.address?.city || '',
        address_state: profile.address?.state || '',
        address_zipcode: profile.address?.zip_code || '',
        address_country: profile.address?.country || 'Brasil',
        // Redes sociais - enviar como array
        social_media: profile.social_media ?
          Object.entries(profile.social_media)
            .filter(([, value]) => {
              try {
                return value && typeof value === 'string' && value.trim() !== ''
  } catch (error) {
                console.warn('⚠️ Erro ao validar valor de social_media:', value, error)
    return false
  }
            })
            .map(([key, value]) => ({ platform: key, url: value })) :
          [],
        // Imagens
        logo_url: profile.logo_url || '',
        favicon_url: profile.favicon_url || '',
        banner_url: profile.banner_url || ''
      }
      console.log('🔍 Dados enviados:', JSON.stringify(apiDataForLog, null, 2))
    }

    return handleApiError(error, 'profile', profile)
  }
}

/**
 * Atualizar tema do tenant
 * PUT /api/tenant/configuration/theme
 */
export const updateTenantTheme = async (theme: {
  id?: number
  colors?: {
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
    // Cores detalhadas do layout
    head?: {
      background: string
      text: string
      border: string
    }
    footer?: {
      background: string
      text: string
      border: string
      columns: {
        background: string
        text: string
        title: string
      }
    }
    banner?: {
      background: string
      text: string
      overlay: string
    }
    buttons?: {
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
  typography?: {
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
  layout?: {
    border_radius: string
    spacing: string
    container_max_width: string
    sidebar_width: string
  }
  components?: {
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
  features?: {
    dark_mode: boolean
    animations: boolean
    transitions: boolean
  }
  custom_css?: string
  css_variables?: Record<string, string>
  created_at?: string
  updated_at?: string
}): Promise<ApiResponse> => {
  try {
    console.log('🔧 Atualizando tema do tenant:', theme)
    console.log('🔧 Cores do tema:', theme.colors)
    console.log('🔧 Tipografia do tema:', theme.typography)
    console.log('🔧 Layout do tema:', theme.layout)

    // Converter para estrutura da API
    const apiData = {
      primary_color: theme.colors?.primary || '#3B82F6',
      secondary_color: theme.colors?.secondary || '#64748B',
      accent_color: theme.colors?.accent || '#F59E0B',
      font_family: theme.typography?.font_family || 'Inter',
      border_radius: theme.layout?.border_radius || '0.5rem',
      // Enviar todas as configurações de cores detalhadas
      colors: {
        primary: theme.colors?.primary || '#3B82F6',
        secondary: theme.colors?.secondary || '#64748B',
        accent: theme.colors?.accent || '#F59E0B',
        success: theme.colors?.success || '#10B981',
        warning: theme.colors?.warning || '#F59E0B',
        danger: theme.colors?.danger || '#EF4444',
        info: theme.colors?.info || '#3B82F6',
        background: theme.colors?.background || '#F8FAFC',
        surface: theme.colors?.surface || '#FFFFFF',
        text: theme.colors?.text || '#1E293B',
        text_muted: theme.colors?.text_muted || '#64748B',
        // Cores do Head
        head: theme.colors?.head || {
          background: '#EF4444',
          text: '#FFFFFF',
          border: '#DC2626'
        },
        // Cores do Footer
        footer: theme.colors?.footer || {
          background: '#1F2937',
          text: '#F9FAFB',
          border: '#374151',
          columns: {
            background: '#111827',
            text: '#D1D5DB',
            title: '#F9FAFB'
          }
        },
        // Cores do Banner
        banner: theme.colors?.banner || {
          background: '#1F2937',
          text: '#FFFFFF',
          overlay: 'rgba(0, 0, 0, 0.5)'
        },
        // Cores dos Botões
        buttons: theme.colors?.buttons || {
          primary: {
            background: '#3B82F6',
            text: '#FFFFFF',
            hover_background: '#2563EB',
            hover_text: '#FFFFFF',
            border: '#3B82F6'
          },
          secondary: {
            background: '#64748B',
            text: '#FFFFFF',
            hover_background: '#475569',
            hover_text: '#FFFFFF',
            border: '#64748B'
          },
          accent: {
            background: '#F59E0B',
            text: '#FFFFFF',
            hover_background: '#D97706',
            hover_text: '#FFFFFF',
            border: '#F59E0B'
          }
        }
      }
    }

    console.log('🔧 Dados convertidos para API:', JSON.stringify(apiData, null, 2))
    console.log('🔧 Verificando se há valores undefined:', {
      primary_color: apiData.primary_color,
      secondary_color: apiData.secondary_color,
      accent_color: apiData.accent_color,
      font_family: apiData.font_family,
      border_radius: apiData.border_radius,
      has_colors: !!apiData.colors,
      colors_keys: apiData.colors ? Object.keys(apiData.colors) : []
    })

    console.log('🔧 Fazendo requisição PUT para /tenant/configuration/theme')
    const response = await api.put('/tenant/configuration/theme', apiData)
    console.log('✅ Tema do tenant atualizado com sucesso')
    console.log('✅ Resposta da API:', response.data)

    // Salvar no localStorage como fallback
    try {
      const existingConfig = localStorage.getItem('tenant_configuration')
      const existingData = existingConfig ? JSON.parse(existingConfig) : {}
      const updatedConfig = { ...existingData, theme }
      localStorage.setItem('tenant_configuration', JSON.stringify(updatedConfig))
      localStorage.setItem('last_config_save', new Date().toISOString())
    } catch (localStorageError) {
      console.warn('⚠️ Erro ao salvar no localStorage:', localStorageError)
    }

    return {
      success: true,
      data: response.data,
      message: 'Tema do tenant atualizado com sucesso'
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar tema do tenant:', error)

    if (axios.isAxiosError(error)) {
      console.log('🔍 Detalhes do erro da API:')
      console.log('🔍 Status:', error.response?.status)
      console.log('🔍 Mensagem:', error.response?.data?.message)
      console.log('🔍 Erros:', error.response?.data?.errors)

      // Recriar apiData para o log de erro
      const apiDataForLog = {
        primary_color: theme.colors?.primary,
        secondary_color: theme.colors?.secondary,
        accent_color: theme.colors?.accent,
        font_family: theme.typography?.font_family,
        border_radius: theme.layout?.border_radius,
        colors: theme.colors
      }
      console.log('🔍 Dados enviados:', JSON.stringify(apiDataForLog, null, 2))
    }

    return handleApiError(error, 'theme', theme)
  }
}

/**
 * Atualizar configurações SEO do tenant
 * PUT /api/tenant/configuration/seo
 */
export const updateTenantSeo = async (seo: {
  id?: number
  meta: {
    title: string
    description: string
    keywords: string
    author: string
    robots: string
    canonical_url?: string
  }
  open_graph: {
    title: string
    description: string
    image_url?: string
    site_name: string
    type: string
    locale: string
  }
  twitter_card: {
    card_type: string
    title: string
    description: string
    image_url?: string
    creator?: string
    site?: string
  }
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
  advanced: {
    amp_enabled: boolean
    sitemap_enabled: boolean
    structured_data: boolean
  }
  created_at?: string
  updated_at?: string
}): Promise<ApiResponse> => {
  try {
    console.log('🔍 Atualizando configurações SEO do tenant:', seo)

    // Converter para estrutura da API
    const apiData = {
      meta_title: seo.meta.title,
      meta_description: seo.meta.description,
      meta_keywords: seo.meta.keywords,
      meta_author: seo.meta.author,
      meta_robots: seo.meta.robots,
      canonical_url: seo.meta.canonical_url,
      // Open Graph
      og_title: seo.open_graph.title,
      og_description: seo.open_graph.description,
      og_image: seo.open_graph.image_url,
      og_site_name: seo.open_graph.site_name,
      og_type: seo.open_graph.type,
      og_locale: seo.open_graph.locale,
      // Twitter Card
      twitter_card: seo.twitter_card.card_type,
      twitter_title: seo.twitter_card.title,
      twitter_description: seo.twitter_card.description,
      twitter_image: seo.twitter_card.image_url,
      twitter_creator: seo.twitter_card.creator,
      twitter_site: seo.twitter_card.site,
      // Schema.org
      schema_organization_type: seo.schema_org.organization_type,
      schema_industry: seo.schema_org.industry,
      schema_founding_date: seo.schema_org.founding_date,
      schema_contact_point: seo.schema_org.contact_point,
      schema_same_as: seo.schema_org.same_as,
      // Recursos avançados
      amp_enabled: seo.advanced.amp_enabled,
      sitemap_enabled: seo.advanced.sitemap_enabled,
      structured_data: seo.advanced.structured_data
    }

    console.log('🔍 Dados convertidos para API:', JSON.stringify(apiData, null, 2))

    const response = await api.put('/tenant/configuration/seo', apiData)
    console.log('✅ Configurações SEO do tenant atualizadas com sucesso')

    // Salvar no localStorage como fallback
    try {
      const existingConfig = localStorage.getItem('tenant_configuration')
      const existingData = existingConfig ? JSON.parse(existingConfig) : {}
      const updatedConfig = { ...existingData, seo }
      localStorage.setItem('tenant_configuration', JSON.stringify(updatedConfig))
      localStorage.setItem('last_config_save', new Date().toISOString())
    } catch (localStorageError) {
      console.warn('⚠️ Erro ao salvar no localStorage:', localStorageError)
    }

    return {
      success: true,
      data: response.data,
      message: 'Configurações SEO do tenant atualizadas com sucesso'
            }
    } catch (error) {
    console.error('❌ Erro ao atualizar configurações SEO do tenant:', error)

    if (axios.isAxiosError(error)) {
      console.log('🔍 Detalhes do erro da API:')
      console.log('🔍 Status:', error.response?.status)
      console.log('🔍 Mensagem:', error.response?.data?.message)
      console.log('🔍 Erros:', error.response?.data?.errors)

      // Recriar apiData para o log de erro
      const apiDataForLog = {
        meta_title: seo.meta.title,
        meta_description: seo.meta.description,
        meta_keywords: seo.meta.keywords,
        og_title: seo.open_graph.title,
        og_description: seo.open_graph.description
      }
      console.log('🔍 Dados enviados:', JSON.stringify(apiDataForLog, null, 2))
    }

    return handleApiError(error, 'seo', seo)
  }
}

/**
 * Atualizar configurações do portal
 * PUT /api/tenant/configuration/portal
 */
export const updateTenantPortal = async (portal: {
  id?: number
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
  display: {
    vehicles_per_page: number
    max_comparison_items: number
    show_prices: boolean
    show_mileage: boolean
    show_fuel_consumption: boolean
    image_gallery: boolean
    video_support: boolean
  }
  forms: {
    required_fields: string[]
    captcha_enabled: boolean
    gdpr_compliance: boolean
    privacy_policy_url?: string
    terms_url?: string
  }
  integrations: {
    google_analytics_id?: string
    facebook_pixel_id?: string
    whatsapp_number?: string
    google_maps_api_key?: string
    recaptcha_site_key?: string
  }
  performance: {
    image_optimization: boolean
    lazy_loading: boolean
    cache_enabled: boolean
    cdn_enabled: boolean
  }
  created_at?: string
  updated_at?: string
}): Promise<ApiResponse> => {
  try {
    console.log('🌐 Atualizando configurações do portal:', portal)

    // Converter para estrutura da API
    const apiData = {
      // Funcionalidades
      enable_search: portal.features.search,
      enable_filters: portal.features.filters,
      enable_comparison: portal.features.comparison,
      enable_favorites: portal.features.wishlist,
      enable_reviews: portal.features.reviews,
      enable_contact_form: portal.features.whatsapp_button,
      enable_newsletter: false,
      // Exibição
      vehicles_per_page: portal.display.vehicles_per_page,
      show_price: portal.display.show_prices,
      show_mileage: portal.display.show_mileage,
      show_year: false,
      show_fuel_type: false,
      show_transmission: false,
      show_engine: false,
      show_color: false,
      show_features: false,
      // Integrações
      whatsapp_number: portal.integrations.whatsapp_number,
      google_analytics_id: portal.integrations.google_analytics_id,
      facebook_pixel_id: portal.integrations.facebook_pixel_id,
      google_maps_api_key: portal.integrations.google_maps_api_key,
      recaptcha_site_key: portal.integrations.recaptcha_site_key,
      // Performance
      image_optimization: portal.performance.image_optimization,
      lazy_loading: portal.performance.lazy_loading,
      cache_enabled: portal.performance.cache_enabled,
      cdn_enabled: portal.performance.cdn_enabled
    }

    console.log('🌐 Dados convertidos para API:', JSON.stringify(apiData, null, 2))

    const response = await api.put('/tenant/configuration/portal', apiData)
    console.log('✅ Configurações do portal atualizadas com sucesso')

    // Salvar no localStorage como fallback
    try {
      const existingConfig = localStorage.getItem('tenant_configuration')
      const existingData = existingConfig ? JSON.parse(existingConfig) : {}
      const updatedConfig = { ...existingData, portal_settings: portal }
      localStorage.setItem('tenant_configuration', JSON.stringify(updatedConfig))
      localStorage.setItem('last_config_save', new Date().toISOString())
    } catch (localStorageError) {
      console.warn('⚠️ Erro ao salvar no localStorage:', localStorageError)
    }

    return {
      success: true,
      data: response.data,
      message: 'Configurações do portal atualizadas com sucesso'
            }
          } catch (error) {
    console.error('❌ Erro ao atualizar configurações do portal:', error)

    if (axios.isAxiosError(error)) {
      console.log('🔍 Detalhes do erro da API:')
      console.log('🔍 Status:', error.response?.status)
      console.log('🔍 Mensagem:', error.response?.data?.message)
      console.log('🔍 Erros:', error.response?.data?.errors)

      // Recriar apiData para o log de erro
      const apiDataForLog = {
        // Funcionalidades
        enable_search: portal.features.search,
        enable_filters: portal.features.filters,
        enable_comparison: portal.features.comparison,
        enable_favorites: portal.features.wishlist,
        enable_reviews: portal.features.reviews,
        enable_contact_form: portal.features.whatsapp_button,
        enable_newsletter: false,
        // Exibição
        vehicles_per_page: portal.display.vehicles_per_page,
        show_price: portal.display.show_prices,
        show_mileage: portal.display.show_mileage,
        show_year: false,
        show_fuel_type: false,
        show_transmission: false,
        show_engine: false,
        show_color: false,
        show_features: false,
        // Integrações
        whatsapp_number: portal.integrations.whatsapp_number,
        google_analytics_id: portal.integrations.google_analytics_id,
        facebook_pixel_id: portal.integrations.facebook_pixel_id,
        google_maps_api_key: portal.integrations.google_maps_api_key,
        recaptcha_site_key: portal.integrations.recaptcha_site_key,
        // Performance
        image_optimization: portal.performance.image_optimization,
        lazy_loading: portal.performance.lazy_loading,
        cache_enabled: portal.performance.cache_enabled,
        cdn_enabled: portal.performance.cdn_enabled
      }
      console.log('🔍 Dados enviados:', JSON.stringify(apiDataForLog, null, 2))
    }

    return handleApiError(error, 'portal', portal)
  }
}

// Exportar a instância da API
export default api

// Funções de autenticação
export const apiPost = async <T = unknown>(url: string, data: unknown): Promise<T> => {
  const response = await api.post(url, data)
  return response.data
}

export const apiGet = async <T = unknown>(url: string): Promise<T> => {
  const response = await api.get(url)
  return response.data
}

export const apiLogout = async () => {
  try {
    await api.post('/auth/logout')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('tenant_subdomain')
    return { success: true }
  } catch (error) {
    console.error('Erro no logout:', error)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('tenant_subdomain')
    return { success: true }
  }
}

export const apiTenantRegister = async (data: unknown) => {
  return api.post('/auth/tenant/register', data)
}

export const apiForgotPassword = async (data: unknown) => {
  return api.post('/auth/forgot-password', data)
}

export const apiResetPassword = async (data: unknown) => {
  return api.post('/auth/reset-password', data)
}

// Funções de configurações do site
export const getTenantSiteSettings = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get('/tenant/site/settings')
    return {
      success: true,
      data: response.data.data
    }
  } catch (error) {
    console.error('Erro ao carregar configurações do site:', error)
    return {
      success: false,
      error: 'Erro ao carregar configurações do site'
    }
  }
}

export const updateTenantSiteSettings = async (settings: unknown): Promise<ApiResponse> => {
  try {
    const response = await api.put('/tenant/site/settings', settings)
    return {
      success: true,
      data: response.data,
      message: 'Configurações do site atualizadas com sucesso'
    }
  } catch (error) {
    console.error('Erro ao atualizar configurações do site:', error)
    return {
      success: false,
      error: 'Erro ao atualizar configurações do site'
    }
  }
}

// Funções de gerenciamento de imagens de veículos
export const getVehicleImages = async (vehicleId: number): Promise<ApiResponse> => {
  try {
    const response = await api.get(`/vehicles/${vehicleId}/images`)
    return {
      success: true,
      data: response.data.data
    }
  } catch (error) {
    console.error('Erro ao carregar imagens do veículo:', error)
    return {
      success: false,
      error: 'Erro ao carregar imagens do veículo'
    }
  }
}

export const setPrimaryImage = async (vehicleId: number, imageId: number): Promise<ApiResponse> => {
  try {
    const response = await api.put(`/vehicles/${vehicleId}/images/${imageId}/primary`)
    return {
      success: true,
      data: response.data,
      message: 'Imagem definida como principal com sucesso'
    }
  } catch (error) {
    console.error('Erro ao definir imagem principal:', error)
    return {
      success: false,
      error: 'Erro ao definir imagem principal'
    }
  }
}

export const updateVehicleImage = async (vehicleId: number, imageId: number, data: unknown): Promise<ApiResponse> => {
  try {
    const response = await api.put(`/vehicles/${vehicleId}/images/${imageId}`, data)
    return {
      success: true,
      data: response.data,
      message: 'Imagem atualizada com sucesso'
    }
  } catch (error) {
    console.error('Erro ao atualizar imagem:', error)
    return {
      success: false,
      error: 'Erro ao atualizar imagem'
    }
  }
}

export const deleteVehicleImage = async (vehicleId: number, imageId: number): Promise<ApiResponse> => {
  try {
    await api.delete(`/vehicles/${vehicleId}/images/${imageId}`)
    return {
      success: true,
      message: 'Imagem excluída com sucesso'
    }
  } catch (error) {
    console.error('Erro ao excluir imagem:', error)
    return {
      success: false,
      error: 'Erro ao excluir imagem'
    }
  }
}

// Função para configurações do portal (alias para compatibilidade)
export const updateTenantPortalSettings = updateTenantPortal

// Função para upload de imagens de veículos
export const uploadVehicleImage = async (vehicleId: number, formData: FormData): Promise<ApiResponse> => {
  try {
    const response = await api.post(`/vehicles/${vehicleId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return {
      success: true,
      data: response.data,
      message: 'Imagem enviada com sucesso'
    }
  } catch (error) {
    console.error('Erro ao enviar imagem:', error)
    return {
      success: false,
      error: 'Erro ao enviar imagem'
    }
  }
}

// Função para upload de imagens do tenant (logo, favicon, banner)
// Seguindo o mesmo padrão usado para upload de imagens de veículos
export const uploadTenantImage = async (imageType: 'logo' | 'favicon' | 'banner', file: File): Promise<ApiResponse & { data?: { url: string } }> => {
  try {
    console.log(`🖼️ Fazendo upload de ${imageType}:`, {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Por favor, selecione apenas arquivos de imagem'
      }
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: `Arquivo muito grande. Tamanho máximo: ${maxSize / 1024 / 1024}MB`
      }
    }

    // Criar FormData seguindo o mesmo padrão dos veículos
    const formData = new FormData()
    formData.append('image', file) // Campo principal da imagem
    formData.append('type', imageType) // Tipo da imagem (logo, favicon, banner)

    // Debug: Log do FormData criado
    console.log(`📋 FormData criado para ${imageType}:`)
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value)
    }

    // Tentar upload para endpoint específico do tenant
    try {
      const response = await api.post('/tenant/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('✅ Upload realizado com sucesso:', response.data)

      return {
        success: true,
        data: { url: response.data.image_url || response.data.url },
        message: 'Imagem enviada com sucesso'
      }
    } catch (uploadError: unknown) {
      const status = axios.isAxiosError(uploadError) ? uploadError.response?.status : 'unknown'
      console.warn('⚠️ Upload para servidor falhou, usando base64 como fallback:', status)

      // Fallback para base64 se o upload falhar
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64Result = e.target?.result as string
          console.log('✅ Imagem convertida para base64 (fallback):', imageType)

          resolve({
            success: true,
            data: { url: base64Result },
            message: 'Imagem processada com sucesso (base64)'
          })
        }
        reader.onerror = () => {
          resolve({
            success: false,
            error: 'Erro ao processar a imagem'
          })
        }
        reader.readAsDataURL(file)
      })
    }
  } catch (error: unknown) {
    console.error('❌ Erro ao processar imagem do tenant:', error)

    return {
      success: false,
      error: 'Erro ao processar a imagem'
    }
  }
}

// ===== FUNÇÕES DA API FIPE =====

// Buscar marcas da FIPE
export const getFipeBrands = async (vehicleType: 'cars' | 'motorcycles' | 'trucks' = 'cars') => {
  try {
    const response = await fetch(`https://parallelum.com.br/fipe/api/v1/${vehicleType}/marcas`)
    if (!response.ok) {
      throw new Error('Erro ao buscar marcas da FIPE')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao buscar marcas da FIPE:', error)
    throw error
  }
}

// Buscar modelos da FIPE por marca
export const getFipeModels = async (vehicleType: 'cars' | 'motorcycles' | 'trucks', brandId: number) => {
  try {
    const response = await fetch(`https://parallelum.com.br/fipe/api/v1/${vehicleType}/marcas/${brandId}/modelos`)
    if (!response.ok) {
      throw new Error('Erro ao buscar modelos da FIPE')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao buscar modelos da FIPE:', error)
    throw error
  }
}

// Buscar anos do modelo na FIPE
export const getFipeYears = async (vehicleType: 'cars' | 'motorcycles' | 'trucks', brandId: number, modelId: number) => {
  try {
    const response = await fetch(`https://parallelum.com.br/fipe/api/v1/${vehicleType}/marcas/${brandId}/modelos/${modelId}/anos`)
    if (!response.ok) {
      throw new Error('Erro ao buscar anos da FIPE')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao buscar anos da FIPE:', error)
    throw error
  }
}

// Buscar dados completos do veículo na FIPE
export const getFipeVehicle = async (vehicleType: 'cars' | 'motorcycles' | 'trucks', brandId: number, modelId: number, yearId: string) => {
  try {
    const response = await fetch(`https://parallelum.com.br/fipe/api/v1/${vehicleType}/marcas/${brandId}/modelos/${modelId}/anos/${yearId}`)
    if (!response.ok) {
      throw new Error('Erro ao buscar dados do veículo na FIPE')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao buscar dados do veículo na FIPE:', error)
    throw error
  }
}

// Buscar versões do modelo na FIPE
export const getFipeVersions = async (vehicleType: 'cars' | 'motorcycles' | 'trucks', brandId: number, modelId: number) => {
  try {
    const response = await fetch(`https://parallelum.com.br/fipe/api/v1/${vehicleType}/marcas/${brandId}/modelos/${modelId}/anos`)
    if (!response.ok) {
      throw new Error('Erro ao buscar versões da FIPE')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao buscar versões da FIPE:', error)
    throw error
  }
}
