'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { MapPin, Save, ArrowLeft, CheckSquare, Square } from 'lucide-react'
import { locationApiHelpers } from '@/lib/location-api'
import { Country, State } from '@/types'

export default function CreateStatesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user} = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const [isLoadingStates, setIsLoadingStates] = useState(false)
  const [tenantCountries, setTenantCountries] = useState<Country[]>([])
  const [publicStates, setPublicStates] = useState<State[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [selectedStates, setSelectedStates] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  // Carregar países do tenant ao montar o componente
  useEffect(() => {
    loadTenantCountries()
  }, [])

  // Carregar estados públicos quando um país for selecionado
  useEffect(() => {
    if (selectedCountry) {
      loadPublicStates(selectedCountry.id)
    }
  }, [selectedCountry])

  const loadTenantCountries = async () => {
    setIsLoadingCountries(true)
    try {
      const response = await locationApiHelpers.getTenantCountries(user)
      
      // Log the response to debug
      console.log('API Response in loadTenantCountries:', response)
      console.log('response.data:', response?.data)
      console.log('response.data.data:', response?.data?.data)
      
      // Your API returns: { success: true, data: { data: [...], ... } }
      // So we need to access response.data.data to get the actual countries array
      const countriesArray = Array.isArray(response?.data?.data) 
        ? response.data.data 
        : []
      
      console.log('Setting tenantCountries:', countriesArray)
      setTenantCountries(countriesArray)
    } catch (error) {
      console.error('Erro ao carregar países do tenant:', error)
      setTenantCountries([])
    } finally {
      setIsLoadingCountries(false)
    }
  }

  const loadPublicStates = async (countryId: number) => {
    setIsLoadingStates(true)
    try 
    {
      const response = await locationApiHelpers.getPublicStatesByCountry(countryId)
      
      console.log('Public states response:', response)
      
      // Check if response has a nested structure like countries did
      const statesArray = Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : []
      
      console.log('Setting publicStates:', statesArray)
      setPublicStates(statesArray)
    } catch (error) {
      console.error('Erro ao carregar estados disponíveis:', error)
      setPublicStates([])
    } finally {
      setIsLoadingStates(false)
    }
  }
  // Filtrar estados baseado no termo de busca
  const filteredStates = publicStates.filter(state =>
    state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    state.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setSelectedStates(new Set()) // Limpar seleção de estados
    setSearchTerm('') // Limpar busca
  }

  const handleStateToggle = (stateId: number) => {
    const newSelectedStates = new Set(selectedStates)
    if (newSelectedStates.has(stateId)) {
      newSelectedStates.delete(stateId)
    } else {
      newSelectedStates.add(stateId)
    }
    setSelectedStates(newSelectedStates)
  }

  const handleSelectAll = () => {
    setSelectedStates(new Set(filteredStates.map(state => state.id)))
  }

  const handleDeselectAll = () => {
    setSelectedStates(new Set())
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (selectedStates.size === 0) {
      alert('Selecione pelo menos um estado para adicionar ao tenant')
      return
    }

    setIsLoading(true)

    try {
      const promises = Array.from(selectedStates).map(stateId => {
        return locationApiHelpers.createTenantState({
          state_id: stateId,
          is_active: true
        })
      })

      const results = await Promise.all(promises)
      const successCount = results.filter(result => result !== null).length

      if (successCount > 0) {
        alert(`${successCount} estado(s) adicionado(s) ao seu tenant com sucesso!`)
        router.push('/admin/locations/states')
      } else {
        alert('Erro ao adicionar estados ao tenant')
      }
    } catch (error) {
      console.error('Erro ao adicionar estados ao tenant:', error)
      alert('Erro ao adicionar estados ao tenant')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  return (
    <AdminLayout title="Adicionar Estados" subtitle="Selecione um país e adicione estados ao seu tenant">
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
          <h1 className="text-3xl font-bold text-gray-900">Adicionar Estados</h1>
        </div>

        <div className="max-w-4xl">
          {/* Seção de Seleção de País */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <MapPin className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Selecionar País do Tenant</h2>
            </div>

            {isLoadingCountries ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Carregando países...</p>
              </div>
            ) : tenantCountries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum país encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Você precisa ter pelo menos um país cadastrado no seu tenant
                </p>
                <Button
                  onClick={() => router.push('/admin/locations/countries/create')}
                  variant="primary"
                >
                  Adicionar País
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tenantCountries.map((country) => (
                  <button
                    key={country.id}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`p-3 text-left border rounded-lg transition-colors ${
                      selectedCountry?.id === country.id
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium" style={{color: 'black'}}>{country.name}</div>
                    <div className="text-sm text-gray-600">
                      {country.code} {country.phone_code && `• ${country.phone_code}`}
                    </div>
                    {country.currency && (
                      <div className="text-xs text-gray-500">{country.currency}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Seção de Seleção de Estados */}
          {selectedCountry && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-green-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Estados de {selectedCountry.name}
                  </h2>
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    onClick={handleSelectAll}
                    variant="outline"
                    size="sm"
                    icon={<CheckSquare className="w-4 h-4" />}
                  >
                    Marcar Todos
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDeselectAll}
                    variant="outline"
                    size="sm"
                    icon={<Square className="w-4 h-4" />}
                  >
                    Desmarcar Todos
                  </Button>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm">
                  <strong>País selecionado:</strong> {selectedCountry.name} ({selectedCountry.code})
                </p>
                <p className="text-green-700 text-xs mt-1">
                  Selecione os estados que deseja adicionar ao seu tenant
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Estado
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite o nome ou código do estado..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" style={{color: 'black'}} 
                />
              </div>

              {isLoadingStates ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Carregando estados...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {filteredStates.map((state) => (
                    <label
                      key={state.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedStates.has(state.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedStates.has(state.id)}
                          onChange={() => handleStateToggle(state.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-3" style={{color: 'black'}}
                        />
                        <div className="flex-1">
                          <div className="font-medium" style={{color: 'black'}}>{state.name}</div>
                          <div className="text-sm text-gray-600">{state.code}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {filteredStates.length === 0 && !isLoadingStates && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum estado encontrado
                </div>
              )}

              {selectedStates.size > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>{selectedStates.size}</strong> estado(s) selecionado(s)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botões de Ação */}
          {selectedCountry && selectedStates.size > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  onClick={() => router.back()}
                  variant="outline"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleSubmit()}
                  variant="primary"
                  disabled={isLoading}
                  icon={<Save className="w-4 h-4" />}
                >
                  {isLoading ? 'Adicionando...' : `Adicionar ${selectedStates.size} Estado(s)`}
                </Button>
              </div>
            </div>
          )}

          {!selectedCountry && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione um país
              </h3>
              <p className="text-gray-600">
                Escolha um país da lista acima para ver os estados disponíveis
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
