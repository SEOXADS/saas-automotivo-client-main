'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { Save, ArrowLeft } from 'lucide-react'
import { sitemapApiHelpers } from '@/lib/sitemap-api'
import { SitemapConfig, SitemapFormData } from '@/types/sitemap'

export default function EditSitemapConfigPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [config, setConfig] = useState<SitemapConfig | null>(null)
  const [formData, setFormData] = useState<SitemapFormData>({
    name: '',
    type: 'pages',
    url: '',
    is_active: true,
    priority: 0.5,
    change_frequency: 'weekly'
  })
  const [error, setError] = useState<string | null>(null)

  const configId = params.id ? parseInt(params.id as string) : null

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
      const configData = await sitemapApiHelpers.getTenantSitemapConfig(configId)
      if (configData) {
        setConfig(configData)
        setFormData({
          name: configData.name,
          type: configData.type,
          url: configData.url,
          is_active: configData.is_active,
          priority: configData.priority,
          change_frequency: configData.change_frequency
        })
      } else {
        setError('Configuração de sitemap não encontrada')
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      setError('Erro ao carregar configuração')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof SitemapFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.url) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setIsSaving(true)
    try {
      const result = await sitemapApiHelpers.updateTenantSitemapConfig(configId!, formData)
      if (result) {
        router.push(`/admin/sitemap/configs/${configId}`)
      } else {
        alert('Erro ao atualizar configuração')
      }
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      alert('Erro ao atualizar configuração')
    } finally {
      setIsSaving(false)
    }
  }

  const typeOptions = [
    { value: 'index', label: 'Índice' },
    { value: 'images', label: 'Imagens' },
    { value: 'videos', label: 'Vídeos' },
    { value: 'articles', label: 'Artigos' },
    { value: 'vehicles', label: 'Veículos' },
    { value: 'pages', label: 'Páginas' }
  ]

  const changeFrequencyOptions = [
    { value: 'always', label: 'Sempre' },
    { value: 'hourly', label: 'Por hora' },
    { value: 'daily', label: 'Diariamente' },
    { value: 'weekly', label: 'Semanalmente' },
    { value: 'monthly', label: 'Mensalmente' },
    { value: 'yearly', label: 'Anualmente' },
    { value: 'never', label: 'Nunca' }
  ]

  if (isLoading) {
    return (
      <AdminLayout title="Editar Configuração" subtitle="Editar configuração de sitemap">
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
      <AdminLayout title="Editar Configuração" subtitle="Editar configuração de sitemap">
        <div className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Configuração não encontrada'}
            </h3>
            <Button
              onClick={() => router.push('/admin/sitemap/configs')}
              variant="outline"
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
    <AdminLayout title="Editar Configuração" subtitle="Editar configuração de sitemap">
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
              <h1 className="text-2xl font-bold text-gray-900">Editar Configuração</h1>
              <p className="text-gray-600">Editar configuração de sitemap</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações Básicas
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Sitemap de Veículos"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://seusite.com/sitemap-vehicles.xml"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', Number(e.target.value))}
                    placeholder="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Valor entre 0.0 e 1.0
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequência de Mudança
                  </label>
                  <select
                    value={formData.change_frequency}
                    onChange={(e) => handleInputChange('change_frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {changeFrequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Configuração ativa
                </label>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving || !formData.name || !formData.url}
              icon={<Save className="w-4 h-4" />}
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
