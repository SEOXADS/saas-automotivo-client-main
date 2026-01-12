'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { ArrowRight, Edit, ArrowLeft, Trash2, Eye } from 'lucide-react'
import { urlApiHelpers } from '@/lib/url-api'
import { UrlRedirect } from '@/types/url'

export default function UrlRedirectShowPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [redirect, setRedirect] = useState<UrlRedirect | null>(null)
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
  }, [isAuthenticated, router, redirectId])

  const loadRedirect = async () => {
    if (!redirectId) return

    setIsLoading(true)
    setError(null)

    try {
      const redirectData = await urlApiHelpers.getTenantUrlRedirect(redirectId)
      if (redirectData) {
        setRedirect(redirectData)
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

  const handleDelete = async () => {
    if (!redirect || !redirectId) return

    if (!confirm('Tem certeza que deseja excluir este redirect de URL?')) return

    setIsDeleting(true)
    try {
      const success = await urlApiHelpers.deleteTenantUrlRedirect(redirectId)
      if (success) {
        router.push('/admin/urls/redirects')
      } else {
        alert('Erro ao excluir redirect')
      }
    } catch (error) {
      console.error('Erro ao excluir redirect:', error)
      alert('Erro ao excluir redirect')
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusCodeLabel = (code: number) => {
    const labels: Record<number, string> = {
      301: '301 - Moved Permanently (Permanente)',
      302: '302 - Found (Temporário)',
      307: '307 - Temporary Redirect (Temporário com método)',
      308: '308 - Permanent Redirect (Permanente com método)'
    }
    return labels[code] || `${code} - Código desconhecido`
  }

  const getStatusCodeColor = (code: number) => {
    const colors: Record<number, string> = {
      301: 'bg-blue-100 text-blue-800',
      302: 'bg-yellow-100 text-yellow-800',
      307: 'bg-orange-100 text-orange-800',
      308: 'bg-purple-100 text-purple-800'
    }
    return colors[code] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <AdminLayout title="Redirect de URL" subtitle="Visualizar redirect de URL">
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
      <AdminLayout title="Redirect de URL" subtitle="Visualizar redirect de URL">
        <div className="p-6">
          <div className="text-center">
            <ArrowRight className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
    <AdminLayout title="Redirect de URL" subtitle="Visualizar redirect de URL">
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
              <h1 className="text-2xl font-bold text-gray-900">Redirect de URL</h1>
              <p className="text-gray-600">Visualizar redirect de URL</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => router.push(`/admin/urls/redirects/${redirect.id}/edit`)}
              variant="outline"
              icon={<Edit className="w-4 h-4" />}
            >
              Editar
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              icon={<Trash2 className="w-4 h-4" />}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Redirect
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Antiga
                </label>
                <div className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {redirect.old_path}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Nova
                </label>
                <div className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {redirect.new_path}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Status
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusCodeColor(redirect.status_code)}`}>
                  {getStatusCodeLabel(redirect.status_code)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  redirect.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {redirect.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>

          {/* Informações de Data */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informações de Data
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Criado em
                </label>
                <div className="text-sm text-gray-900">
                  {new Date(redirect.created_at).toLocaleString('pt-BR')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atualizado em
                </label>
                <div className="text-sm text-gray-900">
                  {new Date(redirect.updated_at).toLocaleString('pt-BR')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID do Redirect
                </label>
                <div className="text-sm text-gray-900 font-mono">{redirect.id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview do Redirect */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Preview do Redirect
          </h2>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700 font-mono bg-white p-2 rounded border">
                {redirect.old_path}
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className="text-sm text-gray-700 font-mono bg-white p-2 rounded border">
                {redirect.new_path}
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <strong>Código:</strong> {getStatusCodeLabel(redirect.status_code)} |
              <strong> Status:</strong> {redirect.is_active ? 'Ativo' : 'Inativo'}
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ações Rápidas
          </h2>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => window.open(redirect.old_path, '_blank')}
              variant="outline"
              icon={<Eye className="w-4 h-4" />}
            >
              Testar URL Antiga
            </Button>

            <Button
              onClick={() => window.open(redirect.new_path, '_blank')}
              variant="outline"
              icon={<Eye className="w-4 h-4" />}
            >
              Testar URL Nova
            </Button>

            <Button
              onClick={() => router.push(`/admin/urls/redirects/${redirect.id}/edit`)}
              variant="outline"
              icon={<Edit className="w-4 h-4" />}
            >
              Editar Redirect
            </Button>

            <Button
              onClick={() => router.push('/admin/urls/redirects')}
              variant="outline"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Voltar para Lista
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
