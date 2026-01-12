'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  Globe,
  MapPin,
  Building2,
  Home,
  Plus,
  Search,
  BarChart3,
  Map
} from 'lucide-react'
import Link from 'next/link'
import { locationApiHelpers } from '@/lib/location-api'

interface LocationStats {
  total_countries: number
  total_states: number
  total_cities: number
  total_neighborhoods: number
  countries_with_states: number
  states_with_cities: number
  cities_with_neighborhoods: number
}

export default function LocationsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [stats, setStats] = useState<LocationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    const loadStats = async () => {
      try {
        const statsData = await locationApiHelpers.getLocationStats()
        if (statsData) {
          setStats(statsData)
        } else {
          // Fallback para dados mock
          setStats({
            total_countries: 1,
            total_states: 27,
            total_cities: 5570,
            total_neighborhoods: 45000,
            countries_with_states: 1,
            states_with_cities: 27,
            cities_with_neighborhoods: 3500
          })
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
        // Fallback para dados mock
        setStats({
          total_countries: 1,
          total_states: 27,
          total_cities: 5570,
          total_neighborhoods: 45000,
          countries_with_states: 1,
          states_with_cities: 27,
          cities_with_neighborhoods: 3500
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [isAuthenticated, router])

  if (isLoading) {
    return (
      <AdminLayout title="Localizações" subtitle="Gerencie países, estados, cidades e bairros">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white h-32 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white h-48 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Localizações" subtitle="Gerencie países, estados, cidades e bairros">
      <div className="space-y-6">
        {/* Estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Globe className="h-6 w-6" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Países</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.total_countries || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Estados</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.total_states || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Cidades</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.total_cities || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <Home className="h-6 w-6" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Bairros</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.total_neighborhoods || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/locations/countries"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Globe className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Gerenciar Países</p>
                <p className="text-sm text-gray-500">Ver e editar países</p>
              </div>
            </Link>

            <Link
              href="/admin/locations/states"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MapPin className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Gerenciar Estados</p>
                <p className="text-sm text-gray-500">Ver e editar estados</p>
              </div>
            </Link>

            <Link
              href="/admin/locations/cities"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Building2 className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Gerenciar Cidades</p>
                <p className="text-sm text-gray-500">Ver e editar cidades</p>
              </div>
            </Link>

            <Link
              href="/admin/locations/neighborhoods"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Home className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Gerenciar Bairros</p>
                <p className="text-sm text-gray-500">Ver e editar bairros</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Estatísticas detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cobertura de Dados</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Países com Estados</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.countries_with_states || 0} / {stats?.total_countries || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${stats && stats.total_countries > 0
                      ? (stats.countries_with_states / stats.total_countries) * 100
                      : 0}%`
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estados com Cidades</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.states_with_cities || 0} / {stats?.total_states || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${stats && stats.total_states > 0
                      ? (stats.states_with_cities / stats.total_states) * 100
                      : 0}%`
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cidades com Bairros</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats?.cities_with_neighborhoods || 0} / {stats?.total_cities || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{
                    width: `${stats && stats.total_cities > 0
                      ? (stats.cities_with_neighborhoods / stats.total_cities) * 100
                      : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ferramentas</h3>
            <div className="space-y-4">
              <Link
                href="/admin/locations/import"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Importar Dados</p>
                  <p className="text-sm text-gray-500">Importar localizações em massa</p>
                </div>
              </Link>

              <Link
                href="/admin/locations/export"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Exportar Dados</p>
                  <p className="text-sm text-gray-500">Exportar localizações</p>
                </div>
              </Link>

              <Link
                href="/admin/locations/search"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Search className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Buscar Localização</p>
                  <p className="text-sm text-gray-500">Buscar por CEP ou endereço</p>
                </div>
              </Link>

              <Link
                href="/admin/locations/map"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Map className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Visualizar Mapa</p>
                  <p className="text-sm text-gray-500">Ver localizações no mapa</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
