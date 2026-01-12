'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { ArrowRight, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'
import { urlApiHelpers } from '@/lib/url-api'
import { UrlRedirect, UrlFilters } from '@/types/url'

function UrlRedirectsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [redirects, setRedirects] = useState<UrlRedirect[]>([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  })
  const [filters, setFilters] = useState<UrlFilters>({
    search: searchParams.get('search') || '',
    is_active: undefined,
    page: 1,
    per_page: 10
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadRedirects()
    }
  }, [isAuthenticated, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadRedirects = async () => {
    setIsLoading(true)
    try {
      const response = await urlApiHelpers.getTenantUrlRedirects(filters)
      setRedirects(response.data || [])
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
        from: response.from,
        to: response.to
      })
    } catch (error) {
      console.error('Erro ao carregar redirects:', error)
      setRedirects([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }))
  }

  const handleFilterChange = (key: keyof UrlFilters, value: string | boolean | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handlePerPageChange = (newPerPage: number) => {
    setFilters(prev => ({ ...prev, per_page: newPerPage, page: 1 }))
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este redirect?')) return

    setIsDeleting(id)
    try {
      const success = await urlApiHelpers.deleteTenantUrlRedirect(id)
      if (success) {
        loadRedirects()
      } else {
        alert('Erro ao excluir redirect')
      }
    } catch (error) {
      console.error('Erro ao excluir redirect:', error)
      alert('Erro ao excluir redirect')
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusColor = (statusCode: number) => {
    switch (statusCode) {
      case 301:
        return 'bg-blue-100 text-blue-800'
      case 302:
        return 'bg-green-100 text-green-800'
      case 307:
        return 'bg-yellow-100 text-yellow-800'
      case 308:
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Redirects de URL" subtitle="Gerencie os redirects de URL">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando redirects...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Redirects de URL" subtitle="Gerencie os redirects de URL">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Redirects de URL</h1>
            <p className="text-gray-600">Gerencie os redirects de URL do seu site</p>
          </div>
          <Button
            onClick={() => router.push('/admin/urls/redirects/create')}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Novo Redirect
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por path antigo ou novo..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.is_active === undefined ? '' : filters.is_active ? 'true' : 'false'}
                onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os status</option>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Por página
              </label>
              <select
                value={filters.per_page || 10}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {redirects.length === 0 ? (
            <div className="p-8 text-center">
              <ArrowRight className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum redirect encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                {filters.search || filters.is_active !== undefined
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando seu primeiro redirect de URL.'}
              </p>
              {!filters.search && filters.is_active === undefined && (
                <Button
                  onClick={() => router.push('/admin/urls/redirects/create')}
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Criar Primeiro Redirect
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Path Antigo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Path Novo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
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
                    {redirects.map((redirect) => (
                      <tr key={redirect.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {redirect.old_path}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {redirect.new_path}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(redirect.status_code)}`}>
                            {redirect.status_code}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            redirect.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {redirect.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(redirect.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => router.push(`/admin/urls/redirects/${redirect.id}`)}
                              variant="outline"
                              size="sm"
                              icon={<Eye className="w-4 h-4" />}
                            >
                              Ver
                            </Button>
                            <Button
                              onClick={() => router.push(`/admin/urls/redirects/${redirect.id}/edit`)}
                              variant="outline"
                              size="sm"
                              icon={<Edit className="w-4 h-4" />}
                            >
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleDelete(redirect.id)}
                              variant="outline"
                              size="sm"
                              icon={<Trash2 className="w-4 h-4" />}
                              disabled={isDeleting === redirect.id}
                            >
                              {isDeleting === redirect.id ? 'Excluindo...' : 'Excluir'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Mostrando {pagination.from} a {pagination.to} de {pagination.total} resultados
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        variant="outline"
                        size="sm"
                        disabled={pagination.current_page === 1}
                      >
                        Anterior
                      </Button>
                      <span className="px-3 py-1 text-sm text-gray-700">
                        Página {pagination.current_page} de {pagination.last_page}
                      </span>
                      <Button
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        variant="outline"
                        size="sm"
                        disabled={pagination.current_page === pagination.last_page}
                      >
                        Próxima
                      </Button>
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

export default function UrlRedirectsPage() {
  return (
    <Suspense fallback={
      <AdminLayout title="Redirects de URL" subtitle="Gerencie os redirects de URL">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando...</div>
          </div>
        </div>
      </AdminLayout>
    }>
      <UrlRedirectsPageContent />
    </Suspense>
  )
}
