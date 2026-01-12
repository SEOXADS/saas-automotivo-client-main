'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { Home, Save, ArrowLeft, CheckSquare, Square } from 'lucide-react'
import { locationApiHelpers } from '@/lib/location-api'
import { Country, State, City, Neighborhood } from '@/types'

export default function CreateNeighborhoodsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const [isLoadingStates, setIsLoadingStates] = useState(false)
  const [isLoadingCities, setIsLoadingCities] = useState(false)
  const [tenantCountries, setTenantCountries] = useState<Country[]>([])
  const [tenantStates, setTenantStates] = useState<State[]>([])
  const [publicCities, setPublicCities] = useState<City[]>([])
  const [publicNeighborhoods, setPublicNeighborhoods] = useState<Neighborhood[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [selectedState, setSelectedState] = useState<State | null>(null)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  // Carregar países do tenant ao montar o componente
  useEffect(() => {
    loadTenantCountries()
  }, [])

  // Carregar estados do tenant quando um país for selecionado
  useEffect(() => {
    if (selectedCountry) {
      loadTenantStates(selectedCountry.id)
    }
  }, [selectedCountry])

  // Carregar cidades públicas quando um estado for selecionado
  useEffect(() => {
    if (selectedState) {
      loadPublicCities(selectedState.id)
    }
  }, [selectedState])

  // Carregar bairros públicos quando uma cidade for selecionada
  useEffect(() => {
    if (selectedCity) {
      loadPublicNeighborhoods(selectedCity.id)
    }
  }, [selectedCity])

  const loadTenantCountries = async () => {
    setIsLoadingCountries(true)
    try {
      const response = await locationApiHelpers.getTenantCountries()
      setTenantCountries(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar países do tenant:', error)
    } finally {
      setIsLoadingCountries(false)
    }
  }

  const loadTenantStates = async (countryId: number) => {
    setIsLoadingStates(true)
    try {
      const states = await locationApiHelpers.getTenantStatesByCountry(countryId)
      setTenantStates(states)
    } catch (error) {
      console.error('Erro ao carregar estados do tenant:', error)
      setTenantStates([])
    } finally {
      setIsLoadingStates(false)
    }
  }

  const loadPublicCities = async (stateId: number) => {
    setIsLoadingCities(true)
    try {
      const cities = await locationApiHelpers.getPublicCitiesByState(stateId)
      setPublicCities(cities)
    } catch (error) {
      console.error('Erro ao carregar cidades disponíveis:', error)
      setPublicCities([])
    } finally {
      setIsLoadingCities(false)
    }
  }

  const loadPublicNeighborhoods = async (cityId: number) => {
    try {
      const neighborhoods = await locationApiHelpers.getPublicNeighborhoodsByCity(cityId)
      setPublicNeighborhoods(neighborhoods)
    } catch (error) {
      console.error('Erro ao carregar bairros disponíveis:', error)
      setPublicNeighborhoods([])
    }
  }

  // Filtrar bairros baseado no termo de busca
  const filteredNeighborhoods = publicNeighborhoods.filter(neighborhood =>
    neighborhood.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (neighborhood.zip_code && neighborhood.zip_code.includes(searchTerm))
  )

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setSelectedState(null)
    setSelectedCity(null)
    setSelectedNeighborhoods(new Set())
    setSearchTerm('')
  }

  const handleStateSelect = (state: State) => {
    setSelectedState(state)
    setSelectedCity(null)
    setSelectedNeighborhoods(new Set())
    setSearchTerm('')
  }

  const handleCitySelect = (city: City) => {
    setSelectedCity(city)
    setSelectedNeighborhoods(new Set())
    setSearchTerm('')
  }

  const handleNeighborhoodToggle = (neighborhoodId: number) => {
    const newSelectedNeighborhoods = new Set(selectedNeighborhoods)
    if (newSelectedNeighborhoods.has(neighborhoodId)) {
      newSelectedNeighborhoods.delete(neighborhoodId)
    } else {
      newSelectedNeighborhoods.add(neighborhoodId)
    }
    setSelectedNeighborhoods(newSelectedNeighborhoods)
  }

  const handleSelectAll = () => {
    setSelectedNeighborhoods(new Set(filteredNeighborhoods.map(neighborhood => neighborhood.id)))
  }

  const handleDeselectAll = () => {
    setSelectedNeighborhoods(new Set())
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (selectedNeighborhoods.size === 0) {
      alert('Selecione pelo menos um bairro para adicionar ao tenant')
      return
    }

    setIsLoading(true)

    try {
      const promises = Array.from(selectedNeighborhoods).map(neighborhoodId => {
        return locationApiHelpers.createTenantNeighborhood({
          neighborhood_id: neighborhoodId,
          is_active: true
        })
      })

      const results = await Promise.all(promises)
      const successCount = results.filter(result => result !== null).length

      if (successCount > 0) {
        alert(`${successCount} bairro(s) adicionado(s) ao seu tenant com sucesso!`)
        router.push('/admin/locations/neighborhoods')
      } else {
        alert('Erro ao adicionar bairros ao tenant')
      }
    } catch (error) {
      console.error('Erro ao adicionar bairros ao tenant:', error)
      alert('Erro ao adicionar bairros ao tenant')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  return (
    <AdminLayout title="Adicionar Bairros" subtitle="Selecione país, estado, cidade e adicione bairros ao seu tenant">
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
          <h1 className="text-3xl font-bold text-gray-900">Adicionar Bairros</h1>
        </div>

        <div className="max-w-4xl">
          {/* Seção de Seleção de País */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <Home className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">1. Selecionar País do Tenant</h2>
            </div>

            {isLoadingCountries ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Carregando países...</p>
              </div>
            ) : tenantCountries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                    <div className="font-medium">{country.name}</div>
                    <div className="text-sm text-gray-600">
                      {country.code} {country.phone_code && `• ${country.phone_code}`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Seção de Seleção de Estado */}
          {selectedCountry && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center mb-6">
                <Home className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">2. Selecionar Estado do Tenant</h2>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm">
                  <strong>País selecionado:</strong> {selectedCountry.name} ({selectedCountry.code})
                </p>
              </div>

              {isLoadingStates ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Carregando estados...</p>
                </div>
              ) : tenantStates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum estado encontrado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Você precisa ter pelo menos um estado cadastrado para este país
                  </p>
                  <Button
                    onClick={() => router.push('/admin/locations/states/create')}
                    variant="primary"
                  >
                    Adicionar Estados
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tenantStates.map((state) => (
                    <button
                      key={state.id}
                      type="button"
                      onClick={() => handleStateSelect(state)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        selectedState?.id === state.id
                          ? 'border-green-500 bg-green-50 text-green-900'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{state.name}</div>
                      <div className="text-sm text-gray-600">{state.code}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Seção de Seleção de Cidade */}
          {selectedState && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center mb-6">
                <Home className="h-6 w-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">3. Selecionar Cidade</h2>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-orange-800 text-sm">
                  <strong>Estado selecionado:</strong> {selectedState.name} ({selectedState.code})
                </p>
              </div>

              {isLoadingCities ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Carregando cidades...</p>
                </div>
              ) : publicCities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma cidade encontrada
                  </h3>
                  <p className="text-gray-600">
                    Não há cidades disponíveis para este estado
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {publicCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleCitySelect(city)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        selectedCity?.id === city.id
                          ? 'border-orange-500 bg-orange-50 text-orange-900'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{city.name}</div>
                      {city.ibge_code && (
                        <div className="text-sm text-gray-600">IBGE: {city.ibge_code}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Seção de Seleção de Bairros */}
          {selectedCity && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Home className="h-6 w-6 text-purple-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    4. Bairros de {selectedCity.name}
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

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <p className="text-purple-800 text-sm">
                  <strong>Cidade selecionada:</strong> {selectedCity.name}
                  {selectedCity.ibge_code && ` (IBGE: ${selectedCity.ibge_code})`}
                </p>
                <p className="text-purple-700 text-xs mt-1">
                  Selecione os bairros que deseja adicionar ao seu tenant
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Bairro
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite o nome do bairro ou CEP..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {filteredNeighborhoods.map((neighborhood) => (
                  <label
                    key={neighborhood.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedNeighborhoods.has(neighborhood.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedNeighborhoods.has(neighborhood.id)}
                        onChange={() => handleNeighborhoodToggle(neighborhood.id)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{neighborhood.name}</div>
                        {neighborhood.zip_code && (
                          <div className="text-sm text-gray-600">CEP: {neighborhood.zip_code}</div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {filteredNeighborhoods.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum bairro encontrado
                </div>
              )}

              {selectedNeighborhoods.size > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>{selectedNeighborhoods.size}</strong> bairro(s) selecionado(s)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botões de Ação */}
          {selectedCity && selectedNeighborhoods.size > 0 && (
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
                  {isLoading ? 'Adicionando...' : `Adicionar ${selectedNeighborhoods.size} Bairro(s)`}
                </Button>
              </div>
            </div>
          )}

          {!selectedCountry && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione um país
              </h3>
              <p className="text-gray-600">
                Escolha um país da lista acima para começar
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
