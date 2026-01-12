// API específica para o portal público
import { vehicleBrands } from './vehicle-brands-data'

export interface PortalVehicle {
  id: number
  title: string
  main_image: string | { url: string; id: number } | null
  images: Array<{
    id: number
    image_url: string
    url?: string
    is_primary: boolean
  }> | null
  city: string | null
  price: number | null
  year: number | null
  mileage: number | null
  fuel_type: string | null
  transmission: string | null
  brand: string | { id: number; name: string; slug: string } | null
  model: string | { id: number; name: string; slug: string } | null
  description: string | null
  status: string | null
  created_at: string | null
  tenant?: {
    id: number
    name: string
    subdomain: string
    custom_domain?: string | null
  }
  vehicle_type?: string
  condition?: string
  version?: string
  color?: string
  doors?: number
  engine?: string
  power?: string
  torque?: string
  consumption_city?: string
  consumption_highway?: string
  plate?: string
  chassi?: string
  renavam?: string
  accept_financing?: boolean
  accept_exchange?: boolean
  is_featured?: boolean
  has_warranty?: boolean
  fipe_price?: number
  video_link?: string | null
}

export interface PortalTenant {
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
  // Estrutura real da API
  profile?: {
    company_name?: string
    company_description?: string
    company_phone?: string
    company_email?: string
    company_website?: string | null
    address?: string
    logo_url?: string | null
    favicon_url?: string | null
    banner_url?: string | null
  }
  theme?: {
    theme?: {
      name?: string
      version?: string
      colors?: { [key: string]: string }
      typography?: {
        fontFamily?: string
        fontSizeBase?: string
        fontSizeSmall?: string
        fontSizeLarge?: string
        fontWeightNormal?: string
        fontWeightBold?: string
      }
      layout?: {
        borderRadius?: string
        borderRadiusLarge?: string
        borderRadiusSmall?: string
        spacingUnit?: string
        containerMaxWidth?: string
      }
      components?: {
        buttonStyle?: string
        cardStyle?: string
        formStyle?: string
      }
      features?: {
        darkMode?: boolean
        animations?: boolean
      }
    }
    css?: string
    customJs?: string[]
  }
  seo?: {
    meta?: {
      title?: string
      description?: string
      keywords?: string
    }
    open_graph?: {
      title?: string
      description?: string
      image_url?: string | null
    }
  }
  portal_settings?: {
    features?: string[]
    display?: {
      show_featured_vehicles?: boolean
    }
  }
  configuration?: {
    theme?: {
      colors?: { [key: string]: string }
      typography?: { font_family?: string }
      custom_css?: string
      layout?: {
        border_radius?: string
        spacing?: string
        container_max_width?: string
      }
    }
    seo?: {
      meta?: {
        title?: string
        description?: string
        keywords?: string
      }
      open_graph?: {
        title?: string
        description?: string
        image_url?: string
      }
    }
    portal_settings?: {
      features?: {
        whatsapp_button?: boolean
        search?: boolean
        filters?: boolean
      }
      integrations?: {
        whatsapp_number?: string
        google_analytics_id?: string
        facebook_pixel_id?: string
      }
    }
  }
}

