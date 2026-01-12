'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { Save, ArrowLeft } from 'lucide-react'
import { urlApiHelpers } from '@/lib/url-api'
import { UrlRedirectFormData } from '@/types/url'

export default function CreateUrlRedirectPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<UrlRedirectFormData>({
    old_path: '',
    new_path: '',
    status_code: 301,
    is_active: true
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!formData.old_path || !formData.new_path) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)
    try {
      const result = await urlApiHelpers.createTenantUrlRedirect(formData)
      if (result) {
        router.push('/admin/urls/redirects')
      } else {
        alert('Erro ao criar redirect')
      }
    } catch (error) {
      console.error('Erro ao criar redirect:', error)
      alert('Erro ao criar redirect')
    } finally {
      setIsLoading(false)
    }
  }

  const statusCodeOptions = [
    { value: 301, label: '301 - Moved Permanently (Permanente)' },
    { value: 302, label: '302 - Found (Temporário)' },
    { value: 307, label: '307 - Temporary Redirect (Temporário com método)' },
    { value: 308, label: '308 - Permanent Redirect (Permanente com método)' }
  ]

  return (
    <AdminLayout title="Criar Redirect de URL" subtitle="Crie um novo redirect de URL">
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
              <h1 className="text-2xl font-bold text-gray-900">Criar Redirect de URL</h1>
              <p className="text-gray-600">Configure um novo redirect de URL</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Configurações do Redirect
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Path Antigo *
                  </label>
                  <input
                    type="text"
                    value={formData.old_path}
                    onChange={(e) => setFormData(prev => ({ ...prev, old_path: e.target.value }))}
                    placeholder="/pagina-antiga"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL antiga que será redirecionada
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Path Novo *
                  </label>
                  <input
                    type="text"
                    value={formData.new_path}
                    onChange={(e) => setFormData(prev => ({ ...prev, new_path: e.target.value }))}
                    placeholder="/pagina-nova"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL nova para onde será redirecionado
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código de Status *
                  </label>
                  <select
                    value={formData.status_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, status_code: Number(e.target.value) as 301 | 302 | 307 | 308 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statusCodeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Tipo de redirect que será aplicado
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
                    Redirect ativo
                  </label>
                </div>
              </div>
            </div>

            {/* Informações sobre códigos de status */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Informações sobre códigos de status:
              </h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li><strong>301:</strong> Redirecionamento permanente - SEO-friendly, transfere autoridade</li>
                <li><strong>302:</strong> Redirecionamento temporário - não transfere autoridade SEO</li>
                <li><strong>307:</strong> Redirecionamento temporário que preserva o método HTTP</li>
                <li><strong>308:</strong> Redirecionamento permanente que preserva o método HTTP</li>
              </ul>
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
                disabled={isLoading || !formData.old_path || !formData.new_path}
                icon={<Save className="w-4 h-4" />}
              >
                {isLoading ? 'Criando...' : 'Criar Redirect'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
