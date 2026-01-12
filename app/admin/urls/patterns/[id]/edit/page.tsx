'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { Save, ArrowLeft } from 'lucide-react'
import { urlApiHelpers } from '@/lib/url-api'
import { UrlPattern, UrlPatternFormData } from '@/types/url'

export default function EditUrlPatternPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pattern, setPattern] = useState<UrlPattern | null>(null)
  const [formData, setFormData] = useState<UrlPatternFormData>({
    pattern: '',
    priority: 1,
    is_active: true
  })
  const [error, setError] = useState<string | null>(null)

  const patternId = params.id ? parseInt(params.id as string) : null

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    if (patternId) {
      loadPattern()
    }
  }, [isAuthenticated, router, patternId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadPattern = async () => {
    if (!patternId) return

    setIsLoading(true)
    setError(null)

    try {
      const patternData = await urlApiHelpers.getTenantUrlPattern(patternId)
      if (patternData) {
        setPattern(patternData)
        setFormData({
          pattern: patternData.pattern,
          priority: patternData.priority,
          is_active: patternData.is_active
        })
      } else {
        setError('Pattern de URL não encontrado')
      }
    } catch (error) {
      console.error('Erro ao carregar pattern:', error)
      setError('Erro ao carregar pattern')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UrlPatternFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.pattern) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setIsSaving(true)
    try {
      const result = await urlApiHelpers.updateTenantUrlPattern(patternId!, formData)
      if (result) {
        router.push(`/admin/urls/patterns/${patternId}`)
      } else {
        alert('Erro ao atualizar pattern')
      }
    } catch (error) {
      console.error('Erro ao atualizar pattern:', error)
      alert('Erro ao atualizar pattern')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Editar Pattern" subtitle="Editar pattern de URL">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando pattern...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !pattern) {
    return (
      <AdminLayout title="Editar Pattern" subtitle="Editar pattern de URL">
        <div className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Pattern não encontrado'}
            </h3>
            <Button
              onClick={() => router.push('/admin/urls/patterns')}
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
    <AdminLayout title="Editar Pattern" subtitle="Editar pattern de URL">
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
              <h1 className="text-2xl font-bold text-gray-900">Editar Pattern</h1>
              <p className="text-gray-600">Editar pattern de URL</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Pattern
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pattern *
                </label>
                <input
                  type="text"
                  value={formData.pattern}
                  onChange={(e) => handleInputChange('pattern', e.target.value)}
                  placeholder="/{brand_slug}-{model_slug}-{year}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use variáveis como {'{brand_slug}'}, {'{model_slug}'}, {'{year}'}, {'{city_slug}'}, {'{state_slug}'}, {'{neighborhood_slug}'}
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
                  onChange={(e) => handleInputChange('priority', Number(e.target.value))}
                  placeholder="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Valor entre 1 e 100 (quanto maior, maior a prioridade)
                </p>
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
                  Pattern ativo
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Preview do Pattern
            </h2>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-700 mb-2">
                <strong>Pattern:</strong> {formData.pattern}
              </div>
              <div className="text-sm text-gray-700 mb-2">
                <strong>Prioridade:</strong> {formData.priority}
              </div>
              <div className="text-sm text-gray-700">
                <strong>Status:</strong> {formData.is_active ? 'Ativo' : 'Inativo'}
              </div>
            </div>
          </div>

          {/* Informações sobre variáveis */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Variáveis disponíveis:
            </h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li><strong>{`{brand_slug}`}</strong> - Slug da marca (ex: honda)</li>
              <li><strong>{`{model_slug}`}</strong> - Slug do modelo (ex: civic)</li>
              <li><strong>{`{year}`}</strong> - Ano do veículo (ex: 2023)</li>
              <li><strong>{`{city_slug}`}</strong> - Slug da cidade (ex: sao-paulo)</li>
              <li><strong>{`{state_slug}`}</strong> - Slug do estado (ex: sp)</li>
              <li><strong>{`{neighborhood_slug}`}</strong> - Slug do bairro (ex: vila-madalena)</li>
            </ul>
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
              disabled={isSaving || !formData.pattern}
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
