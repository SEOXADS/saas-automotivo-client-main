'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import { Globe, Plus, Edit, Trash2, Search } from 'lucide-react'
import { locationApiHelpers } from '@/lib/location-api'
import { Country, LocationFilters } from '@/types'

export default function CountriesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user} = useAuth()
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  })
  const [filters, setFilters] = useState<LocationFilters>({
    search: '',
    is_active: undefined,
    page: 1,
    per_page: 10
  })

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadCountries()
    }
  }, [isAuthenticated, authLoading, pagination.current_page, pagination.per_page, filters])

const loadCountries = async () => {
  setIsLoading(true)
  try {
    console.log('📡 Loading countries with filters:', {
      ...filters,
      page: pagination.current_page,
      per_page: pagination.per_page
    })

    // Log it to see what's available
    console.log('isAuthenticated:', isAuthenticated)
    console.log('User data:', user)
    console.log('Available user properties:', user ? Object.keys(user) : 'No user')

    const response = await locationApiHelpers.getTenantCountries(user) // <-- Pass user directly

    /*const response = await locationApiHelpers.getTenantCountries({
      ...filters,
      page: pagination.current_page,
      per_page: pagination.per_page
    })*/

    console.log('📦 API Response:', response)
    console.log('📦 response.data:', response?.data)
    const data = response.data;
    const data_data = data.data;
    console.log("datadata", data_data)
    console.log('📦 Is array?', Array.isArray(response?.data))
    console.log('📦 response type:', typeof response)
    
    // Debug the actual structure
    if (response && typeof response === 'object') {
      console.log('📦 response keys:', Object.keys(response))
    }

    // IMPORTANT: Ensure it's always an array
    const countriesArray = Array.isArray(response?.data?.data) 
      ? response.data.data 
      : []


    console.log('✅ Setting countries:', countriesArray)
    setCountries(countriesArray)
    
    setPagination({
      current_page: response?.current_page || 1,
      per_page: response?.per_page || 10,
      total: response?.total || 0,
      last_page: response?.last_page || 1
    })
  } catch (error) {
    console.error('❌ Erro ao carregar países:', error)
    // Set empty array on error
    setCountries([])
    setPagination(prev => ({ ...prev, total: 0 }))
  } finally {
    setIsLoading(false)
  }
}

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }))
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  const handleFilterChange = (key: keyof LocationFilters, value: string | boolean | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current_page: page }))
  }

  const handlePerPageChange = (newPerPage: number) => {
    setPagination(prev => ({ ...prev, per_page: newPerPage, current_page: 1 }))
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este país?')) {
      const success = await locationApiHelpers.deleteTenantCountry(id)
      if (success) {
        loadCountries()
      } else {
        alert('Erro ao excluir país')
      }
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Países" subtitle="Gerencie os países do sistema">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="bg-white h-12 rounded-lg mb-4"></div>
            <div className="bg-white h-64 rounded-lg"></div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Países" subtitle="Gerencie os países do sistema">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Países</h1>
          <Button
            onClick={() => router.push('/admin/locations/countries/create')}
            variant="primary"
            size="lg"
            icon={<Plus className="w-5 h-5" />}
          >
            Novo País
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nome ou código do país..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" style={{color: 'black'}}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.is_active === undefined ? '' : filters.is_active.toString()}
                onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" style={{color: 'black'}}
              >
                <option  value="">Todos</option>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Itens por página</label>
              <select
                value={pagination.per_page}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" style={{color: 'black'}}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  País
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moeda
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {countries.map((country) => (
                <tr key={country.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Globe className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{country.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {country.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {country.phone_code || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {country.currency || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      country.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {country.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => router.push(`/admin/locations/countries/${country.id}`)}
                        variant="outline"
                        size="sm"
                        icon={<Edit className="w-4 h-4" />}
                      >
                        Ver
                      </Button>
                      <Button
                        onClick={() => router.push(`/admin/locations/countries/${country.id}/edit`)}
                        variant="secondary"
                        size="sm"
                        icon={<Edit className="w-4 h-4" />}
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDelete(country.id)}
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4" />}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="mt-6">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            totalItems={pagination.total}
            perPage={pagination.per_page}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            showPerPageSelector={true}
          />
        </div>
      </div>
    </AdminLayout>
  )
}
