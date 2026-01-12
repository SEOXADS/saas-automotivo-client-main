'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { Save, ArrowLeft, RefreshCw } from 'lucide-react'
import { sitemapApiHelpers } from '@/lib/sitemap-api'
import { RobotsTxtFormData } from '@/types/sitemap'

export default function RobotsTxtPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState<RobotsTxtFormData>({
    user_agent: '*',
    allow: ['/'],
    disallow: ['/admin/', '/api/', '/_next/'],
    crawl_delay: undefined,
    sitemap: ['/sitemap.xml'],
    is_active: true
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    loadRobotsTxt()
  }, [isAuthenticated, router])

  useEffect(() => {
    if (formData.user_agent) {
      generatePreview()
    }
  }, [formData]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadRobotsTxt = async () => {
    setIsLoading(true)
    try {
      const config = await sitemapApiHelpers.getTenantRobotsTxt()
      if (config) {
        setFormData({
          user_agent: config.user_agent,
          allow: config.allow,
          disallow: config.disallow,
          crawl_delay: config.crawl_delay,
          sitemap: config.sitemap,
          is_active: config.is_active
        })
      }
    } catch (error) {
      console.error('Erro ao carregar configuração de robots.txt:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setIsSaving(true)
    try {
      const result = await sitemapApiHelpers.updateTenantRobotsTxt(formData)
      if (result) {
        alert('Configuração de robots.txt salva com sucesso!')
      } else {
        alert('Erro ao salvar configuração')
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
      alert('Erro ao salvar configuração')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateRobotsTxt = async () => {
    setIsGenerating(true)
    try {
      const result = await sitemapApiHelpers.generateRobotsTxt()
      if (result.success) {
        alert(`Robots.txt gerado com sucesso! ${result.url ? `Disponível em: ${result.url}` : ''}`)
      } else {
        alert(`Erro ao gerar robots.txt: ${result.message}`)
      }
    } catch (error) {
      console.error('Erro ao gerar robots.txt:', error)
      alert('Erro ao gerar robots.txt')
    } finally {
      setIsGenerating(false)
    }
  }

  const addAllowPath = () => {
    setFormData(prev => ({
      ...prev,
      allow: [...prev.allow, '']
    }))
  }

  const removeAllowPath = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allow: prev.allow.filter((_, i) => i !== index)
    }))
  }

  const updateAllowPath = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      allow: prev.allow.map((path, i) => i === index ? value : path)
    }))
  }

  const addDisallowPath = () => {
    setFormData(prev => ({
      ...prev,
      disallow: [...prev.disallow, '']
    }))
  }

  const removeDisallowPath = (index: number) => {
    setFormData(prev => ({
      ...prev,
      disallow: prev.disallow.filter((_, i) => i !== index)
    }))
  }

  const updateDisallowPath = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      disallow: prev.disallow.map((path, i) => i === index ? value : path)
    }))
  }

  const addSitemap = () => {
    setFormData(prev => ({
      ...prev,
      sitemap: [...prev.sitemap, '']
    }))
  }

  const removeSitemap = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sitemap: prev.sitemap.filter((_, i) => i !== index)
    }))
  }

  const updateSitemap = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      sitemap: prev.sitemap.map((url, i) => i === index ? value : url)
    }))
  }

  const [previewContent, setPreviewContent] = useState('')

  const generatePreview = async () => {
    try {
      const result = await sitemapApiHelpers.getTenantRobotsTxtPreview()
      setPreviewContent(result.content)
    } catch (error) {
      console.error('Erro ao gerar preview:', error)
      // Fallback para preview local
      let robotsTxt = `User-agent: ${formData.user_agent}\n`

      formData.allow.forEach(path => {
        if (path.trim()) {
          robotsTxt += `Allow: ${path}\n`
        }
      })

      formData.disallow.forEach(path => {
        if (path.trim()) {
          robotsTxt += `Disallow: ${path}\n`
        }
      })

      if (formData.crawl_delay) {
        robotsTxt += `Crawl-delay: ${formData.crawl_delay}\n`
      }

      formData.sitemap.forEach(url => {
        if (url.trim()) {
          robotsTxt += `Sitemap: ${url}\n`
        }
      })

      setPreviewContent(robotsTxt)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Robots.txt" subtitle="Configure o arquivo robots.txt">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando configuração...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Robots.txt" subtitle="Configure o arquivo robots.txt">
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
              <h1 className="text-2xl font-bold text-gray-900">Robots.txt</h1>
              <p className="text-gray-600">Configure o arquivo robots.txt do seu site</p>
            </div>
          </div>
          <Button
            onClick={handleGenerateRobotsTxt}
            variant="outline"
            icon={<RefreshCw className="w-4 h-4" />}
            disabled={isGenerating}
          >
            {isGenerating ? 'Gerando...' : 'Gerar Robots.txt'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Configurações Básicas
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User-agent *
                    </label>
                    <input
                      type="text"
                      value={formData.user_agent}
                      onChange={(e) => setFormData(prev => ({ ...prev, user_agent: e.target.value }))}
                      placeholder="*"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use * para todos os bots ou especifique um bot específico
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Crawl Delay (segundos)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.crawl_delay || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, crawl_delay: e.target.value ? Number(e.target.value) : undefined }))}
                      placeholder="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tempo de espera entre requisições (opcional)
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Robots.txt ativo
                    </label>
                  </div>
                </div>
              </div>

              {/* Allow Paths */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Allow Paths
                  </h2>
                  <Button
                    type="button"
                    onClick={addAllowPath}
                    variant="outline"
                    size="sm"
                  >
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.allow.map((path, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={path}
                        onChange={(e) => updateAllowPath(index, e.target.value)}
                        placeholder="/"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button
                        type="button"
                        onClick={() => removeAllowPath(index)}
                        variant="outline"
                        size="sm"
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disallow Paths */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Disallow Paths
                  </h2>
                  <Button
                    type="button"
                    onClick={addDisallowPath}
                    variant="outline"
                    size="sm"
                  >
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.disallow.map((path, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={path}
                        onChange={(e) => updateDisallowPath(index, e.target.value)}
                        placeholder="/admin/"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button
                        type="button"
                        onClick={() => removeDisallowPath(index)}
                        variant="outline"
                        size="sm"
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sitemaps */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Sitemaps
                  </h2>
                  <Button
                    type="button"
                    onClick={addSitemap}
                    variant="outline"
                    size="sm"
                  >
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.sitemap.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateSitemap(index, e.target.value)}
                        placeholder="https://seusite.com/sitemap.xml"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button
                        type="button"
                        onClick={() => removeSitemap(index)}
                        variant="outline"
                        size="sm"
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
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
                  disabled={isSaving || !formData.user_agent}
                  icon={<Save className="w-4 h-4" />}
                >
                  {isSaving ? 'Salvando...' : 'Salvar Configuração'}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Preview do Robots.txt
              </h2>

              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                  {previewContent || 'Carregando preview...'}
                </pre>
              </div>
            </div>

            {/* Informações */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Informações sobre Robots.txt:
              </h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li><strong>User-agent:</strong> Especifica qual bot a regra se aplica</li>
                <li><strong>Allow:</strong> Permite acesso a caminhos específicos</li>
                <li><strong>Disallow:</strong> Bloqueia acesso a caminhos específicos</li>
                <li><strong>Crawl-delay:</strong> Define tempo entre requisições</li>
                <li><strong>Sitemap:</strong> Indica localização dos sitemaps</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
