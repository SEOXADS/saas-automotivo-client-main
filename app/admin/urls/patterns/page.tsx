'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { Plus, Eye, Edit, Trash2, AlertCircle } from 'lucide-react'
import { UrlPattern } from '@/types/url'

// Dados mockados para desenvolvimento
const MOCK_PATTERNS: UrlPattern[] = [
  {
    id: 1,
    pattern: '/comprar-carro/{vehicle_id}-{slug-do-carro}',
    generated_url: '/comprar-carro/123-honda-civic-2023',
    status: 'active',
    is_active: true,
    priority: 1,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    pattern: '/{slug-da-marca}/{vehicle_id}-{slug-do-carro}',
    generated_url: '/honda/456-civic-2023',
    status: 'active',
    is_active: true,
    priority: 2,
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z'
  },
  {
    id: 3,
    pattern: '/comprar-carro/{vehicle_id}-{slug-do-carro}/{cidade-uf}',
    generated_url: '/comprar-carro/789-honda-civic-2023/sao-paulo-sp',
    status: 'inactive',
    is_active: false,
    priority: 3,
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T10:00:00Z'
  }
]

export default function UrlPatternsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [patterns, setPatterns] = useState<UrlPattern[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    loadPatterns()
  }, [isAuthenticated, router, searchTerm, statusFilter, currentPage])

  const loadPatterns = async () => {
    setIsLoading(true)
    setApiError(null)

    try {
      // Tentar carregar da API real primeiro
      const { urlApiHelpers } = await import('@/lib/url-api')
      const result = await urlApiHelpers.getTenantUrlPatterns({
        search: searchTerm || undefined,
        is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
        page: currentPage
      })

      if (result.data.length > 0) {
        setPatterns(result.data)
        setTotalPages(result.last_page)
      } else {
        // Se não há dados reais, usar dados mockados
        loadMockData()
      }
    } catch (error) {
      console.error('Erro ao carregar patterns:', error)
      setApiError('Endpoint não disponível no backend')
      // Carregar dados mockados em caso de erro
      loadMockData()
    } finally {
      setIsLoading(false)
    }
  }

  const loadMockData = () => {
    // Simular delay da API
    setTimeout(() => {
      let filteredPatterns = MOCK_PATTERNS

      if (searchTerm) {
        filteredPatterns = filteredPatterns.filter(pattern =>
          pattern.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pattern.generated_url.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      if (statusFilter !== 'all') {
        filteredPatterns = filteredPatterns.filter(pattern =>
          statusFilter === 'active' ? pattern.is_active : !pattern.is_active
        )
      }

      setPatterns(filteredPatterns)
      setTotalPages(Math.ceil(filteredPatterns.length / 10))
      setIsLoading(false)
    }, 500)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este pattern de URL?')) return

    // Simular exclusão
    setPatterns(prev => prev.filter(pattern => pattern.id !== id))
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Ativo' : 'Inativo'
  }

  if (isLoading) {
    return (
      <AdminLayout title="Patterns de URL" subtitle="Gerencie os patterns de URL personalizados">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando patterns...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Patterns de URL" subtitle="Gerencie os patterns de URL personalizados">
      <div className="p-6">
        {/* Aviso de desenvolvimento */}
        {apiError && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Endpoint não disponível
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    O endpoint <code>/api/tenant/urls/patterns</code> ainda não foi implementado no backend.
                    Exibindo dados de demonstração.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patterns de URL</h1>
            <p className="text-gray-600">Gerencie os patterns de URL personalizados</p>
          </div>
          <Button
            onClick={() => router.push('/admin/urls/patterns/create')}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Criar Pattern
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por pattern ou URL..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={loadPatterns}
                variant="outline"
                className="w-full"
              >
                Filtrar
              </Button>
            </div>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {patterns.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum pattern encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando seu primeiro pattern de URL.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  onClick={() => router.push('/admin/urls/patterns/create')}
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Criar Primeiro Pattern
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pattern
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL Gerada
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridade
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
                  {patterns.map((pattern) => (
                    <tr key={pattern.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {pattern.pattern}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {pattern.generated_url}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pattern.priority}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pattern.is_active)}`}>
                          {getStatusLabel(pattern.is_active)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(pattern.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            onClick={() => router.push(`/admin/urls/patterns/${pattern.id}`)}
                            variant="outline"
                            size="sm"
                            icon={<Eye className="w-3 h-3" />}
                          >
                            Ver
                          </Button>
                          <Button
                            onClick={() => router.push(`/admin/urls/patterns/${pattern.id}/edit`)}
                            variant="outline"
                            size="sm"
                            icon={<Edit className="w-3 h-3" />}
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDelete(pattern.id)}
                            variant="outline"
                            size="sm"
                            icon={<Trash2 className="w-3 h-3" />}
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
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                variant="outline"
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                variant="outline"
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
