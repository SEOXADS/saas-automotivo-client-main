'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { Save, ArrowLeft } from 'lucide-react'
import { urlApiHelpers } from '@/lib/url-api'
import { UrlRedirect, UrlRedirectFormData } from '@/types/url'

export default function EditUrlRedirectPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [redirect, setRedirect] = useState<UrlRedirect | null>(null)
  const [formData, setFormData] = useState<UrlRedirectFormData>({
    old_path: '',
    new_path: '',
    status_code: 301,
    is_active: true
  })
  const [error, setError] = useState<string | null>(null)

  const redirectId = params.id ? parseInt(params.id as string) : null

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    if (redirectId) {
      loadRedirect()
    }
  }, [isAuthenticated, router, redirectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadRedirect = async () => {
    if (!redirectId) return

    setIsLoading(true)
    setError(null)

    try {
      const redirectData = await urlApiHelpers.getTenantUrlRedirect(redirectId)
      if (redirectData) {
        setRedirect(redirectData)
        setFormData({
          old_path: redirectData.old_path,
          new_path: redirectData.new_path,
          status_code: redirectData.status_code,
          is_active: redirectData.is_active
        })
      } else {
        setError('Redirect de URL não encontrado')
      }
    } catch (error) {
      console.error('Erro ao carregar redirect:', error)
      setError('Erro ao carregar redirect')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UrlRedirectFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.old_path || !formData.new_path) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setIsSaving(true)
    try {
      const result = await urlApiHelpers.updateTenantUrlRedirect(redirectId!, formData)
      if (result) {
        router.push(`/admin/urls/redirects/${redirectId}`)
      } else {
        alert('Erro ao atualizar redirect')
      }
    } catch (error) {
      console.error('Erro ao atualizar redirect:', error)
      alert('Erro ao atualizar redirect')
    } finally {
      setIsSaving(false)
    }
  }

  const statusCodeOptions = [
    { value: 301, label: '301 - Moved Permanently (Permanente)' },
    { value: 302, label: '302 - Found (Temporário)' },
    { value: 307, label: '307 - Temporary Redirect (Temporário com método)' },
    { value: 308, label: '308 - Permanent Redirect (Permanente com método)' }
  ]

  if (isLoading) {
    return (
      <AdminLayout title="Editar Redirect" subtitle="Editar redirect de URL">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando redirect...</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !redirect) {
    return (
      <AdminLayout title="Editar Redirect" subtitle="Editar redirect de URL">
        <div className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Redirect não encontrado'}
            </h3>
            <Button
              onClick={() => router.push('/admin/urls/redirects')}
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
    <AdminLayout title="Editar Redirect" subtitle="Editar redirect de URL">
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
              <h1 className="text-2xl font-bold text-gray-900">Editar Redirect</h1>
              <p className="text-gray-600">Editar redirect de URL</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Redirect
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Antiga *
                </label>
                <input
                  type="text"
                  value={formData.old_path}
                  onChange={(e) => handleInputChange('old_path', e.target.value)}
                  placeholder="/pagina-antiga"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL que será redirecionada
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Nova *
                </label>
                <input
                  type="text"
                  value={formData.new_path}
                  onChange={(e) => handleInputChange('new_path', e.target.value)}
                  placeholder="/pagina-nova"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL de destino do redirect
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Status *
                </label>
                <select
                  value={formData.status_code}
                  onChange={(e) => handleInputChange('status_code', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {statusCodeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Tipo de redirect (permanente ou temporário)
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
                  Redirect ativo
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Preview do Redirect
            </h2>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700 font-mono bg-white p-2 rounded border">
                  {formData.old_path || '/url-antiga'}
                </div>
                <div className="text-sm text-gray-400">→</div>
                <div className="text-sm text-gray-700 font-mono bg-white p-2 rounded border">
                  {formData.new_path || '/url-nova'}
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <strong>Código:</strong> {statusCodeOptions.find(opt => opt.value === formData.status_code)?.label} |
                <strong> Status:</strong> {formData.is_active ? 'Ativo' : 'Inativo'}
              </div>
            </div>
          </div>

          {/* Informações sobre códigos de status */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Códigos de Status:
            </h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li><strong>301:</strong> Redirect permanente - SEO preservado</li>
              <li><strong>302:</strong> Redirect temporário - SEO não preservado</li>
              <li><strong>307:</strong> Redirect temporário com método HTTP preservado</li>
              <li><strong>308:</strong> Redirect permanente com método HTTP preservado</li>
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
              disabled={isSaving || !formData.old_path || !formData.new_path}
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
