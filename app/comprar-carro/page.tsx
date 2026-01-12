
'use client'

import { useState, useEffect, Suspense, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import PortalLayout from '../portal/layout'

import {
  getPortalVehicles,
  getPortalTenantInfo,
  getPortalBrandModels,
  getPortalBrandsAndModels,
  applyTenantTheme,
  applyTenantSeo,
  applyTenantPortalSettings,
  PortalSearchParams
} from '@/lib/portal-api'
import { useSEOMetaTags, generateVehiclesPageMetaTags } from '@/lib/seo-metatags'
import { formatPrice } from '@/lib/format'
import { generateVehicleUrl } from '@/lib/slug-utils'
import VehicleCard from '@/components/ui/VehicleCard'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import Select2 from '@/components/ui/Select2'

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

// Hook personalizado para debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Funções utilitárias para extrair nomes de brand e model
const getBrandName = (brand: string | VehicleBrand | null): string => {
  if (!brand) return 'Marca'
  if (typeof brand === 'string') return brand
  return brand.name || 'Marca'
}



function VehiclesPageContent() {
  const [vehicles, setVehicles] = useState<FlexibleVehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showPerPage, setShowPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalVehicles, setTotalVehicles] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Estados para modais mobile
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Estado para controlar se o componente está montado
  const [isMounted, setIsMounted] = useState(false)

  // Estados para filtros
  const [filters, setFilters] = useState({
    search: '',
    brand_id: null as number | null,
    model_id: null as number | null,
    vehicle_type: '',
    year_min: null as number | null,
    year_max: null as number | null,
    price_min: null as number | null,
    price_max: null as number | null,
    fuel_type: '',
    transmission: '',
    city: '',
    status: '',
    featured: false,
    sort: 'newest',
    order: 'desc' as 'asc' | 'desc'
  })

  // Estados para opções de filtros dinâmicos
  const [filterOptions, setFilterOptions] = useState({
    brands: [] as Array<{id: number, name: string}>,
    models: [] as Array<{id: number, name: string}>,
    cities: [] as string[],
    vehicleTypes: [] as string[],
    fuelTypes: [] as string[],
    transmissions: [] as string[]
  })

  // Estado para armazenar todos os modelos carregados
  const [allModels, setAllModels] = useState<Array<{id: number, name: string, brand_id: number}>>([])

  // Estado para controlar carregamento de modelos
  const [isLoadingModels, setIsLoadingModels] = useState(false)

  // Estado para controlar carregamento silencioso (sem piscar a tela)
  const [isSilentLoading, setIsSilentLoading] = useState(false)

  // Debounce para busca - só busca com 5+ caracteres
  const debouncedSearch = useDebounce(
    filters.search.length >= 5 ? filters.search : '',
    500
  )

  // Refs para controlar carregamento inicial e evitar loops
  const hasLoadedInitial = useRef(false)
  const isLoadingRef = useRef(false)

  const [tenant, setTenant] = useState<{
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
  } | null>(null)

  // Função para carregar opções de filtros dinamicamente
  const loadFilterOptions = useCallback(async () => {
    if (!isMounted) return

    try {
      console.log('🔧 Carregando opções de filtros...')

        const subdomain = 'omegaveiculos'

      // Tentar carregar marcas e modelos da API
      try {
        const brandsAndModels = await getPortalBrandsAndModels(subdomain)

        if (isMounted) {
          setFilterOptions(prev => ({
            ...prev,
            brands: brandsAndModels.brands,
            cities: brandsAndModels.cities,
            vehicleTypes: brandsAndModels.vehicleTypes,
            fuelTypes: brandsAndModels.fuelTypes,
            transmissions: brandsAndModels.transmissions
          }))

          // Armazenar todos os modelos para uso posterior
          setAllModels(brandsAndModels.models)
        }

        console.log('✅ Opções de filtros carregadas da API:', {
          brands: brandsAndModels.brands.length,
          models: brandsAndModels.models.length,
          cities: 'cidades padrão'
        })
      } catch (apiError) {
        console.warn('⚠️ Erro ao carregar da API, usando dados padrão:', apiError)

        // Fallback para dados padrão
        const defaultBrands = [
          { id: 1, name: 'Toyota' },
          { id: 2, name: 'Honda' },
          { id: 3, name: 'Ford' },
          { id: 4, name: 'Chevrolet' },
          { id: 5, name: 'Volkswagen' },
          { id: 6, name: 'Fiat' },
          { id: 7, name: 'Hyundai' },
          { id: 8, name: 'Nissan' },
          { id: 9, name: 'BMW' },
          { id: 10, name: 'Mercedes-Benz' },
          { id: 11, name: 'Audi' },
          { id: 12, name: 'Peugeot' },
          { id: 13, name: 'Renault' },
          { id: 14, name: 'Kia' },
          { id: 15, name: 'Mitsubishi' }
        ]

        if (isMounted) {
          setFilterOptions(prev => ({
            ...prev,
            brands: defaultBrands,
            cities: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Salvador', 'Fortaleza', 'Manaus', 'Curitiba', 'Recife', 'Goiânia'],
            vehicleTypes: ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Coupe', 'Convertible', 'Wagon', 'Van'],
            fuelTypes: ['flex', 'diesel', 'gasolina', 'eletrico', 'hibrido', 'gnv'],
            transmissions: ['automatica', 'cvt', 'manual', 'automatizada']
          }))

          setAllModels([])
        }

        console.log('✅ Opções de filtros carregadas (fallback):', {
          brands: defaultBrands.length,
          cities: 'cidades padrão'
        })
      }
    } catch (error) {
      console.error('❌ Erro ao carregar opções de filtros:', error)
    }
  }, [isMounted])

  // Função para carregar modelos quando uma marca é selecionada
  const loadModels = useCallback(async (brandId: number) => {
    if (!isMounted) return

    try {
      const subdomain = 'omegaveiculos'
      console.log('🚗 Carregando modelos da marca ID:', brandId)
      console.log('📊 Estado atual allModels:', allModels.length, 'modelos')
      console.log('📊 Estado atual filterOptions.models:', filterOptions.models.length, 'modelos')

      // Ativar loading
      if (isMounted) {
        setIsLoadingModels(true)
        setFilterOptions(prev => ({
          ...prev,
          models: []
        }))
      }

      // Usar modelos já carregados se disponíveis, senão buscar da API
      const models = await getPortalBrandModels(subdomain, brandId, allModels)

      console.log('🔍 Resultado da API getPortalBrandModels:', models)

      if (isMounted) {
        setFilterOptions(prev => ({
          ...prev,
          models: models || []
        }))
        setIsLoadingModels(false)
      }

      console.log('✅ Modelos carregados com sucesso:', models?.length || 0)
      console.log('📊 Estado final filterOptions.models:', filterOptions.models.length, 'modelos')

      if (models && models.length > 0) {
        console.log('📋 Lista de modelos:', models.map(m => `${m.id}: ${m.name}`).join(', '))
      }

    } catch (error) {
      console.error('❌ Erro ao carregar modelos:', error)
      if (isMounted) {
        setFilterOptions(prev => ({
          ...prev,
          models: []
        }))
        setIsLoadingModels(false)
      }
    }
  }, [isMounted, allModels, filterOptions.models])

  // Função para carregar veículos com filtros
  const loadVehicles = useCallback(async (silent: boolean = false) => {
    if (!isMounted || isLoadingRef.current) return

    isLoadingRef.current = true
    try {
      // Só mostra loading se não for silencioso
      if (!silent) {
        setIsLoading(true)
      } else {
        setIsSilentLoading(true)
      }
        const subdomain = 'omegaveiculos'
      console.log('🚀 Carregando veículos com filtros:', filters)

      // Preparar parâmetros de busca
      const searchParams: PortalSearchParams = {
          per_page: showPerPage,
          page: currentPage
      }

      // Aplicar filtros ativos
      if (debouncedSearch) searchParams.search = debouncedSearch
      if (filters.brand_id) searchParams.brand_id = filters.brand_id
      if (filters.model_id) searchParams.model_id = filters.model_id
      if (filters.vehicle_type) searchParams.vehicle_type = filters.vehicle_type
      if (filters.year_min) searchParams.year_min = filters.year_min
      if (filters.year_max) searchParams.year_max = filters.year_max
      if (filters.price_min) searchParams.price_min = filters.price_min
      if (filters.price_max) searchParams.price_max = filters.price_max
      if (filters.fuel_type) searchParams.fuel_type = filters.fuel_type
      if (filters.transmission) searchParams.transmission = filters.transmission
      if (filters.city) searchParams.city = filters.city
      if (filters.status) searchParams.status = filters.status
      if (filters.featured) searchParams.featured = filters.featured
      if (filters.sort) searchParams.sort = filters.sort
      if (filters.order) searchParams.order = filters.order

      console.log('📋 Parâmetros de busca:', searchParams)
      console.log('🔍 Filtros ativos:', {
        year_min: filters.year_min,
        year_max: filters.year_max,
        price_min: filters.price_min,
        price_max: filters.price_max,
        brand_id: filters.brand_id,
        model_id: filters.model_id
      })

        // Carregar veículos
      const vehiclesData = await getPortalVehicles(subdomain, searchParams)

        if (vehiclesData && vehiclesData.data && Array.isArray(vehiclesData.data)) {
          const convertedVehicles = vehiclesData.data.map(vehicle => ({
            id: vehicle.id,
            title: vehicle.title,
            main_image: vehicle.main_image ? (vehicle.main_image as unknown as { url: string; id: number })?.url : null,
            images: vehicle.main_image ? [{
              id: (vehicle.main_image as unknown as { url: string; id: number }).id,
              image_url: (vehicle.main_image as unknown as { url: string; id: number }).url,
              is_primary: true
            }] : null,
          city: vehicle.city,
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

          if (isMounted) {
          setVehicles(convertedVehicles)
          setTotalVehicles(vehiclesData.meta?.total || convertedVehicles.length)
          setTotalPages(vehiclesData.meta?.last_page || 1)
        }

        console.log('✅ Veículos carregados:', {
          total: vehiclesData.meta?.total || convertedVehicles.length,
          currentPage: vehiclesData.meta?.current_page || currentPage,
          totalPages: vehiclesData.meta?.last_page || 1
        })
      } else {
        console.warn('⚠️ Nenhum veículo encontrado')
        if (isMounted) {
          setVehicles([])
          setTotalVehicles(0)
          setTotalPages(0)
          }
        }

      } catch (error) {
        console.error('❌ Erro ao carregar veículos:', error)

        // Fallback para desenvolvimento local
        const fallbackVehicles = [
          {
            id: 1,
            title: 'Toyota Camry SE 350',
            main_image: '/portal/assets/img/cars/car-15.png',
            images: null,
            city: 'São Paulo',
            price: 160000,
            year: 2018,
            mileage: 10000,
            fuel_type: 'Flex',
            transmission: 'Automático',
            brand: 'Toyota',
            model: 'Camry',
            description: 'Veículo em excelente estado',
            status: 'available',
            created_at: '2024-01-01'
          },
          {
            id: 2,
            title: 'Audi A3 2019',
            main_image: '/portal/assets/img/cars/car-16.png',
            images: null,
            city: 'Rio de Janeiro',
            price: 45000,
            year: 2019,
            mileage: 10000,
            fuel_type: 'Flex',
            transmission: 'Automático',
            brand: 'Audi',
            model: 'A3',
            description: 'Veículo seminovo',
            status: 'available',
            created_at: '2024-01-02'
          },
          {
            id: 3,
            title: 'Ford Mustang 4.0 AT',
            main_image: '/portal/assets/img/cars/car-17.png',
            images: null,
            city: 'Belo Horizonte',
            price: 90000,
            year: 2021,
            mileage: 10000,
            fuel_type: 'Gasolina',
            transmission: 'Automático',
            brand: 'Ford',
            model: 'Mustang',
            description: 'Carro esportivo',
            status: 'available',
            created_at: '2024-01-03'
          }
        ]
      if (isMounted) {
        setVehicles(fallbackVehicles)
        setTotalVehicles(fallbackVehicles.length)
        setTotalPages(1)
      }
      } finally {
      isLoadingRef.current = false
      if (isMounted) {
        setIsLoading(false)
        setIsSilentLoading(false)
      }
    }
  }, [currentPage, showPerPage, debouncedSearch, filters, isMounted])

  // Aplicar meta tags SEO completas com dados reais da API
  const metaTags = generateVehiclesPageMetaTags(tenant, vehicles, totalVehicles)
  useSEOMetaTags(metaTags, tenant)

  // Controlar montagem do componente
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    if (hasLoadedInitial.current || !isMounted) return

    const loadInitialData = async () => {
      try {
        const subdomain = 'omegaveiculos'
        console.log('🏢 Carregando dados iniciais...')

        // Carregar informações do tenant
        const tenantData = await getPortalTenantInfo(subdomain)
        if (tenantData && isMounted) {
          setTenant(tenantData)

          // Aplicar configurações do tenant
          try {
            applyTenantTheme(tenantData)
            applyTenantSeo(tenantData)
            applyTenantPortalSettings(tenantData)
          } catch (error) {
            console.warn('⚠️ Erro ao aplicar configurações do tenant:', error)
          }
        }

        // Carregar opções de filtros
        if (isMounted) {
          await loadFilterOptions()
        }

        // Carregar veículos iniciais
        if (isMounted) {
          await loadVehicles(false) // Não silencioso no carregamento inicial
        }

        hasLoadedInitial.current = true
        console.log('✅ Dados iniciais carregados')
      } catch (error) {
        console.error('❌ Erro ao carregar dados iniciais:', error)
      }
    }

    loadInitialData()
  }, [isMounted, loadFilterOptions, loadVehicles])

  // Carregar veículos quando filtros ou paginação mudarem (após carregamento inicial)
  useEffect(() => {
    if (!hasLoadedInitial.current || !isMounted) return

    // Usar carregamento silencioso para mudanças de filtros
    loadVehicles(true)
  }, [loadVehicles, isMounted])

  // Resetar página quando filtros mudarem (exceto paginação)
  useEffect(() => {
    if (!hasLoadedInitial.current || !isMounted) return

    setCurrentPage(1)
  }, [debouncedSearch, filters.brand_id, filters.model_id, filters.vehicle_type, filters.year_min, filters.year_max, filters.price_min, filters.price_max, filters.fuel_type, filters.transmission, filters.city, filters.status, filters.featured, filters.sort, filters.order, isMounted])

  // Função para limpar todos os filtros
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      brand_id: null,
      model_id: null,
      vehicle_type: '',
      year_min: null,
      year_max: null,
      price_min: null,
      price_max: null,
      fuel_type: '',
      transmission: '',
      city: '',
      status: '',
      featured: false,
      sort: 'newest',
      order: 'desc'
    })
    setFilterOptions(prev => ({
      ...prev,
      models: []
    }))
  }, [])

  // Função para aplicar filtro de marca
  const handleBrandChange = useCallback((brandId: number | null) => {
    console.log('🎯 handleBrandChange chamado com brandId:', brandId)

    setFilters(prev => ({
      ...prev,
      brand_id: brandId,
      model_id: null // Reset modelo quando marca muda
    }))

    if (brandId) {
      console.log('🚀 Chamando loadModels para brandId:', brandId)
      loadModels(brandId)
    } else {
      console.log('🧹 Limpando modelos (brandId é null)')
      setFilterOptions(prev => ({
        ...prev,
        models: []
      }))
      setIsLoadingModels(false)
    }
  }, [loadModels])

  // Função para aplicar filtro de modelo
  const handleModelChange = useCallback((modelId: number | null) => {
    setFilters(prev => ({
      ...prev,
      model_id: modelId
    }))
  }, [])

  // Contar filtros ativos
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (debouncedSearch && debouncedSearch.length >= 5) count++
    if (filters.brand_id) count++
    if (filters.model_id) count++
    if (filters.vehicle_type) count++
    if (filters.year_min || filters.year_max) count++
    if (filters.price_min || filters.price_max) count++
    if (filters.fuel_type) count++
    if (filters.transmission) count++
    if (filters.city) count++
    if (filters.status) count++
    if (filters.featured) count++
    return count
  }, [debouncedSearch, filters])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando veículos...</p>
        </div>
      </div>
    )
  }

  const startIndex = (currentPage - 1) * showPerPage + 1
  const endIndex = Math.min(currentPage * showPerPage, totalVehicles)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-400 hover:text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-gray-600">Comprar Carro</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Search Section - Desktop */}
      <div className="bg-white border-b hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-100 rounded-xl p-6">
            {/* <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                <select className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option>Escolher Localização</option>
                  <option>São Paulo</option>
                  <option>Rio de Janeiro</option>
                  <option>Belo Horizonte</option>
                  <option>Brasília</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Busca</label>
                <input
                  type="date"
                  className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Retorno</label>
                <input
                  type="date"
                  className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Veículo</label>
                <select className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option>Todos os Tipos</option>
                  <option>Sedan</option>
                  <option>SUV</option>
                  <option>Hatchback</option>
                  <option>Pickup</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white p-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Buscar
                </button>
              </div>
            </form> */}
          </div>
        </div>
      </div>

      {/* Botões de busca para Mobile */}
      <div className="bg-white border-b md:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="flex gap-3">
              <button
                type="button"
                title='Buscar'
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
                title='Filtro Avançado'
                onClick={() => setShowFilterModal(true)}
                className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center relative"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtro Avançado
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filtros - Desktop */}
          <div className="lg:w-1/4 hidden md:block">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">O que você está procurando</h3>

              {/* Busca */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    title='Buscar'
                    aria-label='Buscar'
                    placeholder="Buscar veículo... (mín. 5 caracteres)"
                    className="w-full px-3 py-2 pl-10 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {filters.search.length > 0 && filters.search.length < 5 && (
                  <p className="text-xs text-gray-600 mt-1">
                    Digite pelo menos 5 caracteres para buscar
                  </p>
                )}
              </div>

              {/* Marca do Carro */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Marca do Carro</h4>
                <div className="space-y-2">
                  <Select2
                    value={filters.brand_id || ''}
                    title='Marca do Carro'
                    ariaLabel='Marca do Carro'
                    onChange={(value) => {
                      const brandId = value ? parseInt(value.toString()) : null
                      handleBrandChange(brandId)
                    }}
                    options={[
                      { value: '', label: 'Todas as marcas' },
                      ...filterOptions.brands.map((brand) => ({
                        value: brand.id,
                        label: brand.name
                      }))
                    ]}
                    placeholder="Selecione uma marca"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Modelo do Carro */}
              {filters.brand_id && (
              <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Modelo do Carro</h4>
                <div className="space-y-2">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      title='Modelo do Carro'
                      aria-label='Modelo do Carro'
                      value={filters.model_id || ''}
                      disabled={isLoadingModels}
                        onChange={(e) => {
                        const modelId = e.target.value ? parseInt(e.target.value) : null
                        handleModelChange(modelId)
                      }}
                    >
                      <option value="">
                        {isLoadingModels ? 'Carregando modelos...' : 'Todos os modelos'}
                      </option>
                      {filterOptions.models.map((model) => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </select>
                    {isLoadingModels && (
                      <div className="flex items-center justify-center py-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                        <span className="ml-2 text-sm text-gray-600">Carregando modelos...</span>
                </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tipo de Veículo */}
              {/* <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Tipo de Veículo</h4>
                <div className="space-y-2">
                  <select
                    title='Tipo de Veículo'
                    aria-label='Tipo de Veículo'
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={filters.vehicle_type}
                    onChange={(e) => setFilters({...filters, vehicle_type: e.target.value})}
                  >
                    <option value="">Todos os tipos</option>
                    {filterOptions.vehicleTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div> */}

              {/* Ano */}
              {/* <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Ano</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ano mínimo</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      title='Ano mínimo'
                      aria-label='Ano mínimo'
                      value={filters.year_min || ''}
                      onChange={(e) => setFilters({...filters, year_min: e.target.value ? parseInt(e.target.value) : null,})}
                    >
                      <option value="">Qualquer ano</option>
                      {Array.from({length: 20}, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ano máximo</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      title='Ano máximo'
                      aria-label='Ano máximo'

                      value={filters.year_max || ''}
                      onChange={(e) => setFilters({...filters, year_max: e.target.value ? parseInt(e.target.value) : null})}
                    >
                      <option value="">Qualquer ano</option>
                      {Array.from({length: 20}, (_, i) => new Date().getFullYear() - i).map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div> */}

              {/* Tipo de Combustível */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Tipo de Combustível</h4>
                <div className="space-y-2">
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    title='Tipo de Combustível'
                    aria-label='Tipo de Combustível'

                    value={filters.fuel_type}
                    onChange={(e) => setFilters({...filters, fuel_type: e.target.value})}
                  >
                    <option value="">Todos os tipos</option>
                    {filterOptions.fuelTypes.map((fuel) => (
                      <option key={fuel} value={fuel}>
                        {fuel === 'flex' ? 'Flex' :
                         fuel === 'diesel' ? 'Diesel' :
                         fuel === 'gasolina' ? 'Gasolina' :
                         fuel === 'eletrico' ? 'Elétrico' :
                         fuel === 'hibrido' ? 'Híbrido' :
                         fuel === 'gnv' ? 'GNV' : fuel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transmissão */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Transmissão</h4>
                <div className="space-y-2">
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    title='Transmissão'
                    aria-label='Transmissão'

                    value={filters.transmission}
                    onChange={(e) => setFilters({...filters, transmission: e.target.value})}
                  >
                    <option value="">Todos os tipos</option>
                    {filterOptions.transmissions.map((transmission) => (
                      <option key={transmission} value={transmission}>
                        {transmission === 'automatica' ? 'Automática' :
                         transmission === 'cvt' ? 'CVT' :
                         transmission === 'manual' ? 'Manual' :
                         transmission === 'automatizada' ? 'Automatizada' : transmission}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preço */}
              {/* <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Preço</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Preço mínimo</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      title='Preço mínimo'
                      aria-label='Preço mínimo'

                      value={filters.price_min || ''}
                      onChange={(e) => setFilters({...filters, price_min: e.target.value ? parseInt(e.target.value) : null})}
                    >
                      <option value="">Qualquer preço</option>
                      <option value="10000">R$ 10.000</option>
                      <option value="15000">R$ 15.000</option>
                      <option value="20000">R$ 20.000</option>
                      <option value="25000">R$ 25.000</option>
                      <option value="30000">R$ 30.000</option>
                      <option value="35000">R$ 35.000</option>
                      <option value="40000">R$ 40.000</option>
                      <option value="45000">R$ 45.000</option>
                      <option value="50000">R$ 50.000</option>
                      <option value="60000">R$ 60.000</option>
                      <option value="70000">R$ 70.000</option>
                      <option value="80000">R$ 80.000</option>
                      <option value="90000">R$ 90.000</option>
                      <option value="100000">R$ 100.000</option>
                      <option value="120000">R$ 120.000</option>
                      <option value="140000">R$ 140.000</option>
                      <option value="160000">R$ 160.000</option>
                      <option value="180000">R$ 180.000</option>
                      <option value="200000">R$ 200.000</option>
                      <option value="250000">R$ 250.000</option>
                      <option value="300000">R$ 300.000</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Preço máximo</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      title='Preço máximo'
                      aria-label='Preço máximo'

                      value={filters.price_max || ''}
                      onChange={(e) => setFilters({...filters, price_max: e.target.value ? parseInt(e.target.value) : null})}
                    >
                      <option value="">Qualquer preço</option>
                      <option value="15000">R$ 15.000</option>
                      <option value="20000">R$ 20.000</option>
                      <option value="25000">R$ 25.000</option>
                      <option value="30000">R$ 30.000</option>
                      <option value="35000">R$ 35.000</option>
                      <option value="40000">R$ 40.000</option>
                      <option value="45000">R$ 45.000</option>
                      <option value="50000">R$ 50.000</option>
                      <option value="60000">R$ 60.000</option>
                      <option value="70000">R$ 70.000</option>
                      <option value="80000">R$ 80.000</option>
                      <option value="90000">R$ 90.000</option>
                      <option value="100000">R$ 100.000</option>
                      <option value="120000">R$ 120.000</option>
                      <option value="140000">R$ 140.000</option>
                      <option value="160000">R$ 160.000</option>
                      <option value="180000">R$ 180.000</option>
                      <option value="200000">R$ 200.000</option>
                      <option value="250000">R$ 250.000</option>
                      <option value="300000">R$ 300.000</option>
                      <option value="999999999">Acima de R$ 300.000</option>
                    </select>
                  </div>
                </div>
              </div> */}

              {/* Cidade */}
              {/* <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Cidade</h4>
                <div className="space-y-2">
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    title='Cidade'
                    aria-label='Cidade'

                    value={filters.city}
                    onChange={(e) => setFilters({...filters, city: e.target.value})}
                  >
                    <option value="">Todas as cidades</option>
                    {filterOptions.cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div> */}

              {/* Botões de Ação */}
              <div className="space-y-3" title='Botões de Ação' aria-label='Botões de Ação'>
                {activeFiltersCount > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-orange-800">
                        {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
                      </span>
                      <button
                        title='Limpar todos'
                        onClick={clearFilters}
                        className="text-xs text-orange-600 hover:text-orange-800 font-medium"
                      >
                        Limpar todos
                </button>
                    </div>
                  </div>
                )}

                <button
                  title='Limpar Filtros'
                  aria-label='Limpar Filtros'

                  className="w-full text-gray-600 hover:text-gray-800 transition-colors text-sm"
                  onClick={clearFilters}
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Lista de Veículos */}
          <div className="w-full md:w-3/4 lg:w-3/4">
            {/* Título Principal */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Comprar Carro
              </h1>
              <p className="text-gray-600">
                Encontre o veículo ideal entre nossa seleção de carros seminovos e usados
              </p>
            </div>

            {/* Header com controles */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
              <div className="flex flex-col gap-4">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-600 text-sm md:text-base">
                    Mostrando {startIndex}-{endIndex} de {totalVehicles} Veículos
                  </p>
                    {isSilentLoading && (
                      <div className="flex items-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-orange-500"></div>
                        <span className="text-xs text-gray-600">Atualizando...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Controles de exibição - Alinhados à direita */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:ml-auto">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Mostrar:</label>
                    <select
                        className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        title='Mostrar'
                        aria-label='Mostrar'

                      value={showPerPage}
                      onChange={(e) => setShowPerPage(parseInt(e.target.value))}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={40}>40</option>
                      <option value={50}>50</option>
                      <option value={60}>60</option>
                      <option value={70}>70</option>
                      <option value={80}>80</option>
                      <option value={90}>90</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Ordenar por:</label>
                    <select
                        className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        title='Ordenar por'
                        aria-label='Ordenar por'

                        value={filters.sort}
                        onChange={(e) => setFilters({...filters, sort: e.target.value})}
                    >
                      <option value="newest">Mais Recentes</option>
                        <option value="price">Preço</option>
                      <option value="year">Ano</option>
                      <option value="mileage">Quilometragem</option>
                        <option value="title">Nome</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600">Ordem:</label>
                      <select
                        className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        title='Ordem'
                        aria-label='Ordem'

                        value={filters.order}
                        onChange={(e) => setFilters({...filters, order: e.target.value as 'asc' | 'desc'})}
                      >
                        <option value="desc">Decrescente</option>
                        <option value="asc">Crescente</option>
                      </select>
                    </div>
                  </div>

                  {/* Botões de visualização - Ocultos no mobile, obrigatórios no desktop */}
                  <div className="hidden md:flex items-center justify-end gap-2">
                    <button
                      title='Visualizar em Grid'
                      aria-label='Visualizar em Grid'

                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      title='Visualizar em Lista'
                      aria-label='Visualizar em Lista'

                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Veículos */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 relative h-48 md:h-auto">
                        {vehicle.main_image ? (
                          <Image
                            src={vehicle.main_image}
                            alt={vehicle.title}
                            fill
                            className="object-cover"
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, 33vw"
                            quality={80}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-4xl">🚗</span>
                          </div>
                        )}

                        {/* Tags */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-500 text-white">
                            {getBrandName(vehicle.brand)}
                          </span>
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500 text-white">
                            Disponível
                          </span>
                        </div>
                      </div>

                      <div className="md:w-2/3 p-4 md:p-6">
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            {/* Location */}
                            <div className="flex items-center text-gray-600 text-sm mb-3">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                              </svg>
                              {vehicle.city || 'Localização'}
                            </div>

                            {/* Car Name */}
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                              {vehicle.title}
                            </h3>

                            {/* Rating */}
                            <div className="flex items-center mb-4">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className="text-lg">⭐</span>
                                ))}
                              </div>
                              <span className="ml-2 text-gray-600">(4.0) {Math.floor(Math.random() * 200) + 100} </span>
                            </div>

                            {/* Specifications */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4 mb-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <span className="mr-2">⚙️</span>
                                {vehicle.transmission || 'Automático'}
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">🛣️</span>
                                {vehicle.mileage ? `${vehicle.mileage} KM` : '10 KM'}
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">⛽</span>
                                {vehicle.fuel_type || 'Flex'}
                              </div>
                              <div className="flex items-center">
                                <span className="mr-2">📅</span>
                                {vehicle.year || '2024'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-orange-600">
                              {formatPrice(vehicle.price)} <span className="text-lg text-gray-600"></span>
                            </div>
                            <Link
                              href={generateVehicleUrl({
                                id: vehicle.id,
                                brand: getBrandName(vehicle.brand),
                                model: typeof vehicle.model === 'string' ? vehicle.model : vehicle.model?.name || '',
                                year: vehicle.year || undefined,
                                fuel_type: vehicle.fuel_type || undefined,
                                transmission: vehicle.transmission || undefined
                              })}
                              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                            >
                              Ver Detalhes
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    title='Anterior'
                    aria-label='Anterior'

                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      title='total'
                      aria-label='total'

                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === i + 1
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                  title='Próximo'
                  aria-label='Próximo'

                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Pesquisa Mobile - Formulário de Busca */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:hidden">
          <div className="bg-white w-full rounded-t-xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Pesquisar Veículos</h3>
              <button
                title='Fechar'
                aria-label='Fechar'

                onClick={() => setShowSearchModal(false)}
                className="text-gray-600 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 shadow-sm">
              <form onSubmit={(e) => { e.preventDefault(); setShowSearchModal(false); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                  <div className="relative">
                    <select
                      value={filters.brand_id || ''}
                      onChange={(e) => {
                        const brandId = e.target.value ? parseInt(e.target.value) : null
                        handleBrandChange(brandId)
                      }}
                      className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                    >
                      <option value="">Todas as Marcas</option>
                      {filterOptions.brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                  <div className="relative">
                    <select
                      value={filters.model_id || ''}
                      onChange={(e) => {
                        const modelId = e.target.value ? parseInt(e.target.value) : null
                        handleModelChange(modelId)
                      }}
                      disabled={!filters.brand_id || isLoadingModels}
                      className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none disabled:opacity-50"
                    >
                      <option value="">
                        {!filters.brand_id
                          ? 'Selecione uma marca primeiro'
                          : isLoadingModels
                            ? 'Carregando modelos...'
                            : 'Todos os modelos'
                        }
                      </option>
                      {filterOptions.models.map((model) => (
                        <option key={model.id} value={model.id}>{model.name}</option>
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
                      value={filters.year_min || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, year_min: e.target.value ? parseInt(e.target.value) : null }))}
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
                    <select
                      value={filters.vehicle_type}
                      onChange={(e) => setFilters(prev => ({ ...prev, vehicle_type: e.target.value }))}
                      className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                    >
                      <option value="">Todos os Tipos</option>
                      {filterOptions.vehicleTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
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
                title='Fechar'
                aria-label='Fechar'

                onClick={() => setShowFilterModal(false)}
                className="text-gray-600 hover:text-gray-700"
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
                  placeholder="Buscar veículo... (mín. 5 caracteres)"
                  className="w-full px-4 py-3 pl-10 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  title='Buscar'
                  aria-label='Buscar'

                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {filters.search.length > 0 && filters.search.length < 5 && (
                  <p className="text-xs text-gray-600 mt-2">
                    Digite pelo menos 5 caracteres para buscar
                  </p>
                )}
              </div>

              {/* Marca do Carro */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Marca do Carro</h4>
                <select
                  title='Marca do Carro'
                  aria-label='Marca do Carro'

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={filters.brand_id || ''}
                  onChange={(e) => {
                    const brandId = e.target.value ? parseInt(e.target.value) : null
                    handleBrandChange(brandId)
                  }}
                >
                  <option value="">Todas as marcas</option>
                  {filterOptions.brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              {/* Modelo do Carro */}
              {filters.brand_id && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Modelo do Carro</h4>
                  <select
                    title='Modelo do Carro'
                    aria-label='Modelo do Carro'

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={filters.model_id || ''}
                    disabled={isLoadingModels}
                    onChange={(e) => {
                      const modelId = e.target.value ? parseInt(e.target.value) : null
                      handleModelChange(modelId)
                    }}
                  >
                    <option value="">
                      {isLoadingModels ? 'Carregando modelos...' : 'Todos os modelos'}
                    </option>
                    {filterOptions.models.map((model) => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                  {isLoadingModels && (
                    <div className="flex items-center justify-center py-2 mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                      <span className="ml-2 text-sm text-gray-600">Carregando modelos...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tipo de Veículo */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Tipo de Veículo</h4>
                <select
                  title='Tipo de Veículo'
                  aria-label='Tipo de Veículo'

                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={filters.vehicle_type}
                  onChange={(e) => setFilters({...filters, vehicle_type: e.target.value})}
                >
                  <option value="">Todos os tipos</option>
                  {filterOptions.vehicleTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Preço */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">Preço</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Preço mínimo</label>
                    <select
                      title='Preço mínimo'
                      aria-label='Preço mínimo'

                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={filters.price_min || ''}
                      onChange={(e) => setFilters({...filters, price_min: e.target.value ? parseInt(e.target.value) : null})}
                    >
                      <option value="">Qualquer preço</option>
                      <option value="10000">R$ 10.000</option>
                      <option value="15000">R$ 15.000</option>
                      <option value="20000">R$ 20.000</option>
                      <option value="25000">R$ 25.000</option>
                      <option value="30000">R$ 30.000</option>
                      <option value="35000">R$ 35.000</option>
                      <option value="40000">R$ 40.000</option>
                      <option value="45000">R$ 45.000</option>
                      <option value="50000">R$ 50.000</option>
                      <option value="60000">R$ 60.000</option>
                      <option value="70000">R$ 70.000</option>
                      <option value="80000">R$ 80.000</option>
                      <option value="90000">R$ 90.000</option>
                      <option value="100000">R$ 100.000</option>
                      <option value="120000">R$ 120.000</option>
                      <option value="140000">R$ 140.000</option>
                      <option value="160000">R$ 160.000</option>
                      <option value="180000">R$ 180.000</option>
                      <option value="200000">R$ 200.000</option>
                      <option value="250000">R$ 250.000</option>
                      <option value="300000">R$ 300.000</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Preço máximo</label>
                    <select
                      title='Preço máximo'
                      aria-label='Preço máximo'

                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={filters.price_max || ''}
                      onChange={(e) => setFilters({...filters, price_max: e.target.value ? parseInt(e.target.value) : null})}
                    >
                      <option value="">Qualquer preço</option>
                      <option value="15000">R$ 15.000</option>
                      <option value="20000">R$ 20.000</option>
                      <option value="25000">R$ 25.000</option>
                      <option value="30000">R$ 30.000</option>
                      <option value="35000">R$ 35.000</option>
                      <option value="40000">R$ 40.000</option>
                      <option value="45000">R$ 45.000</option>
                      <option value="50000">R$ 50.000</option>
                      <option value="60000">R$ 60.000</option>
                      <option value="70000">R$ 70.000</option>
                      <option value="80000">R$ 80.000</option>
                      <option value="90000">R$ 90.000</option>
                      <option value="100000">R$ 100.000</option>
                      <option value="120000">R$ 120.000</option>
                      <option value="140000">R$ 140.000</option>
                      <option value="160000">R$ 160.000</option>
                      <option value="180000">R$ 180.000</option>
                      <option value="200000">R$ 200.000</option>
                      <option value="250000">R$ 250.000</option>
                      <option value="300000">R$ 300.000</option>
                      <option value="999999999">Acima de R$ 300.000</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3">
                {activeFiltersCount > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-orange-800">
                        {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
                      </span>
                      <button
                        title='Limpar todos'
                        aria-label='Limpar todos'

                        onClick={clearFilters}
                        className="text-xs text-orange-600 hover:text-orange-800 font-medium"
                      >
                        Limpar todos
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  title='Aplicar Filtros'
                  aria-label='Aplicar Filtros'

                  onClick={() => setShowFilterModal(false)}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function VehiclesPage() {
  return (
    <PortalLayout>
      <ErrorBoundary>
        <Suspense fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando veículos...</p>
            </div>
          </div>
        }>
          <VehiclesPageContent />
        </Suspense>
      </ErrorBoundary>
    </PortalLayout>
  )
}
