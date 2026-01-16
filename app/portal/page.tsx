/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import {
  getPortalVehicles,
  getPortalTenantInfo,
  getPortalVehicleStats,
  applyTenantTheme,
  applyTenantSeo,
  applyTenantPortalSettings
} from '@/lib/portal-api'
import { useSEOMetaTags, generateHomePageMetaTags } from '@/lib/seo-metatags'
import VehicleCard from '@/components/ui/VehicleCard'

// Interfaces para compatibilidade com diferentes formatos de dados
interface VehicleBrand {
  id: number
  name: string
  slug: string
}

interface VehicleModel {
  id: number
  name: string
  slug: string
}

// Interface que suporta tanto strings quanto objetos
interface FlexibleVehicle {
  id: number
  title: string
  main_image: string | null
  images: Array<{
    id: number
    image_url: string
    is_primary: boolean
  }> | null
  city: string | null
  price: number | null
  year: number | null
  mileage: number | null
  fuel_type: string | null
  transmission: string | null
  brand: string | VehicleBrand | null
  model: string | VehicleModel | null
  description: string | null
  status: string | null
  created_at: string | null
}



function PortalHomePageContent() {
  const [featuredVehicles, setFeaturedVehicles] = useState<FlexibleVehicle[]>([])
  const [vehicleStats, setVehicleStats] = useState<{
    categories: { name: string; count: number; image_url?: string }[]
    total_vehicles: number
    featured_vehicles: number
    available_vehicles: number
    sold_vehicles: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Estados para funcionalidades interativas
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [openFaqIndex, setOpenFaqIndex] = useState(2) // Terceira pergunta aberta por padrão

  // Estados para modais mobile
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Estados para o formulário de pesquisa
  const [searchFilters, setSearchFilters] = useState({
    brand: '',
    model: '',
    year: ''
  })

  // Estados para modelos dinâmicos
  const [availableModels, setAvailableModels] = useState<Array<{id: number, name: string}>>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [tenant, setTenant] = useState<{
    id: number
    name: string
    subdomain: string
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
    social_media?: {
      facebook?: string
      instagram?: string
          whatsapp?: string
        }
    configuration?: {
      theme?: {
        colors?: {
          primary?: string
        }
      }
    }
  } | null>(null)

  // Aplicar meta tags SEO completas com dados reais da API
  //const metaTags = generateHomePageMetaTags(tenant, vehicleStats || undefined)
  //useSEOMetaTags(metaTags, tenant)

  // Função para carregar modelos quando uma marca é selecionada
  const loadModelsForBrand = async (brandName: string) => {
    if (!brandName) {
      setAvailableModels([])
      return
    }

    setIsLoadingModels(true)
    try {
      // Mapear nome da marca para ID (baseado nas marcas disponíveis)
      const brandMap: {[key: string]: number} = {
        'honda': 2,
        'toyota': 1,
        'volkswagen': 5,
        'ford': 3,
        'chevrolet': 4,
        'fiat': 6,
        'nissan': 8,
        'hyundai': 7,
        'kia': 14,
        'bmw': 9,
        'mercedes-benz': 10,
        'audi': 11,
        'peugeot': 12,
        'renault': 13
      }

      const brandId = brandMap[brandName.toLowerCase()]
      if (!brandId) {
        console.warn('⚠️ Marca não encontrada no mapeamento:', brandName)
        setAvailableModels([])
        return
      }

      console.log('🚗 Carregando modelos para marca:', brandName, 'ID:', brandId)

      // Importar a função de carregar modelos
      const { getPortalBrandModels } = await import('@/lib/portal-api')
      const models = await getPortalBrandModels('omegaveiculos', brandId, [])

      if (models && models.length > 0) {
        setAvailableModels(models)
        console.log('✅ Modelos carregados:', models.length)
      } else {
        setAvailableModels([])
        console.log('⚠️ Nenhum modelo encontrado para a marca:', brandName)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar modelos:', error)
      setAvailableModels([])
    } finally {
      setIsLoadingModels(false)
    }
  }

  // Função para lidar com a pesquisa
  const handleSearch = () => {
    const params = new URLSearchParams()

    if (searchFilters.brand) params.append('brand', searchFilters.brand)
    if (searchFilters.model) params.append('model', searchFilters.model)
    if (searchFilters.year) params.append('year', searchFilters.year)

    const queryString = params.toString()
    const url = queryString ? `/portal/vehicles?${queryString}` : '/portal/vehicles'

    window.location.href = url
  }

  useEffect(() => {
    const loadPortalData = async () => {
      try {
        setIsLoading(true)
        console.log('🚀 Carregando dados do portal...')

        // Usar subdomain padrão para evitar problemas de build
        const subdomain = 'omegaveiculos'

        // Carregar informações do tenant
          const tenantData = await getPortalTenantInfo(subdomain)
        console.log('✅ Dados do tenant carregados:', tenantData)
        console.log('🔍 Logo URL do tenant:', tenantData?.logo_url)
        console.log('🔍 Logo URL do profile:', tenantData?.profile?.logo_url)
        console.log('🔍 Estrutura completa do tenant:', JSON.stringify(tenantData, null, 2))
        if (tenantData) {
          setTenant(tenantData)
        }

        // Carregar veículos em destaque
        const vehiclesData = await getPortalVehicles(subdomain, { featured: true, per_page: 6 })
        console.log('✅ Veículos carregados:', vehiclesData)
        if (vehiclesData && vehiclesData.data && Array.isArray(vehiclesData.data)) {
          // Converter os veículos para o formato esperado
          const convertedVehicles = vehiclesData.data.map(vehicle => ({
            id: vehicle.id,
            title: vehicle.title,
            main_image: vehicle.main_image ? (vehicle.main_image as unknown as { url: string; id: number })?.url : null,
            images: vehicle.main_image ? [{
              id: (vehicle.main_image as unknown as { url: string; id: number }).id,
              image_url: (vehicle.main_image as unknown as { url: string; id: number }).url,
              is_primary: true
            }] : null,
            city: null, // Não disponível na API
            price: vehicle.price ? parseFloat(vehicle.price.toString()) : null,
            year: vehicle.year,
            mileage: vehicle.mileage,
            fuel_type: vehicle.fuel_type,
            transmission: vehicle.transmission,
            brand: (vehicle.brand as unknown as { name: string })?.name || (vehicle.brand as string) || 'Marca',
            model: (vehicle.model as unknown as { name: string })?.name || (vehicle.model as string) || 'Modelo',
            description: vehicle.description,
            status: vehicle.status,
            created_at: vehicle.created_at
          }))
          setFeaturedVehicles(convertedVehicles)
        }

        // Carregar estatísticas dos veículos
        const statsData = await getPortalVehicleStats(subdomain)
        console.log('✅ Estatísticas carregadas:', statsData)
        setVehicleStats(statsData)

        // Aplicar configurações do tenant
        if (tenantData) {
          try {
            applyTenantTheme(tenantData)
            applyTenantSeo(tenantData)
            applyTenantPortalSettings(tenantData)
      } catch (error) {
            console.warn('⚠️ Erro ao aplicar configurações do tenant:', error)
          }
        }

      } catch (error) {
        console.error('❌ Erro ao carregar dados do portal:', error)

        // Tratamento específico para diferentes tipos de erro
        if (error instanceof Error) {
          if (error.message === 'SERVICE_UNAVAILABLE') {
            console.log('🔄 API temporariamente indisponível, usando dados de fallback')
          } else if (error.message === 'TENANT_NOT_FOUND') {
            console.log('🔄 Tenant não encontrado, usando dados de fallback')
          } else {
            console.log('🔄 Erro desconhecido, usando dados de fallback para desenvolvimento local')
          }
        }

        // Fallback para desenvolvimento local
        const fallbackTenant = {
            id: 1,
            name: 'ÔMEGA Veículos',
            subdomain: 'demo',
          description: 'Concessionária especializada em veículos seminovos com mais de 20 anos de experiência no mercado automotivo.',
            contact_email: 'contato@omegaveiculos.com.br',
          contact_phone: '(11) 99999-9999',
          address: 'São Paulo, SP',
          theme_color: '#3B82F6',
          logo_url: 'https://production.autoforce.com/uploads/group/logo/1473/logo_webp_comprar-omega-veiculos_dc3600ed18.png.webp'
        }
        setTenant(fallbackTenant)
      } finally {
          setIsLoading(false)
      }
    }

    loadPortalData()
  }, [])


  if (isLoading) {
  return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-white">Carregando portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">

      {/* Hero Section - Portal Style */}
      <section className="relative bg-black text-white py-8 flex items-center">
        {/* Background com silhuetas de edifícios */}
        <div className="absolute inset-0 opacity-80 hover:opacity-100 transition-opacity duration-300 bg-opacity-80" style={{ backgroundImage: `url(/portal/assets/img/bg/about-testimonial.jpg) `, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundBlendMode: 'overlay' }}></div>
        <div className="absolute bottom-0 left-0 right-0 h-34 bg-gradient-to-t from-gray-500 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Conteúdo da esquerda */}
            <div className="align-justify text-justify">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-justify">
                Explore nossos <span className="text-orange-500 mt-2 mb-2 text-justify">Veículos Novos e Seminovos</span>
              </h1>

              <p className="text-xl md:text-2xl mb-8 text-white  align-justify text-justify">
                Carros esportivos de design moderno para quem busca aventura e grandeza.
                Veículos para relaxar com seus entes queridos.
              </p>

              {/* Estatísticas */}


              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                  href="/portal/vehicles"
                  className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors inline-flex items-center"
                >
                  Comprar Carro
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                      </Link>
                      <Link
                  href="/portal/vehicles/create"
                  className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors inline-flex items-center"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Vender Carro
                      </Link>
                    </div>
                  </div>

            {/* Imagem da direita */}
            <div className="relative backdrop-blur-sm">
              <div className="relative">
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Disponível para Compra
                </div>
                <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-full">
                  <p className="text-xs">A partir de</p>
                  <h6 className="text-lg font-bold">R$ 65.000</h6>
              </div>
                <div className="w-full h-80 transition-all duration-300  rounded-lg flex items-center justify-center ">
                  <img
                    src="/portal/assets/img/cars/car-15.png"
                    alt="Carro para compra"
                    className="w-full h-full object-contain"
                  />
                    </div>
                  </div>
                </div>
              </div>
            </div>

        {/* Formulário de busca - Portal Style - Desktop */}
        <div className="absolute bottom-0 left-0 right-0 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mb-16">
            <div className="bg-gray-500 rounded-xl shadow-2xl p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Marca</label>
                    <select
                      value={searchFilters.brand}
                      onChange={(e) => {
                        const brandValue = e.target.value
                        setSearchFilters(prev => ({
                          ...prev,
                          brand: brandValue,
                          model: '' // Reset modelo quando marca muda
                        }))
                        // Carregar modelos para a marca selecionada
                        loadModelsForBrand(brandValue)
                      }}
                      className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
                    >
                    <option value="">Todas as Marcas</option>
                    <option value="honda">Honda</option>
                    <option value="toyota">Toyota</option>
                    <option value="volkswagen">Volkswagen</option>
                    <option value="ford">Ford</option>
                    <option value="chevrolet">Chevrolet</option>
                    <option value="fiat">Fiat</option>
                    <option value="nissan">Nissan</option>
                    <option value="hyundai">Hyundai</option>
                    <option value="kia">Kia</option>
                    <option value="bmw">BMW</option>
                    <option value="mercedes-benz">Mercedes-Benz</option>
                    <option value="audi">Audi</option>
                    <option value="peugeot">Peugeot</option>
                    <option value="renault">Renault</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Modelo</label>
                  <div className="relative">
                    <select
                      value={searchFilters.model}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, model: e.target.value }))}
                      disabled={!searchFilters.brand || isLoadingModels}
                      className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white appearance-none disabled:opacity-50"
                    >
                      <option value="">
                        {!searchFilters.brand
                          ? 'Selecione uma marca primeiro'
                          : isLoadingModels
                            ? 'Carregando modelos...'
                            : 'Todos os modelos'
                        }
                      </option>
                      {availableModels.map((model) => (
                        <option key={model.id} value={model.name.toLowerCase()}>
                          {model.name}
                        </option>
                      ))}
                  </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
              </div>

                      <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ano</label>
                  <select
                    value={searchFilters.year}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
                  >
                    <option value="">Todos os Anos</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                    <option value="2019">2019</option>
                    <option value="2018">2018</option>
                    <option value="2017">2017</option>
                    <option value="2016">2016</option>
                    <option value="2015">2015</option>
                    <option value="2014">2014</option>
                    <option value="2013">2013</option>
                    <option value="2012">2012</option>
                    <option value="2011">2011</option>
                    <option value="2010">2010</option>
                    </select>
                      </div>

                <div className="flex items-end">
                <button
                  type="submit"
                    className="w-full bg-orange-500 text-white p-3 rounded-full font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
                    </div>
            </form>
                    </div>
                  </div>

        {/* Botões de busca para Mobile */}
        <div className="absolute bottom-0 left-0 right-0 md:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mb-8">
            <div className="bg-gray-500 rounded-xl shadow-2xl p-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSearchModal(true)}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Pesquisa
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilterModal(true)}
                  className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtro Avançado
                </button>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
      </section>

      {/* Categorias em Destaque */}
      <section className="py-20 pb-8 pt-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ✨ Porque comprar carros econômicos com a gente? ✨
              </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sabe o que está procurando? Navegue pela nossa extensa seleção de carros econômicos
            </p>
                    </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            {/* Coupe Esportivo */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Coupe Esportivo</h3>
                    <p className="text-sm text-gray-500">14 Carros</p>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                    <i className="bx bx-right-arrow-alt text-gray-600 group-hover:text-white"></i>
                  </div>
                </div>
                <div className="h-32 flex items-center justify-center">
                    <Image
                    src="/portal/assets/img/category/category-01.png"
                    alt="Coupe Esportivo"
                    width={200}
                    height={128}
                    className="w-full h-full object-contain"
                  />
                    </div>
                  </div>
                </div>

            {/* Sedan */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Sedan</h3>
                    <p className="text-sm text-gray-500">12 Carros</p>
                      </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                    <i className="bx bx-right-arrow-alt text-gray-600 group-hover:text-white"></i>
                    </div>
                </div>
                <div className="h-32 flex items-center justify-center">
                  <Image
                    src="/portal/assets/img/category/category-02.png"
                    alt="Sedan"
                    width={200}
                    height={128}
                    className="w-full h-full object-contain"
                  />
                      </div>
                  </div>
                </div>

            {/* Carro Esportivo */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Carro Esportivo</h3>
                    <p className="text-sm text-gray-500">35 Carros</p>
                      </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                    <i className="bx bx-right-arrow-alt text-gray-600 group-hover:text-white"></i>
                    </div>
                    </div>
                <div className="h-32 flex items-center justify-center">
                  <Image
                    src="/portal/assets/img/category/category-03.png"
                    alt="Carro Esportivo"
                    width={200}
                    height={128}
                    className="w-full h-full object-contain"
                  />
                  </div>
              </div>
              </div>

            {/* Picape */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Picape</h3>
                    <p className="text-sm text-gray-500">35 Carros</p>
          </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                    <i className="bx bx-right-arrow-alt text-gray-600 group-hover:text-white"></i>
        </div>
                </div>
                <div className="h-32 flex items-center justify-center">
                  <Image
                    src="/portal/assets/img/category/category-04.png"
                    alt="Picape"
                    width={200}
                    height={128}
                    className="w-full h-full object-contain"
                  />
              </div>
              </div>
            </div>

            {/* MPV Familiar */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                    <h3 className="text-lg font-bold text-gray-900">MPV Familiar</h3>
                    <p className="text-sm text-gray-500">35 Carros</p>
                    </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                    <i className="bx bx-right-arrow-alt text-gray-600 group-hover:text-white"></i>
                  </div>
                </div>
                <div className="h-32 flex items-center justify-center">
                  <Image
                    src="/portal/assets/img/category/category-05.png"
                    alt="MPV Familiar"
                    width={200}
                    height={128}
                    className="w-full h-full object-contain"
                  />
                    </div>
                  </div>
                </div>

            {/* Crossover - Tema Escuro */}
            <div className="bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                    <h3 className="text-lg font-bold text-white">Crossover</h3>
                    <p className="text-sm text-gray-300">30 Carros</p>
                    </div>
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                    <i className="bx bx-right-arrow-alt text-white"></i>
                  </div>
                </div>
                <div className="h-32 flex items-center justify-center">
                  <Image
                    src="/portal/assets/img/category/category-06.png"
                    alt="Crossover"
                    width={200}
                    height={128}
                    className="w-full h-full object-contain"
                  />
                    </div>
                  </div>
                </div>
          </div>

          <div className="text-center mt-12">
                <Link
              href="/portal/vehicles"
              className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-700 transition-colors inline-flex items-center"
                >
                  Todos os Carros a Venda
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
                </Link>
                    </div>
                  </div>
      </section>

      {/* Veículos em Destaque - Portal Style (MOVIDO PARA AQUI) */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
              <h2 className="text-4xl font-bold text-gray-900">
                Comprar Carros Econômicos Populares
              </h2>
              <div className="w-4 h-4 bg-orange-500 rounded-full ml-2"></div>
                </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Aqui está uma lista dos carros econômicos mais populares em nossa plataforma
            </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
              />
            ))}
                    </div>

          <div className="text-center mt-12">
                <Link
              href="/portal/vehicles"
              className="bg-green-500 text-white px-8 py-4 mx-block rounded-lg font-semibold text-lg hover:bg-green-600 transition-colors mx-auto w-full"
                >
              Todos os Carros a Venda
                </Link>
                  </div>
                </div>
      </section>

      {/* Recursos do Portal - Portal Style */}
      <section className="py-8" style={{
        backgroundColor: 'var(--background-color, #ffffff)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <div className="w-4 h-4 rounded-full mr-2" style={{
                backgroundColor: 'var(--accent-color, #F59E0B)'
              }}></div>
              <h2 className="text-4xl font-bold mb-4" style={{
                color: 'var(--text-color, #111827)'
              }}>
                Melhor Site para Compra de Carros
              </h2>
              <div className="w-4 h-4 rounded-full ml-2" style={{
                backgroundColor: 'var(--accent-color, #F59E0B)'
              }}></div>
              </div>
            <p className="text-xl max-w-3xl mx-auto" style={{
              color: 'var(--text-secondary-color, #6B7280)'
            }}>
              Por que escolher nossa site? Oferecemos a melhor experiência
              para encontrar o veículo ideal para suas necessidades.
            </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🏆',
                title: 'Melhor Preço',
                description: 'Garantimos os melhores preços do mercado'
              },
              {
                icon: '🚚',
                title: 'Entrega na Porta',
                description: 'Entrega gratuita em toda a região'
              },
              {
                icon: '🔒',
                title: 'Segurança',
                description: 'Transações 100% seguras'
              },
              {
                icon: '🚗',
                title: 'Veículos Verificados',
                description: 'Todos os veículos passam por inspeção rigorosa'
              },
              {
                icon: '📞',
                title: 'Suporte 24h',
                description: 'Suporte disponível 24 horas por dia'
              },
              {
                icon: '💳',
                title: 'Sem Taxas Ocultas',
                description: 'Preços transparentes, sem surpresas'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow" style={{
                backgroundColor: 'var(--background-color, #ffffff)'
              }}>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3" style={{
                  color: 'var(--text-color, #111827)'
                }}>{feature.title}</h3>
                <p style={{
                  color: 'var(--text-secondary-color, #6B7280)'
                }}>{feature.description}</p>
                        </div>
            ))}
          </div>
        </div>
      </section>

      {/* Carros Populares em Destaque - Portal Style */}
      <section className="py-8" style={{
        backgroundColor: 'var(--background-color, #ffffff)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <div className="w-4 h-4 rounded-full mr-2" style={{
                backgroundColor: 'var(--accent-color, #F59E0B)'
              }}></div>
              <h2 className="text-4xl font-bold mb-4" style={{
                color: 'var(--text-color, #111827)'
              }}>
                Quero mais Carros à Venda
              </h2>
              <div className="w-4 h-4 rounded-full ml-2" style={{
                backgroundColor: 'var(--accent-color, #F59E0B)'
              }}></div>
              </div>
            <p className="text-xl max-w-2xl mx-auto" style={{
              color: 'var(--text-secondary-color, #6B7280)'
            }}>
              Aqui está uma lista dos carros a venda
            </p>
                        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVehicles.length > 0 ? (
                  featuredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                />
                  ))
                ) : (
              // Fallback cards quando não há dados da API
              [
                {
                  id: 1,
                  title: 'Toyota Camry SE 350',
                  main_image: '/portal/assets/img/cars/car-15.png',
                  city: 'Lasvegas',
                  price: 160000,
                  year: 2018,
                  mileage: 10000,
                  fuel_type: 'Diesel',
                  transmission: 'Automático',
                  brand: 'Toyota',
                  model: 'Camry',
                  status: 'available'
                },
                {
                  id: 2,
                  title: 'Audi A3 2019 novo',
                  main_image: '/portal/assets/img/cars/car-16.png',
                  city: 'Lasvegas',
                  price: 45000,
                  year: 2019,
                  mileage: 10000,
                  fuel_type: 'Diesel',
                  transmission: 'Automático',
                  brand: 'Audi',
                  model: 'A3',
                  status: 'available'
                },
                {
                  id: 3,
                  title: 'Ford Mustang 4.0 AT',
                  main_image: '/portal/assets/img/cars/car-17.png',
                  city: 'Lasvegas',
                  price: 90000,
                  year: 2021,
                  mileage: 10000,
                  fuel_type: 'Gasolina',
                  transmission: 'Automático',
                  brand: 'Ford',
                  model: 'Mustang',
                  status: 'available'
                }
              ].map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                />
                  ))
                )}
                </div>

          <div className="text-center mt-12">
            <Link
              href="/portal/vehicles"
              className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-600 transition-colors block mx-auto w-full"
            >
              Quero mais Carros à Venda
            </Link>
              </div>
            </div>
      </section>

      {/* Seção de Marcas - Portal Style */}
      {/* <section className="py-8 text-white" style={{
        backgroundColor: 'var(--danger-color, #EF4444)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 flex items-center justify-center">
              <span className="mr-2" style={{ color: 'var(--accent-color, #F59E0B)' }}>✨</span>
              Comprar por Marcas
              <span className="ml-2" style={{ color: 'var(--accent-color, #F59E0B)' }}>✨</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{
              color: 'var(--text-secondary-color, #D1D5DB)'
            }}>
              Aqui está uma lista das marcas de carros mais populares globalmente
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { name: 'BMW', image: '/portal/assets/img/brand/brand-01.svg' },
              { name: 'Mercedes-Benz', image: '/portal/assets/img/brand/brand-02.svg' },
              { name: 'Hyundai', image: '/portal/assets/img/brand/brand-03.svg' },
              { name: 'Audi', image: '/portal/assets/img/brand/brand-04.svg' },
              { name: 'Kia', image: '/portal/assets/img/brand/brand-05.svg' },
              { name: 'Chevrolet', image: '/portal/assets/img/brand/brand-06.svg' }
            ].map((brand, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <p className="font-medium" style={{
                  color: 'var(--text-secondary-color, #D1D5DB)'
                }}>{brand.name}</p>
              </div>
            ))}
              </div>

          {/* Imagem de fundo com carro */}
          {/* <div className="mt-16 relative">
            <div className="w-full h-32 rounded-lg overflow-hidden" style={{
              background: `linear-gradient(to top, var(--primary-color, #111827), transparent)`
            }}>
              <img
                src="/portal/assets/img/bg/brand.png"
                alt="Carro de fundo"
                className="w-full h-full object-cover opacity-20"
              />
                </div>
              </div>
              </div>
      </section> */}



      {/* Como Funciona - Portal Style */}
      <section className="py-8" style={{
        backgroundColor: 'var(--background-color, #ffffff)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="text-start mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-4 h-4 rounded-full mr-2" style={{
                    backgroundColor: 'var(--accent-color, #F59E0B)'
                  }}></div>
                  <h2 className="text-4xl font-bold mb-4" style={{
                    color: 'var(--text-color, #111827)'
                  }}>
                    Comprar Comprar Carros em 3 Passos
                  </h2>
                  <div className="w-4 h-4 rounded-full ml-2" style={{
                    backgroundColor: 'var(--accent-color, #F59E0B)'
                  }}></div>
          </div>
                <p className="text-xl mb-4" style={{
                  color: 'var(--text-secondary-color, #6B7280)'
                }}>
                  Veja como funciona para comprar carros  em nosso site
                </p>
        </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0" style={{
                    backgroundColor: 'var(--accent-color, #F59E0B)'
                  }}>
                    1
                </div>
                  <div>
                    <h5 className="text-lg font-semibold mb-2" style={{
                      color: 'var(--text-color, #111827)'
                    }}>
                      Escolha o Carro para comprar
                    </h5>
                    <p style={{
                      color: 'var(--text-secondary-color, #6B7280)'
                    }}>
                      Navegue por nossa seleção de carros e escolha o que melhor atende suas necessidades.
                    </p>
              </div>
            </div>

                <div className="flex items-start gap-4">
                  <div className="text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0" style={{
                    backgroundColor: 'var(--success-color, #10B981)'
                  }}>
                    2
          </div>
                  <div>
                    <h5 className="text-lg font-semibold mb-2" style={{
                      color: 'var(--text-color, #111827)'
                    }}>
                      Agende uma Visita para comprar o carro
                    </h5>
                    <p style={{
                      color: 'var(--text-secondary-color, #6B7280)'
                    }}>
                      Entre em contato conosco para agendar uma visita e conhecer o veículo pessoalmente.
                    </p>
        </div>
    </div>

                <div className="flex items-start gap-4">
                  <div className="text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0" style={{
                    backgroundColor: 'var(--info-color, #8B5CF6)'
                  }}>
                    3
                </div>
                  <div>
                    <h5 className="text-lg font-semibold mb-2" style={{
                      color: 'var(--text-color, #111827)'
                    }}>
                      Feche o Negócio
                    </h5>
                    <p style={{
                      color: 'var(--text-secondary-color, #6B7280)'
                    }}>
                      Faça sua compra com segurança e receba seu veículo com toda documentação em dia.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="w-full h-80 rounded-lg flex items-center justify-center" >
                <span className="text-6xl">
                  <Image
                    src="/assets/img/about/rent-car.png"
                    alt="Carro"
                    width={400}
                    height={300}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    quality={80}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                </span>
                </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-lg flex items-center justify-center" >
                <span className="text-2xl">
                  <Image
                    src="/assets/img/about/car-grid.png"
                    alt="Grid de carros"
                    width={128}
                    height={128}
                    className="img-fluid"
                    loading="lazy"
                    quality={75}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                </span>
                  </div>
                </div>
              </div>
            </div>
      </section>

      {/* Estatísticas - Portal Style */}
      <section className="py-8 text-white" style={{
        backgroundColor: 'var(--danger-color, #EF4444)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div itemScope itemType="https://schema.org/QuantitativeValue">
              <div className="text-4xl font-bold mb-2" itemProp="value">{vehicleStats?.total_vehicles || 0}+</div>
              <div style={{
                color: 'var(--accent-light-color, #FEF3C7)'
              }} itemProp="name">Carros Disponíveis</div>
              <meta itemProp="unitCode" content="C62" />
                </div>
            <div itemScope itemType="https://schema.org/QuantitativeValue">
              <div className="text-4xl font-bold mb-2" itemProp="value">{vehicleStats?.featured_vehicles || 0}+</div>
              <div style={{
                color: 'var(--accent-light-color, #FEF3C7)'
              }} itemProp="name">Carros em Destaque</div>
              <meta itemProp="unitCode" content="C62" />
                  </div>
            <div itemScope itemType="https://schema.org/QuantitativeValue">
              <div className="text-4xl font-bold mb-2" itemProp="value">{vehicleStats?.available_vehicles || 0}+</div>
              <div style={{
                color: 'var(--accent-light-color, #FEF3C7)'
              }} itemProp="name">Carros Disponíveis para Venda</div>
              <meta itemProp="unitCode" content="C62" />
                </div>
            <div itemScope itemType="https://schema.org/QuantitativeValue">
              <div className="text-4xl font-bold mb-2" itemProp="value">{vehicleStats?.sold_vehicles || 0}+</div>
              <div style={{
                color: 'var(--accent-light-color, #FEF3C7)'
              }} itemProp="name">Carros Vendidos</div>
              <meta itemProp="unitCode" content="C62" />
              </div>
            </div>
          </div>
      </section>

      {/* Seção de Depoimentos dos Clientes */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Depoimentos reais de quem já comprou carro conosco
            </p>
          </div>

          {/* Carrossel de Depoimentos */}
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {[
                  {
                    name: "João Santos",
                    location: "São Paulo, SP",
                    text: "Como empresário, já comprei vários carros aqui e sempre recomendo para meus amigos. O atendimento é excepcional, carros à venda com procedência garantida e preços justos. Para quem quer comprar carro usado com segurança, esta é a melhor opção!",
                    avatar: "👨‍💼",
                    rating: 5,
                    car: "Honda Civic 2020"
                  },
                  {
                    name: "Ana Oliveira",
                    location: "Rio de Janeiro, RJ",
                    text: "Comprei meu primeiro carro aqui e foi uma experiência incrível! A equipe me ajudou a encontrar o veículo perfeito dentro do meu orçamento. Processo transparente e carros à venda com qualidade garantida. Recomendo para quem quer comprar carro seminovo!",
                    avatar: "👩‍💼",
                    rating: 4.5,
                    car: "Toyota Corolla 2019"
                  },
                  {
                    name: "Carlos Mendes",
                    location: "Belo Horizonte, MG",
                    text: "Precisava comprar carro urgente para meu trabalho. A equipe não só me ajudou a encontrar o veículo ideal como acelerou todo o processo de documentação. Carros à venda com procedência e atendimento personalizado. Nota 10!",
                    avatar: "👨",
                    rating: 4.5,
                    car: "Chevrolet Tracker 2021"
                  }
                ].map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 relative">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                          <span className="text-4xl">{testimonial.avatar}</span>
                  </div>
                        <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                          &ldquo;{testimonial.text}&rdquo;
                        </p>
                        <div className="flex justify-center mb-4">
                          {[...Array(5)].map((_, i) => {
                            if (i < Math.floor(testimonial.rating)) {
                              return <span key={i} className="text-yellow-400 text-xl">⭐</span>
                            } else if (i === Math.floor(testimonial.rating) && testimonial.rating % 1 !== 0) {
                              return <span key={i} className="text-yellow-400 text-xl">⭐</span>
                            } else {
                              return <span key={i} className="text-gray-300 text-xl">⭐</span>
                            }
                          })}
                </div>
                        <h4 className="font-bold text-lg text-gray-900">{testimonial.name}</h4>
                        <p className="text-gray-500 text-sm mb-2">
                          {testimonial.location}
                        </p>
                        <p className="text-orange-600 text-sm font-medium">
                          Comprou: {testimonial.car}
                        </p>
              </div>
                </div>
              </div>
                ))}
            </div>
          </div>

            {/* Botões de navegação */}
            <button
              onClick={() => setCurrentTestimonial((prev) => prev === 0 ? 2 : prev - 1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-orange-500 rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors z-10"
              title="Depoimentos anteriores"
              aria-label="Ver depoimentos anteriores"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
                    </button>
            <button
              onClick={() => setCurrentTestimonial((prev) => prev === 2 ? 0 : prev + 1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-orange-500 rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors z-10"
              title="Próximos depoimentos"
              aria-label="Ver próximos depoimentos"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
                    </button>

            {/* Indicadores */}
            <div className="flex justify-center mt-8 space-x-2">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentTestimonial === index ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                  title={`Ir para depoimento ${index + 1}`}
                  aria-label={`Ir para depoimento ${index + 1}`}
                />
              ))}
                    </div>
                  </div>

          <div className="text-center mt-12">
            <button className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors inline-flex items-center">
              Ver Todos os Depoimentos
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
                    </button>
                    </div>
                  </div>
      </section>

      {/* Seção de Perguntas Frequentes Interativa */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              FAQ - Carros Econômicos à Venda
                  </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tire suas dúvidas sobre comprar carros baratos e econômicos
            </p>
                    </div>

          <div className="space-y-4">
            {[
              {
                question: "Onde comprar carros econômicos e baratos?",
                answer: "Aqui você encontra os melhores carros econômicos à venda com preços acessíveis. Temos carros usados baratos, seminovos econômicos e veículos com manutenção barata e fácil. Todos os carros passam por rigorosa inspeção para garantir qualidade e economia."
              },
              {
                question: "Quais são os carros mais econômicos para comprar?",
                answer: "Nossos carros econômicos incluem modelos como Honda Civic, Toyota Corolla, Volkswagen Polo e Ford Ka. Estes veículos oferecem excelente custo-benefício, manutenção barata e fácil, além de baixo consumo de combustível. São ideais para quem busca carros à venda com economia garantida."
              },
              {
                question: "Como comprar carro usado barato com segurança?",
                answer: "Todos os nossos carros usados baratos passam por inspeção completa. Oferecemos garantia, documentação em dia e histórico do veículo. Você pode comprar carro usado com total segurança, sabendo que está adquirindo um veículo econômico e confiável."
              },
              {
                question: "Carros seminovos são mais econômicos que usados?",
                answer: "Sim! Carros seminovos oferecem o melhor custo-benefício: preço mais barato que zero km, mas com poucos anos de uso. São carros econômicos com manutenção barata e fácil, além de tecnologia mais recente. Perfeitos para quem quer carros à venda com qualidade e economia."
              },
              {
                question: "Qual a manutenção mais barata entre os carros econômicos?",
                answer: "Carros como Honda Civic, Toyota Corolla e Volkswagen Polo têm manutenção barata e fácil. Peças de reposição são acessíveis e mecânicos especializados são fáceis de encontrar. Estes modelos são conhecidos por sua confiabilidade e baixo custo de manutenção."
              },
              {
                question: "Posso financiar carros econômicos com juros baixos?",
                answer: "Sim! Oferecemos financiamento com condições especiais para carros econômicos. Taxas reduzidas, entrada facilitada e parcelas que cabem no seu bolso. Você pode comprar carro usado barato ou seminovo com financiamento acessível e sem complicações."
              },
              {
                question: "Carros econômicos consomem menos combustível?",
                answer: "Exato! Nossos carros econômicos são selecionados por seu baixo consumo. Modelos como Honda Civic e Toyota Corolla fazem até 15km/l na cidade. São carros à venda que economizam no dia a dia, reduzindo seus gastos com combustível significativamente."
              },
              {
                question: "Como escolher o carro econômico ideal para mim?",
                answer: "Considere seu orçamento, uso diário e necessidades. Para cidade, escolha carros compactos econômicos. Para família, prefira sedans com manutenção barata e fácil. Todos os nossos carros econômicos à venda têm ficha técnica detalhada para você comparar e escolher o melhor."
              }
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-200">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
                  className="w-full py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    openFaqIndex === index
                      ? 'bg-orange-500'
                      : 'bg-gray-200'
                  }`}>
                    {openFaqIndex === index ? (
                      <span className="text-white text-lg">−</span>
                    ) : (
                      <span className="text-gray-600 text-lg">+</span>
                    )}
                  </div>
                    </button>
                {openFaqIndex === index && (
                  <div className="pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                    </div>
                )}
                  </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Ver Todos os Carros e Categorias */}
      <section className="py-8" style={{
        backgroundColor: 'var(--background-color, #ffffff)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4" style={{
              color: 'var(--text-color, #111827)'
            }}>
                  Ver Todos os Carros a Venda por modelo
              </h2>
            <div className="w-full h-px bg-gray-200"></div>
                    </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
            {/* Coluna 1 */}
            <div className="space-y-3">
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros Coupe</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros Conversiveis</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros Hatchback</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros utilitários</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros Minivan</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros Caminhonete</div>
                    </div>

            {/* Coluna 2 */}
            <div className="space-y-3">
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros esportivos</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros SUV</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros Wagon</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros Crossover</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros elétricos</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros da Jeep</div>
                    </div>

            {/* Coluna 3 */}
            <div className="space-y-3">
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros segmento C1</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros compacto</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros Hatchback</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros de luxo</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros MPV</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros Van</div>
                    </div>

            {/* Coluna 4 - Marcas */}
            <div className="space-y-3">
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros da Suzuki</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros da Hyundai</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros da BYD</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros da Chevrolet</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros Volkswagen</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros da Renault</div>
                    </div>

            {/* Coluna 5 - Marcas */}
            <div className="space-y-3">
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros da Toyota</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros da Nissan</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros da Fiat</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros da Kia</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros da Ford</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros da Jeep</div>
                    </div>

            {/* Coluna 6 */}
            <div className="space-y-3">
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros Coupe</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros Conversiveis</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros Hatchback</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros esportivos</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros Minivan</div>
              <div className="text-gray-700 hover:text-orange-500 cursor-pointer transition-colors">&gt; Carros Caminhonete</div>
                  </div>
                </div>

          {/* Botão Scroll to Top */}
          <div className="fixed bottom-6 right-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
              </div>

          {/* Modal de Pesquisa Mobile - Formulário de Busca */}
          {showSearchModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:hidden">
              <div className="bg-white w-full rounded-t-xl p-20 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Pesquisar Veículos</h3>
                  <button
                    onClick={() => setShowSearchModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="bg-gray-100 rounded-lg py-6 shadow-sm mt-20">
                  <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                      <div className="relative">
                        <select
                          value={searchFilters.brand}
                          onChange={(e) => {
                            const brandValue = e.target.value
                            setSearchFilters(prev => ({
                              ...prev,
                              brand: brandValue,
                              model: '' // Reset modelo quando marca muda
                            }))
                            // Carregar modelos para a marca selecionada
                            loadModelsForBrand(brandValue)
                          }}
                          className="w-full px-3 py-20 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                        >
                          <option value="">Todas as Marcas</option>
                          <option value="honda">Honda</option>
                          <option value="toyota">Toyota</option>
                          <option value="volkswagen">Volkswagen</option>
                          <option value="ford">Ford</option>
                          <option value="chevrolet">Chevrolet</option>
                          <option value="fiat">Fiat</option>
                          <option value="nissan">Nissan</option>
                          <option value="hyundai">Hyundai</option>
                          <option value="kia">Kia</option>
                          <option value="bmw">BMW</option>
                          <option value="mercedes-benz">Mercedes-Benz</option>
                          <option value="audi">Audi</option>
                          <option value="peugeot">Peugeot</option>
                          <option value="renault">Renault</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                      <div className="relative">
                        <select
                          value={searchFilters.model}
                          onChange={(e) => setSearchFilters(prev => ({ ...prev, model: e.target.value }))}
                          disabled={!searchFilters.brand || isLoadingModels}
                          className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none disabled:opacity-50"
                        >
                          <option value="">
                            {!searchFilters.brand
                              ? 'Selecione uma marca primeiro'
                              : isLoadingModels
                                ? 'Carregando modelos...'
                                : 'Todos os modelos'
                            }
                          </option>
                          {availableModels.map((model) => (
                            <option key={model.id} value={model.name.toLowerCase()}>
                              {model.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ano</label>
                      <div className="relative">
                        <select
                          value={searchFilters.year}
                          onChange={(e) => setSearchFilters(prev => ({ ...prev, year: e.target.value }))}
                          className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                        >
                          <option value="">Todos os Anos</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                          <option value="2022">2022</option>
                          <option value="2021">2021</option>
                          <option value="2020">2020</option>
                          <option value="2019">2019</option>
                          <option value="2018">2018</option>
                          <option value="2017">2017</option>
                          <option value="2016">2016</option>
                          <option value="2015">2015</option>
                          <option value="2014">2014</option>
                          <option value="2013">2013</option>
                          <option value="2012">2012</option>
                          <option value="2011">2011</option>
                          <option value="2010">2010</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Veículo</label>
                      <div className="relative">
                        <select className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none">
                          <option>Todos os Tipos</option>
                          <option>Sedan</option>
                          <option>SUV</option>
                          <option>Hatchback</option>
                          <option>Pickup</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Pesquisar Veículos
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Filtro Avançado Mobile - Formulário de Filtros */}
          {showFilterModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:hidden">
              <div className="bg-white w-full rounded-t-xl p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">O que você está procurando</h3>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Barra de Pesquisa */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar veículo..."
                      className="w-full px-4 py-3 pl-10 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Marca do Carro */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Marca do Carro</h4>
                    <div className="space-y-3">
                      {['Tesla', 'Ford', 'Mercedes-Benz', 'Audi', 'Kia', 'Toyota', 'Honda', 'BMW'].map((brand) => (
                        <label key={brand} className="flex items-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                          />
                          <span className="ml-3 text-gray-700">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Categoria do Carro */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Categoria do Carro</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'Conversível', count: 25 },
                        { name: 'Cupê', count: 15 },
                        { name: 'Hatchback', count: 30 },
                        { name: 'SUV', count: 45 },
                        { name: 'Sedan', count: 20 },
                        { name: 'Pickup', count: 10 }
                      ].map((category) => (
                        <label key={category.name} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                            />
                            <span className="ml-3 text-gray-700">{category.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">({category.count})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Botão Aplicar Filtros */}
                  <button
                    type="button"
                    className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}
            </div>
      </section>
          </div>
  )
}

export default function PortalHomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-white">Carregando portal...</p>
        </div>
        </div>
    }>
      <PortalHomePageContent />
    </Suspense>
  )
}
