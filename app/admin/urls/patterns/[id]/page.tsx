'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { LinkIcon, Edit, ArrowLeft, Trash2, Eye } from 'lucide-react'
import { urlApiHelpers } from '@/lib/url-api'
import { UrlPattern } from '@/types/url'

export default function UrlPatternShowPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pattern, setPattern] = useState<UrlPattern | null>(null)
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
  }, [isAuthenticated, router, patternId])

  const loadPattern = async () => {
    if (!patternId) return

    setIsLoading(true)
    setError(null)

    try {
      const patternData = await urlApiHelpers.getTenantUrlPattern(patternId)
      if (patternData) {
        setPattern(patternData)
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

  const handleDelete = async () => {
    if (!pattern || !patternId) return

    if (!confirm('Tem certeza que deseja excluir este pattern de URL?')) return

    setIsDeleting(true)
    try {
      const success = await urlApiHelpers.deleteTenantUrlPattern(patternId)
      if (success) {
        router.push('/admin/urls/patterns')
      } else {
        alert('Erro ao excluir pattern')
      }
    } catch (error) {
      console.error('Erro ao excluir pattern:', error)
      alert('Erro ao excluir pattern')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout title="Pattern de URL" subtitle="Visualizar pattern de URL">
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
      <AdminLayout title="Pattern de URL" subtitle="Visualizar pattern de URL">
        <div className="p-6">
          <div className="text-center">
            <LinkIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
    <AdminLayout title="Pattern de URL" subtitle="Visualizar pattern de URL">
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
              <h1 className="text-2xl font-bold text-gray-900">Pattern de URL</h1>
              <p className="text-gray-600">Visualizar pattern de URL</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => router.push(`/admin/urls/patterns/${pattern.id}/edit`)}
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
              Informações Básicas
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pattern
                </label>
                <div className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {pattern.pattern}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Gerada
                </label>
                <div className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {pattern.generated_url}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <div className="text-sm text-gray-900">{pattern.priority}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  pattern.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {pattern.is_active ? 'Ativo' : 'Inativo'}
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
                  {new Date(pattern.created_at).toLocaleString('pt-BR')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Atualizado em
                </label>
                <div className="text-sm text-gray-900">
                  {new Date(pattern.updated_at).toLocaleString('pt-BR')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID do Pattern
                </label>
                <div className="text-sm text-gray-900 font-mono">{pattern.id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview da URL */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Preview da URL
          </h2>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-700 mb-2">
              <strong>Pattern:</strong> {pattern.pattern}
            </div>
            <div className="text-sm text-gray-700 mb-2">
              <strong>URL Gerada:</strong> {pattern.generated_url}
            </div>
            <div className="text-sm text-gray-700">
              <strong>Status:</strong> {pattern.is_active ? 'Ativo' : 'Inativo'}
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
              onClick={() => window.open(pattern.generated_url, '_blank')}
              variant="outline"
              icon={<Eye className="w-4 h-4" />}
            >
              Visualizar URL
            </Button>

            <Button
              onClick={() => router.push(`/admin/urls/patterns/${pattern.id}/edit`)}
              variant="outline"
              icon={<Edit className="w-4 h-4" />}
            >
              Editar Pattern
            </Button>

            <Button
              onClick={() => router.push('/admin/urls/patterns')}
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
