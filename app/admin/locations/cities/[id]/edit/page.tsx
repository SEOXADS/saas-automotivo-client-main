'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { Building2, Save, ArrowLeft } from 'lucide-react'
import { locationApiHelpers } from '@/lib/location-api'
import { City, CityFormData } from '@/types'

export default function EditCityPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [city, setCity] = useState<City | null>(null)
  const [formData, setFormData] = useState<CityFormData>({
    name: '',
    state_id: 0,
    ibge_code: '',
    is_active: true
  })
  const [error, setError] = useState<string | null>(null)

  const cityId = params.id ? parseInt(params.id as string) : null

  useEffect(() => {
    if (cityId) {
      loadCity()
    }
  }, [cityId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCity = async () => {
    if (!cityId) return

    setIsLoading(true)
    setError(null)

    try {
      const cityData = await locationApiHelpers.getTenantCity(cityId)
      if (cityData) {
        setCity(cityData)
        setFormData({
          name: cityData.name,
          state_id: cityData.state_id,
          ibge_code: cityData.ibge_code || '',
          is_active: cityData.is_active
        })
      } else {
        setError('Cidade não encontrada')
      }
    } catch (error) {
      console.error('Erro ao carregar cidade:', error)
      setError('Erro ao carregar cidade')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CityFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cityId) return

    setIsSaving(true)

    try {
      const result = await locationApiHelpers.updateTenantCity(cityId, formData)
      if (result) {
        alert('Cidade atualizada com sucesso!')
        router.push(`/admin/locations/cities/${cityId}`)
      } else {
        alert('Erro ao atualizar cidade')
      }
    } catch (error) {
      console.error('Erro ao atualizar cidade:', error)
      alert('Erro ao atualizar cidade')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  if (isLoading) {
    return (
      <AdminLayout title="Carregando..." subtitle="Carregando dados da cidade">
        <div className="flex justify-center items-center min-h-screen">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !city) {
    return (
      <AdminLayout title="Erro" subtitle="Erro ao carregar cidade">
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
            <Building2 className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              {error || 'Cidade não encontrada'}
            </h3>
            <p className="text-red-700 mb-4">
              A cidade que você está tentando editar não foi encontrada ou não existe mais.
            </p>
            <Button
              onClick={() => router.push('/admin/locations/cities')}
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
    <AdminLayout title={`Editar ${city.name}`} subtitle="Editar informações da cidade">
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
          <h1 className="text-3xl font-bold text-gray-900">Editar Cidade</h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Building2 className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Informações da Cidade</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Cidade *
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
                <label htmlFor="ibge_code" className="block text-sm font-medium text-gray-700 mb-2">
                  Código IBGE
                </label>
                <input
                  type="text"
                  id="ibge_code"
                  value={formData.ibge_code || ''}
                  onChange={(e) => handleInputChange('ibge_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234567"
                />
              </div>

              <div>
                <label htmlFor="state_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  {city.state?.name || 'N/A'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  O estado não pode ser alterado após a criação
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
                    Cidade ativa
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Cidades inativas não aparecerão nas listagens do seu tenant
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
