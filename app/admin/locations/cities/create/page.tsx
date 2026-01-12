'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Button from '@/components/ui/Button'
import { Building2, Save, ArrowLeft, CheckSquare, Square } from 'lucide-react'
import { locationApiHelpers } from '@/lib/location-api'
import { Country, State, City } from '@/types'

export default function CreateCitiesPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user} = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const [isLoadingStates, setIsLoadingStates] = useState(false)
  const [tenantCountries, setTenantCountries] = useState<Country[]>([])
  const [tenantStates, setTenantStates] = useState<State[]>([])
  const [publicCities, setPublicCities] = useState<City[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [selectedState, setSelectedState] = useState<State | null>(null)
  const [selectedCities, setSelectedCities] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  // Carregar países do tenant ao montar o componente
  useEffect(() => {
    if (isAuthenticated && !authLoading && user) {
      loadTenantCountries()
    }
  }, [isAuthenticated, authLoading, user])

  // Carregar estados do tenant quando um país for selecionado
  useEffect(() => {
    if (selectedCountry && user) {  // Add user check
      loadTenantStates(selectedCountry.id)
    }
  }, [selectedCountry, user])


  // Carregar cidades públicas quando um estado for selecionado
  useEffect(() => {
    if (selectedState && user) {  // Add user check
      loadPublicCities(selectedState.id)
    }
  }, [selectedState, user])


  const loadTenantCountries = async () => {
    setIsLoadingCountries(true)
    console.log('isAuthenticated:', isAuthenticated)
    console.log('User data:', user)
    console.log('Available user properties:', user ? Object.keys(user) : 'No user')

    try {
      const response = await locationApiHelpers.getTenantCountries(user) // <-- Pass user directly
      
      console.log('📦 Countries response:', response)
      
      // Handle the nested pagination structure
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // Backend returns: { success: true, data: { data: [...], current_page: 1, ... } }
        console.log('✅ Setting countries from nested data:', response.data.data)
        setTenantCountries(response.data.data || [])
      } else if (Array.isArray(response.data)) {
        // Fallback: if data is already an array
        console.log('✅ Setting countries from array:', response.data)
        setTenantCountries(response.data)
      } else {
        console.warn('⚠️ Unexpected response structure:', response)
        setTenantCountries([])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar países do tenant:', error)
      setTenantCountries([])
    } finally {
      setIsLoadingCountries(false)
    }
  }


  const loadTenantStates = async (countryId: number) => {
    setIsLoadingStates(true)
    try {
      const states = await locationApiHelpers.getTenantStatesByCountry(countryId)
      console.log('📦 States loaded:', states)
      
      // getTenantStatesByCountry already returns an array directly
      setTenantStates(states || [])
    } catch (error) {
      console.error('❌ Erro ao carregar estados do tenant:', error)
      setTenantStates([])
    } finally {
      setIsLoadingStates(false)
    }
  }


  const loadPublicCities = async (stateId: number) => {
    try {
      // This now returns an array directly
      const citiesArray = await locationApiHelpers.getPublicCitiesByState(stateId)
      console.log('📊 Cidades públicas carregadas:', citiesArray)
      setPublicCities(citiesArray || [])
    } catch (error) {
      console.error('Erro ao carregar cidades disponíveis:', error)
      setPublicCities([])
    }
  }

  // Filtrar cidades baseado no termo de busca
  const filteredCities = publicCities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (city.ibge_code && city.ibge_code.includes(searchTerm))
  )

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setSelectedState(null)
    setSelectedCities(new Set())
    setSearchTerm('')
  }

  const handleStateSelect = (state: State) => {
    setSelectedState(state)
    setSelectedCities(new Set())
    setSearchTerm('')
  }

  const handleCityToggle = (cityId: number) => {
    const newSelectedCities = new Set(selectedCities)
    if (newSelectedCities.has(cityId)) {
      newSelectedCities.delete(cityId)
    } else {
      newSelectedCities.add(cityId)
    }
    setSelectedCities(newSelectedCities)
  }

  const handleSelectAll = () => {
    setSelectedCities(new Set(filteredCities.map(city => city.id)))
  }

  const handleDeselectAll = () => {
    setSelectedCities(new Set())
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (selectedCities.size === 0) {
      alert('Selecione pelo menos uma cidade para adicionar ao tenant')
      return
    }

    setIsLoading(true)

    try {
      const promises = Array.from(selectedCities).map(cityId => {
        return locationApiHelpers.createTenantCity({
          city_id: cityId,
          is_active: true
        })
      })

      const results = await Promise.all(promises)
      const successCount = results.filter(result => result !== null).length

      if (successCount > 0) {
        alert(`${successCount} cidade(s) adicionada(s) ao seu tenant com sucesso!`)
        router.push('/admin/locations/cities')
      } else {
        alert('Erro ao adicionar cidades ao tenant')
      }
    } catch (error) {
      console.error('Erro ao adicionar cidades ao tenant:', error)
      alert('Erro ao adicionar cidades ao tenant')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  return (
    <AdminLayout title="Adicionar Cidades" subtitle="Selecione país, estado e adicione cidades ao seu tenant">
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
          <h1 className="text-3xl font-bold text-gray-900">Adicionar Cidades</h1>
        </div>

        <div className="max-w-4xl">
          {/* Seção de Seleção de País */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center mb-6">
              <Building2 className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">1. Selecionar País do Tenant</h2>
            </div>

            {isLoadingCountries ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Carregando países...</p>
              </div>
            ) : tenantCountries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                    <div style={{color: 'black'}} className="font-medium">{country.name}</div>
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
                <Building2 className="h-6 w-6 text-green-600 mr-3" />
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
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                      <div style={{color: 'black'}} className="font-medium">{state.name}</div>
                      <div className="text-sm text-gray-600">{state.code}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Seção de Seleção de Cidades */}
          {selectedState && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Building2 className="h-6 w-6 text-orange-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    3. Cidades de {selectedState.name}
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

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-orange-800 text-sm">
                  <strong>Estado selecionado:</strong> {selectedState.name} ({selectedState.code})
                </p>
                <p className="text-orange-700 text-xs mt-1">
                  Selecione as cidades que deseja adicionar ao seu tenant
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Cidade
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite o nome da cidade ou código IBGE..."
                  className="w-full px-3 py-2 border border-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" style={{color: 'black'}}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {filteredCities.map((city) => (
                  <label
                    key={city.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCities.has(city.id)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCities.has(city.id)}
                        onChange={() => handleCityToggle(city.id)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mr-3"
                      />
                      <div className="flex-1">
                        <div style={{color: 'black'}} className="font-medium">{city.name}</div>
                        {city.ibge_code && (
                          <div className="text-sm text-gray-600">IBGE: {city.ibge_code}</div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {filteredCities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma cidade encontrada
                </div>
              )}

              {selectedCities.size > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>{selectedCities.size}</strong> cidade(s) selecionada(s)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botões de Ação */}
          {selectedState && selectedCities.size > 0 && (
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
                  {isLoading ? 'Adicionando...' : `Adicionar ${selectedCities.size} Cidade(s)`}
                </Button>
              </div>
            </div>
          )}

          {!selectedCountry && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
