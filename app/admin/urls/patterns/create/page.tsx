'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { Save, ArrowLeft } from 'lucide-react'
import { urlApiHelpers } from '@/lib/url-api'
import { URL_PATTERN_TEMPLATES, generateUrlFromPattern } from '@/lib/url-patterns'
import { UrlPatternFormData } from '@/types/url'

export default function CreateUrlPatternPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [formData, setFormData] = useState<UrlPatternFormData>({
    pattern: '',
    priority: 1,
    is_active: true
  })
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }
  }, [isAuthenticated, router])

  const handleTemplateSelect = (templateId: string) => {
    const template = URL_PATTERN_TEMPLATES.find(t => t.id === templateId)
    if (!template) return

    setSelectedTemplate(templateId)
    setFormData(prev => ({
      ...prev,
      pattern: template.pattern
    }))

    // Inicializa variáveis vazias
    const initialVariables: Record<string, string> = {}
    template.variables.forEach(variable => {
      initialVariables[variable] = ''
    })
    setVariables(initialVariables)
    setPreviewUrl('')
  }

  const handleVariableChange = (variable: string, value: string) => {
    const newVariables = { ...variables, [variable]: value }
    setVariables(newVariables)

    // Gera preview da URL
    if (selectedTemplate) {
      const template = URL_PATTERN_TEMPLATES.find(t => t.id === selectedTemplate)
      if (template) {
        const preview = generateUrlFromPattern(template.pattern, newVariables)
        setPreviewUrl(preview)
        // Preview é apenas para visualização, não é salvo no formData
      }
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!formData.pattern) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)
    try {
      const result = await urlApiHelpers.createTenantUrlPattern(formData)
      if (result) {
        router.push('/admin/urls/patterns')
      } else {
        alert('Erro ao criar pattern de URL')
      }
    } catch (error) {
      console.error('Erro ao criar pattern:', error)
      alert('Erro ao criar pattern de URL')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedTemplateData = URL_PATTERN_TEMPLATES.find(t => t.id === selectedTemplate)

  return (
    <AdminLayout title="Criar Pattern de URL" subtitle="Crie um novo pattern de URL personalizado">
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
              <h1 className="text-2xl font-bold text-gray-900">Criar Pattern de URL</h1>
              <p className="text-gray-600">Configure um novo pattern de URL personalizado</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seleção de Template */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Escolha um Template
              </h2>

              <div className="space-y-3">
                {Object.entries(
                  URL_PATTERN_TEMPLATES.reduce((acc, template) => {
                    if (!acc[template.category]) {
                      acc[template.category] = []
                    }
                    acc[template.category].push(template)
                    return acc
                  }, {} as Record<string, typeof URL_PATTERN_TEMPLATES>)
                ).map(([category, templates]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                      {category === 'vehicle' ? 'Veículos' : category === 'article' ? 'Artigos' : 'Marcas'}
                    </h3>
                    <div className="space-y-2">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedTemplate === template.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{template.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                              <code className="text-xs text-gray-500 mt-1 block">
                                {template.pattern}
                              </code>
                            </div>
                            <div className="text-xs text-gray-400">
                              {template.variables.length} variável{template.variables.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            {selectedTemplate && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Preview da URL
                </h2>

                {selectedTemplateData && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pattern:
                      </label>
                      <code className="text-sm bg-gray-100 p-2 rounded block">
                        {selectedTemplateData.pattern}
                      </code>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exemplo:
                      </label>
                      <code className="text-sm bg-gray-100 p-2 rounded block">
                        {selectedTemplateData.example}
                      </code>
                    </div>

                    {previewUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL Gerada:
                        </label>
                        <code className="text-sm bg-green-100 p-2 rounded block text-green-800">
                          {previewUrl}
                        </code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Formulário */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Variáveis do Template */}
              {selectedTemplate && selectedTemplateData && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Configurar Variáveis
                  </h2>

                  <div className="space-y-4">
                    {selectedTemplateData.variables.map((variable) => (
                      <div key={variable}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {variable.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                        </label>
                        <input
                          type="text"
                          value={variables[variable] || ''}
                          onChange={(e) => handleVariableChange(variable, e.target.value)}
                          placeholder={`Digite o valor para ${variable}`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Configurações do Pattern */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Configurações do Pattern
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pattern *
                    </label>
                    <input
                      type="text"
                      value={formData.pattern}
                      onChange={(e) => setFormData(prev => ({ ...prev, pattern: e.target.value }))}
                      placeholder="/exemplo/{variavel}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use chaves {} para definir variáveis dinâmicas
                    </p>
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridade
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Prioridade do pattern (1 = maior prioridade)
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
                      Pattern ativo
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
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || !formData.pattern}
                  icon={<Save className="w-4 h-4" />}
                >
                  {isLoading ? 'Criando...' : 'Criar Pattern'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
