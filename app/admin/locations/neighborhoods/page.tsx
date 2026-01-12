'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { Home, Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react'
import { locationApiHelpers } from '@/lib/location-api'
import { Neighborhood, LocationFilters } from '@/types'

function NeighborhoodsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  })
  const [filters, setFilters] = useState<LocationFilters>({
    search: searchParams.get('search') || '',
    is_active: undefined,
    city_id: searchParams.get('city_id') ? parseInt(searchParams.get('city_id')!) : undefined,
    page: 1,
    per_page: 10
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadNeighborhoods()
    }
  }, [isAuthenticated, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadNeighborhoods = async () => {
    setIsLoading(true)
    try {
      const response = await locationApiHelpers.getTenantNeighborhoods(filters)
      setNeighborhoods(response.data || [])
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
        from: response.from,
        to: response.to
      })
    } catch (error) {
      console.error('Erro ao carregar bairros:', error)
      setNeighborhoods([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (field: keyof LocationFilters, value: string | boolean | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filtering
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleDelete = async (neighborhoodId: number, neighborhoodName: string) => {
    const confirmed = confirm(`Tem certeza que deseja excluir o bairro "${neighborhoodName}"?`)
    if (!confirmed) return

    setIsDeleting(neighborhoodId)

    try {
      const success = await locationApiHelpers.deleteTenantNeighborhood(neighborhoodId)
      if (success) {
        alert('Bairro excluído com sucesso!')
        loadNeighborhoods() // Reload the list
      } else {
        alert('Erro ao excluir bairro')
      }
    } catch (error) {
      console.error('Erro ao excluir bairro:', error)
      alert('Erro ao excluir bairro')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadNeighborhoods()
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  return (
    <AdminLayout title="Bairros" subtitle="Gerenciar bairros do tenant">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Home className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Bairros</h1>
          </div>
          <Button
            onClick={() => router.push('/admin/locations/neighborhoods/create')}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Adicionar Bairros
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                id="search"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Nome do bairro ou CEP..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="is_active"
                value={filters.is_active === undefined ? '' : filters.is_active.toString()}
                onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>

            <div>
              <label htmlFor="per_page" className="block text-sm font-medium text-gray-700 mb-2">
                Por página
              </label>
              <select
                id="per_page"
                value={filters.per_page || 10}
                onChange={(e) => handleFilterChange('per_page', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                variant="outline"
                icon={<Search className="w-4 h-4" />}
                className="w-full"
              >
                Buscar
              </Button>
            </div>
          </form>
        </div>

        {/* Lista de Bairros */}
        <div className="bg-white rounded-xl shadow-sm">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : neighborhoods.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum bairro encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.is_active !== undefined
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando bairros ao seu tenant'
                }
              </p>
              <Button
                onClick={() => router.push('/admin/locations/neighborhoods/create')}
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
              >
                Adicionar Bairros
              </Button>
            </div>
          ) : (
            <>
              {/* Cabeçalho da tabela */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Mostrando {pagination.from} a {pagination.to} de {pagination.total} bairros
                  </p>
                </div>
              </div>

              {/* Tabela */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bairro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cidade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CEP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criado em
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {neighborhoods.map((neighborhood) => (
                      <tr key={neighborhood.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{neighborhood.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {neighborhood.city?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {neighborhood.zip_code || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            neighborhood.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {neighborhood.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(neighborhood.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              onClick={() => router.push(`/admin/locations/neighborhoods/${neighborhood.id}`)}
                              variant="outline"
                              size="sm"
                              icon={<Eye className="w-4 h-4" />}
                            >
                              Ver
                            </Button>
                            <Button
                              onClick={() => router.push(`/admin/locations/neighborhoods/${neighborhood.id}/edit`)}
                              variant="outline"
                              size="sm"
                              icon={<Edit className="w-4 h-4" />}
                            >
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleDelete(neighborhood.id, neighborhood.name)}
                              variant="outline"
                              size="sm"
                              icon={<Trash2 className="w-4 h-4" />}
                              disabled={isDeleting === neighborhood.id}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              {isDeleting === neighborhood.id ? 'Excluindo...' : 'Excluir'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {pagination.last_page > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <Button
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page <= 1}
                        variant="outline"
                        size="sm"
                      >
                        Anterior
                      </Button>
                      <Button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page >= pagination.last_page}
                        variant="outline"
                        size="sm"
                      >
                        Próximo
                      </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Página <span className="font-medium">{pagination.current_page}</span> de{' '}
                          <span className="font-medium">{pagination.last_page}</span>
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            variant={page === pagination.current_page ? "primary" : "outline"}
                            size="sm"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default function NeighborhoodsPage() {
  return (
    <Suspense fallback={
      <AdminLayout title="Bairros" subtitle="Gerencie os bairros do sistema">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando...</div>
          </div>
        </div>
      </AdminLayout>
    }>
      <NeighborhoodsPageContent />
    </Suspense>
  )
}
