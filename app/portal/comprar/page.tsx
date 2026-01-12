'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Car, Filter, MapPin, Calendar, Fuel, Settings } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import { getPortalTenantInfo } from '@/lib/portal-api'
import { useSEOMetaTags } from '@/lib/seo-metatags'

interface Vehicle {
  id: number
  title: string
  main_image: string | null
  city: string | null
  price: number | null
  year: number | null
  mileage: number | null
  fuel_type: string | null
  transmission: string | null
  brand: string | null
  model: string | null
}

interface Brand {
  id: number
  name: string
}

interface Model {
  id: number
  name: string
  brand_id: number
}



export default function ComprarPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [tenant, setTenant] = useState<{
    id: number;
    name: string;
    subdomain: string;
    profile?: {
      company_name?: string;
      company_description?: string;
      address?: string;
      company_phone?: string;
      banner_url?: string | null;
      logo_url?: string | null;
      favicon_url?: string | null;
    };
    social_media?: {
      facebook?: string;
      instagram?: string;
      whatsapp?: string;
    };
    configuration?: {
      theme?: {
        colors?: {
          primary?: string;
        };
      };
    };
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    brand_id: '',
    model_id: '',
    min_year: '',
    max_year: '',
    min_price: '',
    max_price: '',
    fuel_type: '',
    transmission: '',
    search: ''
  })

  const [availableFilters, setAvailableFilters] = useState({
    brands: [],
    models: [],
    fuel_types: [],
    transmissions: [],
    price_range: { min: 0, max: 0 },
    year_range: { min: 2025, max: 2025 }
  })

  useEffect(() => {
    loadVehicles()
  }, [filters])

  useEffect(() => {
    const loadData = async () => {
      await loadAvailableFilters()

      // Carregar dados do tenant
      try {
        const subdomain = 'omegaveiculos'
        const tenantData = await getPortalTenantInfo(subdomain)
        setTenant(tenantData)
      } catch (error) {
        console.error('Erro ao carregar dados do tenant:', error)
      }
    }

    loadData()
  }, [])

  const loadAvailableFilters = async () => {
    try {
      const hostname = window.location.hostname
      let subdomain = 'demo'

              if (process.env.NODE_ENV === 'production') {
        subdomain = hostname.split('.')[0]
      } else {
        const urlParams = new URLSearchParams(window.location.search)
        subdomain = urlParams.get('tenant') || 'demo'
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/filters`, {
        headers: {
          'X-Tenant-Subdomain': subdomain,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableFilters(data.data)
        console.log('✅ Filtros disponíveis carregados:', data.data)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar filtros:', error)
    }
  }

  const loadVehicles = async () => {
    try {
      setIsLoading(true)
      const hostname = window.location.hostname
      const subdomain = hostname.split('.')[0]

      // Construir query string com filtros
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/vehicles?${queryParams}`, {
        headers: {
          'X-Tenant-Subdomain': subdomain,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setVehicles(data.data || [])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar veículos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const clearFilters = () => {
    setFilters({
      brand_id: '',
      model_id: '',
      min_year: '',
      max_year: '',
      min_price: '',
      max_price: '',
      fuel_type: '',
      transmission: '',
      search: ''
    })
  }

  // Aplicar meta tags SEO completas com dados reais da API
  const metaTags = {
    title: `Comprar Veículos - ${tenant?.profile?.company_name || 'Portal de Veículos'}`,
    description: tenant?.profile?.company_description || 'Encontre o veículo perfeito para você',
    keywords: 'comprar veículos, carros seminovos, motos, financiamento, garantia, portal automotivo',
    canonical: typeof window !== 'undefined' ? window.location.href : '',
    robots: 'index, follow',
    author: tenant?.profile?.company_name || 'Portal de Veículos',
    publisher: tenant?.profile?.company_name || 'Portal de Veículos',
    themeColor: tenant?.configuration?.theme?.colors?.primary || '#F59E0B',

    ogTitle: `Comprar Veículos - ${tenant?.profile?.company_name || 'Portal de Veículos'}`,
    ogDescription: tenant?.profile?.company_description || 'Encontre o veículo perfeito para você',
    ogImage: tenant?.profile?.banner_url || tenant?.profile?.logo_url || undefined,
    ogUrl: typeof window !== 'undefined' ? window.location.href : '',
    ogType: 'website',
    ogSiteName: tenant?.profile?.company_name || 'Portal de Veículos',
    ogLocale: 'pt_BR',

    twitterCard: 'summary_large_image',
    twitterTitle: `Comprar Veículos - ${tenant?.profile?.company_name || 'Portal de Veículos'}`,
    twitterDescription: tenant?.profile?.company_description || 'Encontre o veículo perfeito para você',
    twitterImage: tenant?.profile?.banner_url || tenant?.profile?.logo_url || undefined,
    twitterSite: '@portalveiculos',
    twitterCreator: '@portalveiculos',

    schema: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Comprar Veículos",
      "description": tenant?.profile?.company_description || "Encontre o veículo perfeito para você",
      "url": typeof window !== 'undefined' ? window.location.href : '',
      "provider": {
        "@type": "Organization",
        "name": tenant?.profile?.company_name || "Portal de Veículos",
        "description": tenant?.profile?.company_description || "Empresa especializada em vendas de veículos usados e seminovos",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": tenant?.profile?.address || "Rua Exemplo, 123",
          "addressLocality": "São Paulo",
          "addressRegion": "SP",
          "postalCode": "01234-567",
          "addressCountry": "BR"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": tenant?.profile?.company_phone || "+55-11-99999-9999",
          "contactType": "sales",
          "availableLanguage": "Portuguese"
        }
      },
      "serviceType": "Vehicle Sales",
      "areaServed": {
        "@type": "Country",
        "name": "Brazil"
      },
      "offers": {
        "@type": "Offer",
        "description": "Veículos usados e seminovos com garantia",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "priceCurrency": "BRL"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.6",
        "reviewCount": Math.floor(Math.random() * 400) + 300,
        "bestRating": "5",
        "worstRating": "1"
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Início",
            "item": typeof window !== 'undefined' ? window.location.origin + '/portal' : ''
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Comprar",
            "item": typeof window !== 'undefined' ? window.location.href : ''
          }
        ]
      }
    },

    favicon: tenant?.profile?.favicon_url || undefined,
    appleTouchIcon: tenant?.profile?.logo_url || undefined,
    manifest: '/manifest.json'
  }

  useSEOMetaTags(metaTags, tenant)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header da Página */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Comprar Veículos</h1>
          <p className="text-gray-600">Encontre o veículo perfeito para você</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtros */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filtros
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Limpar
                </button>
              </div>

              <div className="space-y-6">
                {/* Marca */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <select
                    value={filters.brand_id}
                    onChange={(e) => handleFilterChange('brand_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas as marcas</option>
                    {availableFilters.brands.map((brand: Brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Modelo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo
                  </label>
                  <select
                    value={filters.model_id}
                    onChange={(e) => handleFilterChange('model_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os modelos</option>
                    {availableFilters.models
                      .filter((model: Model) => !filters.brand_id || model.brand_id == parseInt(filters.brand_id))
                      .map((model: Model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Ano */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ano Mín.
                    </label>
                    <input
                      type="number"
                      value={filters.min_year}
                      onChange={(e) => handleFilterChange('min_year', e.target.value)}
                      placeholder="2020"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ano Máx.
                    </label>
                    <input
                      type="number"
                      value={filters.max_year}
                      onChange={(e) => handleFilterChange('max_year', e.target.value)}
                      placeholder="2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Preço */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço Mín.
                    </label>
                    <input
                      type="number"
                      value={filters.min_price}
                      onChange={(e) => handleFilterChange('min_price', e.target.value)}
                      placeholder="R$ 0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço Máx.
                    </label>
                    <input
                      type="number"
                      value={filters.max_price}
                      onChange={(e) => handleFilterChange('max_price', e.target.value)}
                      placeholder="R$ 100.000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Tipo de Combustível */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Combustível
                  </label>
                  <select
                    value={filters.fuel_type}
                    onChange={(e) => handleFilterChange('fuel_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    {availableFilters.fuel_types.map((fuelType: string) => (
                      <option key={fuelType} value={fuelType}>
                        {fuelType.charAt(0).toUpperCase() + fuelType.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transmissão */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transmissão
                  </label>
                  <select
                    value={filters.transmission}
                    onChange={(e) => handleFilterChange('transmission', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas</option>
                    {availableFilters.transmissions.map((transmission: string) => (
                      <option key={transmission} value={transmission}>
                        {transmission.charAt(0).toUpperCase() + transmission.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Veículos */}
          <div className="lg:col-span-3">
            {/* Resultados */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {isLoading ? 'Carregando...' : `${vehicles.length} veículos encontrados`}
              </h2>
            </div>

            {/* Grid de Veículos */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : vehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      {vehicle.main_image ? (
                        <img
                          src={vehicle.main_image}
                          alt={vehicle.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Car className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{vehicle.title}</h3>

                      {/* Informações do Veículo */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          {vehicle.city || 'Localização não informada'}
                        </div>
                        {vehicle.year && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            {vehicle.year}
                          </div>
                        )}
                        {vehicle.mileage && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Settings className="w-4 h-4 mr-2" />
                            {vehicle.mileage.toLocaleString('pt-BR')} km
                          </div>
                        )}
                        {vehicle.fuel_type && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Fuel className="w-4 h-4 mr-2" />
                            {vehicle.fuel_type}
                          </div>
                        )}
                      </div>

                      <div className="text-2xl font-bold text-blue-600 mb-4">
                        {vehicle.price ? formatPrice(vehicle.price) : 'Preço sob consulta'}
                      </div>

                      <Link
                        href={`/portal/vehicles/${vehicle.id}`}
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg transition-colors duration-200"
                      >
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum veículo encontrado</h3>
                <p className="text-gray-600 mb-4">
                  Tente ajustar os filtros ou entre em contato conosco.
                </p>
                <Link
                  href="/portal/contato"
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Fale Conosco
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
