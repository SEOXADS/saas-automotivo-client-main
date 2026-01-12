'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { MapPin, Edit, ArrowLeft, Trash2, Building2 } from 'lucide-react'
import { locationApiHelpers } from '@/lib/location-api'
import { State } from '@/types'

export default function StateShowPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [state, setState] = useState<State | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stateId = params.id ? parseInt(params.id as string) : null

  useEffect(() => {
    if (stateId) {
      loadState()
    }
  }, [stateId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadState = async () => {
    if (!stateId) return

    setIsLoading(true)
    setError(null)

    try {
      const stateData = await locationApiHelpers.getTenantState(stateId)
      if (stateData) {
        setState(stateData)
      } else {
        setError('Estado não encontrado')
      }
    } catch (error) {
      console.error('Erro ao carregar estado:', error)
      setError('Erro ao carregar estado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!state || !stateId) return

    const confirmed = confirm(`Tem certeza que deseja excluir o estado "${state.name}"?`)
    if (!confirmed) return

    setIsDeleting(true)

    try {
      const success = await locationApiHelpers.deleteTenantState(stateId)
      if (success) {
        alert('Estado excluído com sucesso!')
        router.push('/admin/locations/states')
      } else {
        alert('Erro ao excluir estado')
      }
    } catch (error) {
      console.error('Erro ao excluir estado:', error)
      alert('Erro ao excluir estado')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  if (isLoading) {
    return (
      <AdminLayout title="Carregando..." subtitle="Carregando dados do estado">
        <div className="flex justify-center items-center min-h-screen">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !state) {
    return (
      <AdminLayout title="Erro" subtitle="Erro ao carregar estado">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              className="mr-4"
            >
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Erro</h1>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <MapPin className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              {error || 'Estado não encontrado'}
            </h3>
            <p className="text-red-700 mb-4">
              O estado que você está procurando não foi encontrado ou não existe mais.
            </p>
            <Button
              onClick={() => router.push('/admin/locations/states')}
              variant="primary"
            >
              Voltar para Lista
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={state.name} subtitle="Detalhes do estado">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              className="mr-4"
            >
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">{state.name}</h1>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={() => router.push(`/admin/locations/states/${state.id}/edit`)}
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
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações Principais */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-6">
                <MapPin className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Informações do Estado</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Estado
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    {state.name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    {state.code}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    {state.country?.name || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      state.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {state.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    {state.id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações de Data */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-6">
                <MapPin className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Datas</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Criado em
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                    {new Date(state.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Atualizado em
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                    {new Date(state.updated_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push(`/admin/locations/cities/create?state_id=${state.id}`)}
                  variant="outline"
                  className="w-full justify-start"
                  icon={<Building2 className="w-4 h-4" />}
                >
                  Adicionar Cidades
                </Button>

                <Button
                  onClick={() => router.push(`/admin/locations/cities?state_id=${state.id}`)}
                  variant="outline"
                  className="w-full justify-start"
                  icon={<Building2 className="w-4 h-4" />}
                >
                  Ver Cidades
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
