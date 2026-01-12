'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { FileText, Plus, Search, Eye, Edit, Trash2, Download, RefreshCw } from 'lucide-react'
import { sitemapApiHelpers } from '@/lib/sitemap-api'
import { SitemapConfig, SitemapFilters } from '@/types/sitemap'

function SitemapConfigsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [configs, setConfigs] = useState<SitemapConfig[]>([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  })
  const [filters, setFilters] = useState<SitemapFilters>({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    is_active: undefined,
    page: 1,
    per_page: 10
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadConfigs()
    }
  }, [isAuthenticated, filters]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadConfigs = async () => {
    setIsLoading(true)
    try {
      const response = await sitemapApiHelpers.getTenantSitemapConfigs(filters)
      setConfigs(response.data || [])
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
        from: response.from,
        to: response.to
      })
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      setConfigs([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }))
  }

  const handleFilterChange = (key: keyof SitemapFilters, value: string | boolean | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handlePerPageChange = (newPerPage: number) => {
    setFilters(prev => ({ ...prev, per_page: newPerPage, page: 1 }))
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração de sitemap?')) return

    setIsDeleting(id)
    try {
      const success = await sitemapApiHelpers.deleteTenantSitemapConfig(id)
      if (success) {
        loadConfigs()
      } else {
        alert('Erro ao excluir configuração')
      }
    } catch (error) {
      console.error('Erro ao excluir configuração:', error)
      alert('Erro ao excluir configuração')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleGenerateSitemap = async (type?: string) => {
    setIsGenerating(true)
    try {
      const result = await sitemapApiHelpers.generateSitemap(type)
      if (result.success) {
        alert(`Sitemap gerado com sucesso! ${result.url ? `Disponível em: ${result.url}` : ''}`)
        loadConfigs()
      } else {
        alert(`Erro ao gerar sitemap: ${result.message}`)
      }
    } catch (error) {
      console.error('Erro ao gerar sitemap:', error)
      alert('Erro ao gerar sitemap')
    } finally {
      setIsGenerating(false)
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'index': 'Índice',
      'images': 'Imagens',
      'videos': 'Vídeos',
      'articles': 'Artigos',
      'vehicles': 'Veículos',
      'pages': 'Páginas'
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'index': 'bg-blue-100 text-blue-800',
      'images': 'bg-green-100 text-green-800',
      'videos': 'bg-purple-100 text-purple-800',
      'articles': 'bg-orange-100 text-orange-800',
      'vehicles': 'bg-red-100 text-red-800',
      'pages': 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <AdminLayout title="Configurações de Sitemap" subtitle="Gerencie as configurações de sitemap">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando configurações...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Configurações de Sitemap" subtitle="Gerencie as configurações de sitemap">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações de Sitemap</h1>
            <p className="text-gray-600">Gerencie as configurações de sitemap do seu site</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => handleGenerateSitemap()}
              variant="outline"
              icon={<RefreshCw className="w-4 h-4" />}
              disabled={isGenerating}
            >
              {isGenerating ? 'Gerando...' : 'Gerar Sitemap'}
            </Button>
            <Button
              onClick={() => router.push('/admin/sitemap/configs/create')}
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
            >
              Nova Configuração
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou URL..."
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os tipos</option>
                <option value="index">Índice</option>
                <option value="images">Imagens</option>
                <option value="videos">Vídeos</option>
                <option value="articles">Artigos</option>
                <option value="vehicles">Veículos</option>
                <option value="pages">Páginas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.is_active ? 'true' : filters.is_active === false ? 'false' : ''}
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
          {configs.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma configuração encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                {filters.search || filters.type || filters.is_active !== undefined
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando sua primeira configuração de sitemap.'}
              </p>
              {!filters.search && !filters.type && filters.is_active === undefined && (
                <Button
                  onClick={() => router.push('/admin/sitemap/configs/create')}
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Criar Primeira Configuração
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
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioridade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frequência
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modificado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {configs.map((config) => (
                      <tr key={config.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {config.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(config.type)}`}>
                            {getTypeLabel(config.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {config.url}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {config.priority}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">
                            {config.change_frequency}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            config.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {config.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(config.last_modified).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => handleGenerateSitemap(config.type)}
                              variant="outline"
                              size="sm"
                              icon={<Download className="w-4 h-4" />}
                              disabled={isGenerating}
                            >
                              Gerar
                            </Button>
                            <Button
                              onClick={() => router.push(`/admin/sitemap/configs/${config.id}`)}
                              variant="outline"
                              size="sm"
                              icon={<Eye className="w-4 h-4" />}
                            >
                              Ver
                            </Button>
                            <Button
                              onClick={() => router.push(`/admin/sitemap/configs/${config.id}/edit`)}
                              variant="outline"
                              size="sm"
                              icon={<Edit className="w-4 h-4" />}
                            >
                              Editar
                            </Button>
                            <Button
                              onClick={() => handleDelete(config.id)}
                              variant="outline"
                              size="sm"
                              icon={<Trash2 className="w-4 h-4" />}
                              disabled={isDeleting === config.id}
                            >
                              {isDeleting === config.id ? 'Excluindo...' : 'Excluir'}
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

export default function SitemapConfigsPage() {
  return (
    <Suspense fallback={
      <AdminLayout title="Configurações de Sitemap" subtitle="Gerencie as configurações de sitemap">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando...</div>
          </div>
        </div>
      </AdminLayout>
    }>
      <SitemapConfigsPageContent />
    </Suspense>
  )
}
