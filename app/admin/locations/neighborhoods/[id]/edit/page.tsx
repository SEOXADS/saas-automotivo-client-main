'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { Home, Save, ArrowLeft } from 'lucide-react'
import { locationApiHelpers } from '@/lib/location-api'
import { Neighborhood, NeighborhoodFormData } from '@/types'

export default function EditNeighborhoodPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null)
  const [formData, setFormData] = useState<NeighborhoodFormData>({
    name: '',
    city_id: 0,
    zip_code: '',
    is_active: true
  })
  const [error, setError] = useState<string | null>(null)

  const neighborhoodId = params.id ? parseInt(params.id as string) : null

  useEffect(() => {
    if (neighborhoodId) {
      loadNeighborhood()
    }
  }, [neighborhoodId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadNeighborhood = async () => {
    if (!neighborhoodId) return

    setIsLoading(true)
    setError(null)

    try {
      const neighborhoodData = await locationApiHelpers.getTenantNeighborhood(neighborhoodId)
      if (neighborhoodData) {
        setNeighborhood(neighborhoodData)
        setFormData({
          name: neighborhoodData.name,
          city_id: neighborhoodData.city_id,
          zip_code: neighborhoodData.zip_code || '',
          is_active: neighborhoodData.is_active
        })
      } else {
        setError('Bairro não encontrado')
      }
    } catch (error) {
      console.error('Erro ao carregar bairro:', error)
      setError('Erro ao carregar bairro')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof NeighborhoodFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!neighborhoodId) return

    setIsSaving(true)

    try {
      const result = await locationApiHelpers.updateTenantNeighborhood(neighborhoodId, formData)
      if (result) {
        alert('Bairro atualizado com sucesso!')
        router.push(`/admin/locations/neighborhoods/${neighborhoodId}`)
      } else {
        alert('Erro ao atualizar bairro')
      }
    } catch (error) {
      console.error('Erro ao atualizar bairro:', error)
      alert('Erro ao atualizar bairro')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  if (isLoading) {
    return (
      <AdminLayout title="Carregando..." subtitle="Carregando dados do bairro">
        <div className="flex justify-center items-center min-h-screen">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !neighborhood) {
    return (
      <AdminLayout title="Erro" subtitle="Erro ao carregar bairro">
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
            <Home className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              {error || 'Bairro não encontrado'}
            </h3>
            <p className="text-red-700 mb-4">
              O bairro que você está tentando editar não foi encontrado ou não existe mais.
            </p>
            <Button
              onClick={() => router.push('/admin/locations/neighborhoods')}
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
    <AdminLayout title={`Editar ${neighborhood.name}`} subtitle="Editar informações do bairro">
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
          <h1 className="text-3xl font-bold text-gray-900">Editar Bairro</h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Home className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Informações do Bairro</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Bairro *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  id="zip_code"
                  value={formData.zip_code || ''}
                  onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12345-678"
                />
              </div>

              <div>
                <label htmlFor="city_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade *
                </label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  {neighborhood.city?.name || 'N/A'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  A cidade não pode ser alterada após a criação
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Bairro ativo
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Bairros inativos não aparecerão nas listagens do seu tenant
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
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
                disabled={isSaving}
                icon={<Save className="w-4 h-4" />}
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
