'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { ArrowLeft, Edit, Trash2, RefreshCw } from 'lucide-react'
import { sitemapApiHelpers } from '@/lib/sitemap-api'
import { SitemapConfig } from '@/types/sitemap'

export default function SitemapConfigPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [config, setConfig] = useState<SitemapConfig | null>(null)
  const [error, setError] = useState<string | null>(null)

  const configId = params.id ? Number(params.id) : null

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    if (configId) {
      loadConfig()
    }
  }, [isAuthenticated, router, configId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadConfig = async () => {
    if (!configId) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await sitemapApiHelpers.getTenantSitemapConfig(configId)
      if (result) {
        setConfig(result)
      } else {
        setError('Configuração não encontrada')
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      setError('Erro ao carregar configuração')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!config) return

    if (!confirm(`Tem certeza que deseja excluir a configuração "${config.name}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const success = await sitemapApiHelpers.deleteTenantSitemapConfig(config.id)
      if (success) {
        alert('Configuração excluída com sucesso!')
        router.push('/admin/sitemap/configs')
      } else {
        alert('Erro ao excluir configuração')
      }
    } catch (error) {
      console.error('Erro ao excluir configuração:', error)
      alert('Erro ao excluir configuração')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleGenerateSitemap = async () => {
    if (!config) return

    try {
      const result = await sitemapApiHelpers.generateSitemap(config.type)
      if (result.success) {
        alert(`Sitemap gerado com sucesso! ${result.url ? `Disponível em: ${result.url}` : ''}`)
      } else {
        alert(`Erro ao gerar sitemap: ${result.message}`)
      }
    } catch (error) {
      console.error('Erro ao gerar sitemap:', error)
      alert('Erro ao gerar sitemap')
    }
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      index: 'Índice',
      images: 'Imagens',
      videos: 'Vídeos',
      articles: 'Artigos',
      vehicles: 'Veículos',
      pages: 'Páginas'
    }
    return types[type] || type
  }

  const getFrequencyLabel = (frequency: string) => {
    const frequencies: Record<string, string> = {
      always: 'Sempre',
      hourly: 'Por hora',
      daily: 'Diariamente',
      weekly: 'Semanalmente',
      monthly: 'Mensalmente',
      yearly: 'Anualmente',
      never: 'Nunca'
    }
    return frequencies[frequency] || frequency
  }

  if (isLoading) {
    return (
      <AdminLayout title="Configuração de Sitemap" subtitle="Visualizar configuração de sitemap">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando configuração...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !config) {
    return (
      <AdminLayout title="Configuração de Sitemap" subtitle="Erro ao carregar configuração">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Configuração não encontrada'}
            </h3>
            <p className="text-gray-600 mb-4">
              A configuração solicitada não foi encontrada ou ocorreu um erro ao carregá-la.
            </p>
            <Button
              onClick={() => router.push('/admin/sitemap/configs')}
              variant="primary"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Voltar para Lista
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Configuração de Sitemap" subtitle={`Visualizar: ${config.name}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{config.name}</h1>
              <p className="text-gray-600">Configuração de sitemap</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleGenerateSitemap}
              variant="outline"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Gerar Sitemap
            </Button>
            <Button
              onClick={() => router.push(`/admin/sitemap/configs/${config.id}/edit`)}
              variant="primary"
              icon={<Edit className="w-4 h-4" />}
            >
              Editar
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>

        {/* Informações da Configuração */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações Básicas
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <p className="text-sm text-gray-900">{config.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <p className="text-sm text-gray-900">{getTypeLabel(config.type)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <p className="text-sm text-gray-900 break-all">{config.url}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  config.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {config.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Configurações SEO
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <p className="text-sm text-gray-900">{config.priority}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequência de Mudança
                </label>
                <p className="text-sm text-gray-900">{getFrequencyLabel(config.change_frequency)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Criado em
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(config.created_at).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(config.created_at).toLocaleTimeString('pt-BR')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atualizado em
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(config.updated_at).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(config.updated_at).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações sobre o tipo de sitemap */}
        <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Sobre {getTypeLabel(config.type)}:
          </h3>
          <div className="text-xs text-blue-800">
            {config.type === 'index' && (
              <p>Sitemap principal que referencia outros sitemaps específicos.</p>
            )}
            {config.type === 'images' && (
              <p>Sitemap específico para imagens com metadados como alt text, caption e localização geográfica.</p>
            )}
            {config.type === 'videos' && (
              <p>Sitemap específico para vídeos com informações detalhadas como duração, categoria e thumbnail.</p>
            )}
            {config.type === 'articles' && (
              <p>Sitemap para conteúdo textual, artigos e posts do blog.</p>
            )}
            {config.type === 'vehicles' && (
              <p>Sitemap específico para veículos com informações como marca, modelo, ano e localização.</p>
            )}
            {config.type === 'pages' && (
              <p>Sitemap geral para páginas estáticas do site.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