export interface PortalSearchParams {
  id?: number
  page?: number
  per_page?: number
  search?: string
  brand?: string
  brand_id?: number
  model?: string
  model_id?: number
  vehicle_type?: string
  year_min?: number
  year_max?: number
  price_min?: number
  price_max?: number
  fuel_type?: string
  transmission?: string
  city?: string
  status?: string
  featured?: boolean
  exclude_id?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PortalSearchResult {
  data: PortalVehicle[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

// Função helper para tratar erros de resposta da API
const handleApiError = (response: Response, context: string): never => {
  if (response.status === 503) {
    console.warn(`⚠️ API temporariamente indisponível (503) em ${context}, usando dados de fallback`)
    throw new Error('SERVICE_UNAVAILABLE')
  } else if (response.status === 404) {
    console.warn(`⚠️ Dados não encontrados (404) em ${context}, usando dados de fallback`)
    throw new Error('DATA_NOT_FOUND')
  } else {
    throw new Error(`API retornou ${response.status} em ${context}`)
  }
}

// Função para obter informações do tenant
export const getPortalTenantInfo = async (subdomain: string): Promise<PortalTenant> => {
  try {
    console.log('🏢 Buscando informações do tenant:', subdomain)

    // Verificar se está no cliente
    if (typeof window === 'undefined') {
      throw new Error('getPortalTenantInfo só pode ser executado no cliente')
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.api.webcarros.app.br/api'
    const response = await fetch(`${apiUrl}/portal/tenant-info`, {
      headers: {
        'X-Tenant-Subdomain': subdomain,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      handleApiError(response, 'getPortalTenantInfo')
    }

    const data = await response.json()
    console.log('✅ Tenant carregado com sucesso:', data.data)
    return data.data
  } catch (error) {
    console.error('❌ Erro ao carregar tenant:', error)
    throw error
  }
}

// Função para buscar veículos do portal
export const getPortalVehicles = async (
  subdomain: string,
  params: PortalSearchParams = {}
): Promise<PortalSearchResult> => {
  try {
    console.log('🔍 Buscando veículos do portal:', { subdomain, params })

    const queryParams = new URLSearchParams()

    // Adicionar parâmetros de busca
    if (params.id) queryParams.append('id', params.id.toString())
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params.search) queryParams.append('search', params.search)
    if (params.brand_id) queryParams.append('brand_id', params.brand_id.toString())
    if (params.model_id) queryParams.append('model_id', params.model_id.toString())
    if (params.vehicle_type) queryParams.append('vehicle_type', params.vehicle_type)
    if (params.year_min !== undefined && params.year_min !== null) queryParams.append('year_min', params.year_min.toString())
    if (params.year_max !== undefined && params.year_max !== null) queryParams.append('year_max', params.year_max.toString())
    if (params.price_min !== undefined && params.price_min !== null) queryParams.append('price_min', params.price_min.toString())
    if (params.price_max !== undefined && params.price_max !== null) queryParams.append('price_max', params.price_max.toString())
    if (params.fuel_type) queryParams.append('fuel_type', params.fuel_type)
    if (params.transmission) queryParams.append('transmission', params.transmission)
    if (params.city) queryParams.append('city', params.city)
    if (params.status) queryParams.append('status', params.status)
    if (params.featured) queryParams.append('featured', 'true')
    if (params.sort) queryParams.append('sort', params.sort)
    if (params.order) queryParams.append('order', params.order)

    // Verificar se está no cliente
    if (typeof window === 'undefined') {
      throw new Error('getPortalVehicles só pode ser executado no cliente')
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.api.webcarros.app.br/api'
    const url = `${apiUrl}/portal/vehicles?${queryParams.toString()}`
    console.log('🌐 URL da API:', url)
    console.log('📋 Query params:', queryParams.toString())
    console.log('🔍 Parâmetros numéricos:', {
      year_min: params.year_min,
      year_max: params.year_max,
      price_min: params.price_min,
      price_max: params.price_max
    })

    const response = await fetch(url, {
      headers: {
        'X-Tenant-Subdomain': subdomain,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      handleApiError(response, 'getPortalVehicles')
    }

    const data = await response.json()
    console.log('✅ Veículos carregados com sucesso:', data.meta?.total || 0)
    return data
  } catch (error) {
    console.error('❌ Erro ao buscar veículos:', error)
    throw error
  }
}

// Função para buscar veículo específico
export const getPortalVehicle = async (subdomain: string, vehicleId: number): Promise<PortalVehicle> => {
  try {
    console.log('🔍 Buscando veículo específico:', { subdomain, vehicleId })

    // Verificar se está no cliente
    if (typeof window === 'undefined') {
      throw new Error('getPortalVehicle só pode ser executado no cliente')
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.api.webcarros.app.br/api'
    const response = await fetch(`${apiUrl}/portal/vehicles/${vehicleId}`, {
      headers: {
        'X-Tenant-Subdomain': subdomain,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      handleApiError(response, 'getPortalVehicle')
    }

    const data = await response.json()
    console.log('✅ Veículo carregado com sucesso:', data.data.title)
    console.log('🖼️ Dados das imagens:', {
      main_image: data.data.main_image,
      images: data.data.images,
      images_count: data.data.images?.length || 0
    })
    console.log('📋 Estrutura completa do veículo:', JSON.stringify(data.data, null, 2))
    return data.data
  } catch (error) {
    console.error('❌ Erro ao buscar veículo:', error)
    throw error
  }
}

// Função para testar endpoints disponíveis
export const testAvailableEndpoints = async (subdomain: string) => {
  const endpoints = [
    '/portal/brands-models',
    '/portal/brands',
    '/api/brands',
    '/fipe/brands/cars',
    '/portal/vehicles',
    '/api/vehicles'
  ]

  console.log('🔍 Testando endpoints disponíveis...')

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        headers: {
          'X-Tenant-Subdomain': subdomain,
          'Accept': 'application/json'
        }
      })

      console.log(`${response.ok ? '✅' : '❌'} ${endpoint}: ${response.status}`)

      if (response.ok) {
        const data = await response.json()
        console.log(`📋 Resposta de ${endpoint}:`, {
          hasData: !!data.data,
          dataType: Array.isArray(data.data) ? 'array' : typeof data.data,
          dataLength: Array.isArray(data.data) ? data.data.length : 'N/A',
          keys: data.data ? Object.keys(data.data) : 'N/A'
        })
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Erro -`, error instanceof Error ? error.message : String(error))
    }
  }
}

// Função para buscar todos os filtros baseados nos veículos cadastrados
export const getPortalBrandsAndModels = async (subdomain: string): Promise<{
  brands: Array<{ id: number; name: string }>
  models: Array<{ id: number; name: string; brand_id: number }>
  cities: string[]
  vehicleTypes: string[]
  fuelTypes: string[]
  transmissions: string[]
  priceRange: { min: number; max: number }
  yearRange: { min: number; max: number }
}> => {
  try {
    console.log('🚗 Buscando todos os filtros baseados nos veículos cadastrados:', { subdomain })

    // Buscar todos os veículos para extrair dados de filtro
    const vehiclesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/vehicles?per_page=1000`, {
      headers: {
        'X-Tenant-Subdomain': subdomain,
        'Accept': 'application/json'
      }
    })

    if (vehiclesResponse.ok) {
      const vehiclesData = await vehiclesResponse.json()
      console.log('✅ Veículos carregados para extrair filtros:', vehiclesData.data?.length || 0)

      if (vehiclesData.success && vehiclesData.data && Array.isArray(vehiclesData.data)) {
        // Maps para armazenar dados únicos
        const brandMap = new Map<number, string>()
        const modelMap = new Map<number, {name: string, brand_id: number}>()
        const citySet = new Set<string>()
        const vehicleTypeSet = new Set<string>()
        const fuelTypeSet = new Set<string>()
        const transmissionSet = new Set<string>()
        const prices: number[] = []
        const years: number[] = []

        vehiclesData.data.forEach((vehicle: {
          brand?: string | {id: number, name: string}
          model?: string | {id: number, name: string}
          city?: string
          vehicle_type?: string
          fuel_type?: string
          transmission?: string
          price?: number
          year?: number
        }) => {
          // Processar marca
          if (vehicle.brand) {
            if (typeof vehicle.brand === 'object' && vehicle.brand.id && vehicle.brand.name) {
              brandMap.set(vehicle.brand.id, vehicle.brand.name)
            } else if (typeof vehicle.brand === 'string') {
              const brandId = findBrandIdByName(vehicle.brand)
              if (brandId) {
                brandMap.set(brandId, vehicle.brand)
              }
            }
          }

          // Processar modelo
          if (vehicle.model) {
            if (typeof vehicle.model === 'object' && vehicle.model.id && vehicle.model.name) {
              modelMap.set(vehicle.model.id, {
                name: vehicle.model.name,
                brand_id: vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.id : findBrandIdByName(vehicle.brand || '') || 0
              })
            } else if (typeof vehicle.model === 'string') {
              const brandId = vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.id : findBrandIdByName(vehicle.brand || '') || 0
              modelMap.set(Date.now() + Math.random(), {
                name: vehicle.model,
                brand_id: brandId
              })
            }
          }

          // Processar cidade
          if (vehicle.city && vehicle.city.trim()) {
            citySet.add(vehicle.city.trim())
          }

          // Processar tipo de veículo
          if (vehicle.vehicle_type && vehicle.vehicle_type.trim()) {
            vehicleTypeSet.add(vehicle.vehicle_type.trim())
          }

          // Processar tipo de combustível
          if (vehicle.fuel_type && vehicle.fuel_type.trim()) {
            fuelTypeSet.add(vehicle.fuel_type.trim())
          }

          // Processar transmissão
          if (vehicle.transmission && vehicle.transmission.trim()) {
            transmissionSet.add(vehicle.transmission.trim())
          }

          // Processar preço
          if (vehicle.price && typeof vehicle.price === 'number' && vehicle.price > 0) {
            prices.push(vehicle.price)
          }

          // Processar ano
          if (vehicle.year && typeof vehicle.year === 'number' && vehicle.year > 1900) {
            years.push(vehicle.year)
          }
        })

        // Converter para arrays
        const brands = Array.from(brandMap.entries()).map(([id, name]) => ({ id, name }))
        const models = Array.from(modelMap.entries()).map(([id, data]) => ({ id, name: data.name, brand_id: data.brand_id }))
        const cities = Array.from(citySet).sort()
        const vehicleTypes = Array.from(vehicleTypeSet).sort()
        const fuelTypes = Array.from(fuelTypeSet).sort()
        const transmissions = Array.from(transmissionSet).sort()

        // Calcular ranges de preço e ano
        const priceRange = prices.length > 0 ? {
          min: Math.min(...prices),
          max: Math.max(...prices)
        } : { min: 0, max: 0 }

        const yearRange = years.length > 0 ? {
          min: Math.min(...years),
          max: Math.max(...years)
        } : { min: 2010, max: new Date().getFullYear() }

        console.log('✅ Todos os filtros extraídos dos veículos:', {
          brands: brands.length,
          models: models.length,
          cities: cities.length,
          vehicleTypes: vehicleTypes.length,
          fuelTypes: fuelTypes.length,
          transmissions: transmissions.length,
          priceRange,
          yearRange,
          source: 'Veículos cadastrados no banco'
        })

        return {
          brands,
          models,
          cities,
          vehicleTypes,
          fuelTypes,
          transmissions,
          priceRange,
          yearRange
        }
      }
    } else {
      console.log(`❌ Endpoint /portal/vehicles retornou ${vehiclesResponse.status}`)
    }

    // Fallback: dados padrão se não conseguir extrair dos veículos
    console.log('⚠️ Usando dados padrão como fallback')
    return {
      brands: vehicleBrands,
      models: [],
      cities: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Salvador', 'Fortaleza', 'Manaus', 'Curitiba', 'Recife', 'Goiânia'],
      vehicleTypes: ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Coupe', 'Convertible', 'Wagon', 'Van'],
      fuelTypes: ['flex', 'diesel', 'gasolina', 'eletrico', 'hibrido', 'gnv'],
      transmissions: ['automatica', 'cvt', 'manual', 'automatizada'],
      priceRange: { min: 0, max: 0 },
      yearRange: { min: 2010, max: new Date().getFullYear() }
    }
  } catch (error) {
    console.error('❌ Erro ao buscar filtros dos veículos:', error)

    // Retornar dados padrão em caso de erro
    return {
      brands: vehicleBrands,
      models: [],
      cities: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Salvador', 'Fortaleza', 'Manaus', 'Curitiba', 'Recife', 'Goiânia'],
      vehicleTypes: ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Coupe', 'Convertible', 'Wagon', 'Van'],
      fuelTypes: ['flex', 'diesel', 'gasolina', 'eletrico', 'hibrido', 'gnv'],
      transmissions: ['automatica', 'cvt', 'manual', 'automatizada'],
      priceRange: { min: 0, max: 0 },
      yearRange: { min: 2010, max: new Date().getFullYear() }
    }
  }
}

// Função auxiliar para encontrar ID da marca pelo nome
const findBrandIdByName = (brandName: string): number | null => {
  const brand = vehicleBrands.find(b => b.name.toLowerCase() === brandName.toLowerCase())
  return brand ? brand.id : null
}

// Função para buscar modelos de uma marca específica
export const getPortalBrandModels = async (
  subdomain: string,
  brandId: number,
  allModels?: Array<{ id: number; name: string; brand_id: number }>
): Promise<{
  id: number
  name: string
  brand_id: number
  is_active: boolean
}[]> => {
  try {
    console.log('🚗 Buscando modelos da marca:', { subdomain, brandId })
    console.log('📊 allModels recebido:', allModels?.length || 0, 'modelos')

    // Se temos todos os modelos carregados, filtrar por brand_id
    if (allModels && allModels.length > 0) {
      console.log('🔍 Filtrando modelos por brand_id:', brandId)
      const brandModels = allModels.filter(model => model.brand_id === brandId)
      console.log('✅ Modelos encontrados na lista carregada:', brandModels.length)
      console.log('📋 Modelos filtrados:', brandModels.map(m => `${m.id}: ${m.name} (brand_id: ${m.brand_id})`).join(', '))

      return brandModels.map(model => ({
        id: model.id,
        name: model.name,
        brand_id: model.brand_id,
        is_active: true
      }))
    }

    // Fallback: buscar da API /portal/filters
    console.log('⚠️ Nenhum modelo carregado, buscando da API...')
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/filters`, {
      headers: {
        'X-Tenant-Subdomain': subdomain,
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data?.models) {
        const brandModels = data.data.models.filter((model: {id: number, name: string, brand_id: number}) => model.brand_id === brandId)
        console.log('✅ Modelos carregados da API para marca', brandId, ':', brandModels.length)

        return brandModels.map((model: {id: number, name: string, brand_id: number}) => ({
          id: model.id,
          name: model.name,
          brand_id: model.brand_id,
          is_active: true
        }))
      }
    }

    console.log('⚠️ Nenhum modelo encontrado para a marca:', brandId)
    return []

  } catch (error) {
    console.error('❌ Erro ao buscar modelos:', error)
    return []
  }
}

// Função para buscar estatísticas de categorias dos veículos
export const getPortalVehicleStats = async (subdomain: string): Promise<{
  categories: {
    name: string
    count: number
    image_url?: string
  }[]
  total_vehicles: number
  featured_vehicles: number
  available_vehicles: number
  sold_vehicles: number
}> => {
  try {
    console.log('📊 Buscando estatísticas dos veículos:', subdomain)

    // Buscar todos os veículos para fazer a contagem
    const allVehicles = await getPortalVehicles(subdomain, { per_page: 1000 })

    // Definir categorias baseadas no tipo de veículo
    const categoryMap: { [key: string]: { count: number, image_url?: string } } = {
      'Sports Coupe': { count: 0, image_url: '/portal/assets/img/cars/car-15.png' },
      'Sedan': { count: 0, image_url: '/portal/assets/img/cars/car-16.png' },
      'Sports Car': { count: 0, image_url: '/portal/assets/img/cars/car-17.png' },
      'Pickup': { count: 0, image_url: '/portal/assets/img/category/category-04.png' },
      'Family MPV': { count: 0, image_url: '/portal/assets/img/category/category-02.png' },
      'Crossover': { count: 0, image_url: '/portal/assets/img/category/category-01.png' },
      'SUV': { count: 0, image_url: '/portal/assets/img/category/category-03.png' },
      'Hatchback': { count: 0, image_url: '/portal/assets/img/cars/car-18.png' },
      'Wagon': { count: 0, image_url: '/portal/assets/img/cars/car-19.png' },
      'Van': { count: 0, image_url: '/portal/assets/img/category/category-05.png' }
    }

    let featuredCount = 0
    let availableCount = 0
    let soldCount = 0

        // Contar veículos por categoria
    if (allVehicles.data && Array.isArray(allVehicles.data)) {
      allVehicles.data.forEach(vehicle => {
        const vehicleType = vehicle.vehicle_type || vehicle.condition || 'Sedan'

        // Mapear tipos para categorias
        let category = 'Sedan' // padrão

        if (vehicleType.toLowerCase().includes('sport') || vehicleType.toLowerCase().includes('coupe')) {
          category = 'Sports Coupe'
        } else if (vehicleType.toLowerCase().includes('pickup') || vehicleType.toLowerCase().includes('truck')) {
          category = 'Pickup'
        } else if (vehicleType.toLowerCase().includes('suv') || vehicleType.toLowerCase().includes('crossover')) {
          category = 'Crossover'
        } else if (vehicleType.toLowerCase().includes('mpv') || vehicleType.toLowerCase().includes('minivan')) {
          category = 'Family MPV'
        } else if (vehicleType.toLowerCase().includes('hatch')) {
          category = 'Hatchback'
        } else if (vehicleType.toLowerCase().includes('wagon')) {
          category = 'Wagon'
        } else if (vehicleType.toLowerCase().includes('van')) {
          category = 'Van'
        }

        if (categoryMap[category]) {
          categoryMap[category].count++
        }

        // Contar por status
        if (vehicle.is_featured) featuredCount++
        if (vehicle.status === 'available' || vehicle.status === 'disponível') availableCount++
        if (vehicle.status === 'sold' || vehicle.status === 'vendido') soldCount++
      })
    }

    // Converter para array e filtrar categorias com veículos
    const categories = Object.entries(categoryMap)
      .filter(([, data]) => data.count > 0)
      .map(([name, data]) => ({
        name,
        count: data.count,
        image_url: data.image_url
      }))
      .sort((a, b) => b.count - a.count) // Ordenar por quantidade

    const stats = {
      categories,
      total_vehicles: allVehicles.meta?.total || allVehicles.data?.length || 0,
      featured_vehicles: featuredCount,
      available_vehicles: availableCount,
      sold_vehicles: soldCount
    }

    console.log('✅ Estatísticas carregadas:', stats)
    return stats

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error)
    // Retornar dados padrão em caso de erro
    return {
      categories: [
        { name: 'Sports Coupe', count: 0, image_url: '/portal/img/categories/sports-coupe.jpg' },
        { name: 'Sedan', count: 0, image_url: '/portal/img/categories/sedan.jpg' },
        { name: 'Sports Car', count: 0, image_url: '/portal/img/categories/sports-car.jpg' },
        { name: 'Pickup', count: 0, image_url: '/portal/img/categories/pickup.jpg' },
        { name: 'Family MPV', count: 0, image_url: '/portal/img/categories/family-mpv.jpg' },
        { name: 'Crossover', count: 0, image_url: '/portal/img/categories/crossover.jpg' }
      ],
      total_vehicles: 0,
      featured_vehicles: 0,
      available_vehicles: 0,
      sold_vehicles: 0
    }
  }
}

// Função para buscar cidades disponíveis - REMOVIDA devido ao endpoint 404
// export const getPortalCities = async (subdomain: string): Promise<string[]> => {
//   // Endpoint /portal/cities retorna 404, função removida
// }

// Função para enviar contato
export const sendPortalContact = async (
  subdomain: string,
  contactData: {
    name: string
    email: string
    phone: string
    message: string
    vehicle_id?: number
  }
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('📧 Enviando contato:', { subdomain, contactData })

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/contact`, {
      method: 'POST',
      headers: {
        'X-Tenant-Subdomain': subdomain,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(contactData)
    })

    if (!response.ok) {
      throw new Error(`API retornou ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Contato enviado com sucesso')
    return { success: true, message: data.message || 'Contato enviado com sucesso!' }
  } catch (error) {
    console.error('❌ Erro ao enviar contato:', error)
    return { success: false, message: 'Erro ao enviar contato. Tente novamente.' }
  }
}

// Função para buscar veículo por slug (sem ID na URL)
export const getPortalVehicleBySlug = async (subdomain: string, slug: string, vehicleId: number): Promise<PortalVehicle> => {
  try {
    console.log('🔍 Buscando veículo por slug:', { subdomain, slug, vehicleId })

    // Verificar se está no cliente
    if (typeof window === 'undefined') {
      throw new Error('getPortalVehicleBySlug só pode ser executado no cliente')
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.api.webcarros.app.br/api'
    const response = await fetch(`${apiUrl}/portal/vehicles/${vehicleId}`, {
      headers: {
        'X-Tenant-Subdomain': subdomain,
        'X-Vehicle-Slug': slug, // Passar o slug no header
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Veículo encontrado por slug:', data)
    return data
  } catch (error) {
    console.error('❌ Erro ao buscar veículo por slug:', error)
    handleApiError(error as Response, 'getPortalVehicleBySlug')
    throw error
  }
}

// Função para buscar estatísticas do portal
// REMOVIDA: Endpoint /stats não existe no backend
// As estatísticas são calculadas a partir dos veículos carregados

// Interface para filtros do portal
interface PortalFilters {
  brands: string[]
  models: string[]
  years: number[]
  fuel_types: string[]
  transmissions: string[]
  colors: string[]
}

// Função para buscar filtros disponíveis
export const getPortalFilters = async (subdomain: string): Promise<PortalFilters> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/filters`, {
      headers: {
        'X-Tenant-Subdomain': subdomain,
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return data.data
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar filtros, usando fallback:', error)
  }

  // Fallback mock data
  return {
    brands: ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes'],
    models: ['Corolla', 'Civic', 'Mustang', 'Camaro', 'Série 3', 'Classe C'],
    years: [2020, 2021, 2022, 2023, 2024],
    fuel_types: ['Flex', 'Gasolina', 'Diesel', 'Elétrico', 'Híbrido'],
    transmissions: ['Manual', 'Automático', 'CVT'],
    colors: ['Branco', 'Preto', 'Prata', 'Azul', 'Vermelho', 'Verde']
  }
}

// Função para criar lead do portal
export const createPortalLead = async (subdomain: string, leadData: {
  name: string
  email: string
  phone: string
  message: string
  vehicle_id?: number
}): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('📝 Criando lead do portal:', { subdomain, leadData })

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/leads`, {
      method: 'POST',
      headers: {
        'X-Tenant-Subdomain': subdomain,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(leadData)
    })

    if (!response.ok) {
      throw new Error(`API retornou ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Lead criado com sucesso')
    return data
  } catch (error) {
    console.error('❌ Erro ao criar lead:', error)
    return {
      success: false,
      message: 'Erro ao enviar mensagem. Tente novamente.'
    }
  }
}

// Interface para contato do tenant
interface PortalTenantContact {
  phone: string
  whatsapp: string
  email: string
  address: string
}

// Função para buscar informações de contato do tenant
export const getPortalTenantContact = async (subdomain: string): Promise<PortalTenantContact> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/tenant/contact`, {
      headers: {
        'X-Tenant-Subdomain': subdomain,
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return data.data
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar contato, usando fallback:', error)
  }

  // Fallback mock data
  return {
    phone: '(11) 99999-9999',
    whatsapp: '(11) 99999-9999',
    email: `contato@${subdomain}.com`,
    address: 'Rua das Flores, 123 - Centro, São Paulo - SP'
  }
}

// Interface para tema do tenant
interface PortalTenantTheme {
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  button_primary_color: string
  button_secondary_color: string
  header_background: string
  footer_background: string
  theme_color?: string // Campo existente para compatibilidade
}

// Interface para redes sociais do tenant
interface PortalTenantSocialMedia {
  instagram: string
  facebook: string
  whatsapp: string
}

// Função para buscar tema do tenant
export const getPortalTenantTheme = async (subdomain: string): Promise<PortalTenantTheme> => {
  try {
    console.log('🎨 Buscando tema do tenant:', subdomain)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/tenant/theme`, {
      headers: {
        'X-Tenant-Subdomain': subdomain,
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Tema carregado com sucesso:', data.data)
      return data.data
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar tema, usando fallback:', error)
  }

  // Fallback com cores padrão
  return {
    primary_color: '#3b82f6',
    secondary_color: '#64748b',
    accent_color: '#f59e0b',
    background_color: '#f8f9fa',
    text_color: '#333333',
    button_primary_color: '#3b82f6',
    button_secondary_color: '#64748b',
    header_background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    footer_background: '#1f2937',
    theme_color: '#3b82f6'
  }
}

// Função para buscar redes sociais do tenant
export const getPortalTenantSocialMedia = async (subdomain: string): Promise<PortalTenantSocialMedia> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/tenant/social-media`, {
      headers: {
        'X-Tenant-Subdomain': subdomain,
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return data.data
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar redes sociais, usando fallback:', error)
  }

  // Fallback mock data
  return {
    instagram: `https://instagram.com/${subdomain}veiculos`,
    facebook: `https://facebook.com/${subdomain}veiculos`,
    whatsapp: `https://wa.me/11999999999`
  }
}

/**
 * Aplicar tema do tenant ao DOM
 * Esta função aplica as configurações de tema do tenant ao documento
 */
export const applyTenantTheme = (tenant: PortalTenant): void => {
  try {
    console.log('🎨 Aplicando tema do tenant:', tenant)

    const root = document.documentElement

    // Verificar se temos dados de tema na estrutura real da API
    if (tenant.theme?.theme) {
      const theme = tenant.theme.theme
      console.log('🎨 Dados do tema encontrados:', theme)

      // Aplicar cores do tema
      if (theme.colors) {
        console.log('🎨 Aplicando cores:', theme.colors)
        Object.entries(theme.colors).forEach(([key, value]) => {
          const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
          root.style.setProperty(cssVarName, value)
          console.log(`🎨 Definindo ${cssVarName}: ${value}`)
        })
      }

      // Aplicar tipografia
      if (theme.typography) {
        console.log('🎨 Aplicando tipografia:', theme.typography)
        if (theme.typography.fontFamily) {
          root.style.setProperty('--font-family', theme.typography.fontFamily)
          document.body.style.fontFamily = theme.typography.fontFamily
        }
        if (theme.typography.fontSizeBase) {
          root.style.setProperty('--font-size-base', theme.typography.fontSizeBase)
        }
        if (theme.typography.fontWeightNormal) {
          root.style.setProperty('--font-weight-normal', theme.typography.fontWeightNormal)
        }
        if (theme.typography.fontWeightBold) {
          root.style.setProperty('--font-weight-bold', theme.typography.fontWeightBold)
        }
      }

      // Aplicar layout
      if (theme.layout) {
        console.log('🎨 Aplicando layout:', theme.layout)
        if (theme.layout.borderRadius) {
          root.style.setProperty('--border-radius', theme.layout.borderRadius)
        }
        if (theme.layout.borderRadiusLarge) {
          root.style.setProperty('--border-radius-large', theme.layout.borderRadiusLarge)
        }
        if (theme.layout.borderRadiusSmall) {
          root.style.setProperty('--border-radius-small', theme.layout.borderRadiusSmall)
        }
        if (theme.layout.spacingUnit) {
          root.style.setProperty('--spacing-unit', theme.layout.spacingUnit)
        }
        if (theme.layout.containerMaxWidth) {
          root.style.setProperty('--container-max-width', theme.layout.containerMaxWidth)
        }
      }

      // Aplicar componentes
      if (theme.components) {
        console.log('🎨 Aplicando componentes:', theme.components)
        if (theme.components.buttonStyle) {
          root.style.setProperty('--button-style', theme.components.buttonStyle)
        }
        if (theme.components.cardStyle) {
          root.style.setProperty('--card-style', theme.components.cardStyle)
        }
        if (theme.components.formStyle) {
          root.style.setProperty('--form-style', theme.components.formStyle)
        }
      }

      // Aplicar features
      if (theme.features) {
        console.log('🎨 Aplicando features:', theme.features)
        if (theme.features.darkMode !== undefined) {
          root.style.setProperty('--dark-mode-enabled', theme.features.darkMode ? 'true' : 'false')
        }
        if (theme.features.animations !== undefined) {
          root.style.setProperty('--animations-enabled', theme.features.animations ? 'true' : 'false')
        }
      }
    }

    // Aplicar CSS customizado se disponível
    if (tenant.theme?.css) {
      console.log('🎨 Aplicando CSS customizado')
      // Remover CSS customizado anterior se existir
      const existingStyle = document.getElementById('tenant-custom-css')
      if (existingStyle) {
        existingStyle.remove()
      }

      // Criar novo elemento de estilo
      const style = document.createElement('style')
      style.id = 'tenant-custom-css'
      style.textContent = tenant.theme.css
      document.head.appendChild(style)
      console.log('✅ CSS customizado aplicado')
    }

    // Fallback para configuração antiga
    if (tenant.configuration?.theme) {
      console.log('🎨 Aplicando configuração antiga do tema')
      const theme = tenant.configuration.theme

      if (theme.colors) {
        Object.entries(theme.colors).forEach(([key, value]) => {
          root.style.setProperty(`--color-${key}`, value)
        })
      }

      if (theme.typography?.font_family) {
        root.style.setProperty('--font-family', theme.typography.font_family)
        document.body.style.fontFamily = theme.typography.font_family
      }

      if (theme.custom_css) {
        const existingStyle = document.getElementById('tenant-custom-css')
        if (existingStyle) {
          existingStyle.remove()
        }

        const style = document.createElement('style')
        style.id = 'tenant-custom-css'
        style.textContent = theme.custom_css
        document.head.appendChild(style)
      }

      if (theme.layout) {
        if (theme.layout.border_radius) {
          root.style.setProperty('--border-radius', theme.layout.border_radius)
        }
        if (theme.layout.spacing) {
          root.style.setProperty('--spacing', theme.layout.spacing)
        }
        if (theme.layout.container_max_width) {
          root.style.setProperty('--container-max-width', theme.layout.container_max_width)
        }
      }
    }

    // Aplicar cor do tema como fallback
    if (tenant.theme_color) {
      console.log('🎨 Aplicando cor do tema:', tenant.theme_color)
      root.style.setProperty('--primary-color', tenant.theme_color)
      root.style.setProperty('--theme-color', tenant.theme_color)
    }

    console.log('✅ Tema aplicado com sucesso')
  } catch (error) {
    console.error('❌ Erro ao aplicar tema:', error)
  }
}

/**
 * Aplicar configurações SEO do tenant
 * Esta função aplica as meta tags e configurações SEO
 */
export const applyTenantSeo = (tenant: PortalTenant): void => {
  try {
    if (!tenant.configuration?.seo) {
      console.log('⚠️ Nenhuma configuração SEO encontrada')
      return
    }

    const seo = tenant.configuration.seo

    console.log('🔍 Aplicando configurações SEO:', seo)

    // Aplicar meta tags básicas
    if (seo.meta) {
      if (seo.meta.title) {
        document.title = seo.meta.title
      }
      if (seo.meta.description) {
        const metaDesc = document.querySelector('meta[name="description"]')
        if (metaDesc) {
          metaDesc.setAttribute('content', seo.meta.description)
        }
      }
      if (seo.meta.keywords) {
        const metaKeywords = document.querySelector('meta[name="keywords"]')
        if (metaKeywords) {
          metaKeywords.setAttribute('content', seo.meta.keywords)
        }
      }
    }

    // Aplicar Open Graph
    if (seo.open_graph) {
      if (seo.open_graph.title) {
        const ogTitle = document.querySelector('meta[property="og:title"]')
        if (ogTitle) {
          ogTitle.setAttribute('content', seo.open_graph.title)
        }
      }
      if (seo.open_graph.description) {
        const ogDesc = document.querySelector('meta[property="og:description"]')
        if (ogDesc) {
          ogDesc.setAttribute('content', seo.open_graph.description)
        }
      }
      if (seo.open_graph.image_url) {
        const ogImage = document.querySelector('meta[property="og:image"]')
        if (ogImage) {
          ogImage.setAttribute('content', seo.open_graph.image_url)
        }
      }
    }

    console.log('✅ Configurações SEO aplicadas com sucesso')
  } catch (error) {
    console.error('❌ Erro ao aplicar SEO:', error)
  }
}

/**
 * Aplicar configurações do portal
 * Esta função aplica as funcionalidades e integrações do portal
 */
export const applyTenantPortalSettings = (tenant: PortalTenant): void => {
  try {
    if (!tenant.configuration?.portal_settings) {
      console.log('⚠️ Nenhuma configuração do portal encontrada')
      return
    }

    const portal = tenant.configuration.portal_settings

    console.log('⚙️ Aplicando configurações do portal:', portal)

    // Aplicar funcionalidades
    if (portal.features) {
      // Botão WhatsApp
      if (portal.features.whatsapp_button && portal.integrations?.whatsapp_number) {
        console.log('📱 Botão WhatsApp habilitado')
        // Aqui você pode implementar a lógica para mostrar o botão WhatsApp
      }

      // Busca
      if (portal.features.search) {
        console.log('🔍 Funcionalidade de busca habilitada')
      }

      // Filtros
      if (portal.features.filters) {
        console.log('🔧 Filtros habilitados')
      }
    }

    // Aplicar integrações
    if (portal.integrations) {
      // Google Analytics
      if (portal.integrations.google_analytics_id) {
        console.log('📊 Google Analytics configurado:', portal.integrations.google_analytics_id)
        // Aqui você pode implementar o tracking do Google Analytics
      }

      // Facebook Pixel
      if (portal.integrations.facebook_pixel_id) {
        console.log('📱 Facebook Pixel configurado:', portal.integrations.facebook_pixel_id)
        // Aqui você pode implementar o tracking do Facebook Pixel
      }
    }

    console.log('✅ Configurações do portal aplicadas com sucesso')
  } catch (error) {
    console.error('❌ Erro ao aplicar configurações do portal:', error)
  }
}
