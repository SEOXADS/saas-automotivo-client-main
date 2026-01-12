'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Vehicle, VehicleBrand, VehicleFilters } from '@/types'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { initializeMessages } from '@/lib/messages'
import { showSuccess, showError } from '@/lib/swal'
import { formatPrice } from '@/lib/format'
import VehicleAvatar from '@/components/ui/VehicleAvatar'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'

export default function VehiclesPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Dados
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [brands, setBrands] = useState<VehicleBrand[]>([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  })

  // Filtros
  const [filters, setFilters] = useState<VehicleFilters>({
    search: '',
    brand_id: undefined,
    price_min: undefined,
    price_max: undefined,
    fuel_type: undefined,
    transmission: undefined,
    page: 1,
    per_page: 10
  })

  // Verificar autenticação
  // Carregar veículos
  const loadVehicles = useCallback(async () => {
    try {
      setIsLoading(true)

      const { token, user } = useAuth.getState()
      if (!token) {
        showError('Token de autenticação não encontrado')
        return
      }

      if (!user?.tenant?.subdomain) {
        showError('Subdomínio do tenant não encontrado')
        return
      }

      // Verificar se está em modo demo
      const isDemoMode = token === 'demo_token_123' || token?.startsWith('fallback_')

      if (isDemoMode) {
        console.log('🎭 VehiclesPage: Modo demo detectado, usando dados mock')
        // Usar dados mock para modo demo
        const mockVehicles = [
          {
            id: 1,
            title: 'Toyota Corolla XEi',
            brand: { name: 'Toyota' },
            model: { name: 'Corolla' },
            year: 2022,
            price: '85000',
            mileage: 15000,
            fuel_type: 'Flex',
            transmission: 'Automático',
            color: 'Prata',
            status: 'available' as const,
            main_image: '/assets/img/cars/car-01-slide1.jpg',
            images: [
              { id: 1, url: '/assets/img/cars/car-01-slide1.jpg' },
              { id: 2, url: '/assets/img/cars/car-01-slide2.jpg' }
            ]
          },
          {
            id: 2,
            title: 'Honda Civic EXL',
            brand: { name: 'Honda' },
            model: { name: 'Civic' },
            year: 2021,
            price: '78000',
            mileage: 22000,
            fuel_type: 'Flex',
            transmission: 'Automático',
            color: 'Preto',
            status: 'available' as const,
            main_image: '/assets/img/cars/car-02-slide1.jpg',
            images: [
              { id: 3, url: '/assets/img/cars/car-02-slide1.jpg' },
              { id: 4, url: '/assets/img/cars/car-02-slide2.jpg' }
            ]
          }
        ] as unknown as Vehicle[] // Converter para unknown primeiro para evitar erro de tipo

        setVehicles(mockVehicles)
        setPagination(prev => ({ ...prev, total: mockVehicles.length }))
        setIsLoading(false)
        console.log('✅ VehiclesPage: Veículos mock carregados:', mockVehicles.length)
        return
      }

      // Construir URL de forma mais robusta
      const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/vehicles`
      const queryParams = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
        sort: 'created_at',
        order: 'desc',
        include: 'images,main_image',
        exclude_status: 'deleted'
      })

      // Adicionar filtros apenas se estiverem definidos
      if (filters.search && filters.search.trim()) {
        queryParams.append('search', filters.search.trim())
      }

      if (filters.brand_id !== undefined && filters.brand_id !== null) {
        queryParams.append('brand_id', filters.brand_id.toString())
      }

      if (filters.price_min !== undefined && filters.price_min !== null) {
        queryParams.append('price_min', filters.price_min.toString())
      }

      if (filters.price_max !== undefined && filters.price_max !== null) {
        queryParams.append('price_max', filters.price_max.toString())
      }

      if (filters.fuel_type !== undefined && filters.fuel_type !== null && filters.fuel_type !== '') {
        queryParams.append('fuel_type', filters.fuel_type)
      }

      if (filters.transmission !== undefined && filters.transmission !== null && filters.transmission !== '') {
        queryParams.append('transmission', filters.transmission)
      }

      const url = `${baseUrl}?${queryParams.toString()}`

      console.log('🔍 URL base da API:', process.env.NEXT_PUBLIC_API_URL)
      console.log('🔗 URL completa para veículos:', url)

      // Sistema de retry para erros 500
      let response: Response | null = null
      let retryCount = 0
      const maxRetries = 2

      while (retryCount <= maxRetries) {
        try {
          console.log(`🔄 Tentativa ${retryCount + 1} de carregar veículos...`)

          response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Tenant-Subdomain': user.tenant.subdomain,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          })

          if (response.ok) {
            console.log('✅ Veículos carregados com sucesso na tentativa', retryCount + 1)
            console.log('🔍 Status da resposta:', response.status)
            console.log('🔍 Headers da resposta:', Object.fromEntries(response.headers.entries()))
            break
          }

          // Se for erro 500 e ainda há tentativas, aguardar e tentar novamente
          if (response.status === 500 && retryCount < maxRetries) {
            console.log(`⚠️ Erro 500 na tentativa ${retryCount + 1}, aguardando 2 segundos...`)
            await new Promise(resolve => setTimeout(resolve, 2000))
            retryCount++
            continue
          }

          // Se não for erro 500 ou acabaram as tentativas, parar
          break

        } catch (fetchError) {
          console.error(`❌ Erro de fetch na tentativa ${retryCount + 1}:`, fetchError)

          if (retryCount < maxRetries) {
            console.log(`⚠️ Aguardando 2 segundos antes da próxima tentativa...`)
            await new Promise(resolve => setTimeout(resolve, 2000))
            retryCount++
            continue
          }

          throw fetchError
        }
      }

      // Verificar se temos uma resposta válida
      if (!response) {
        throw new Error('Falha ao obter resposta da API após todas as tentativas')
      }

      if (!response.ok) {
        console.error('❌ API Error:', response.status, response.statusText)
        console.error('🔍 URL chamada:', url)
        console.error('🔍 Headers enviados:', {
          'Authorization': `Bearer ${token ? token.substring(0, 20) + '...' : 'null'}`,
          'X-Tenant-Subdomain': user.tenant.subdomain,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        })

        // Tratamento específico por status
        if (response.status === 401) {
          throw new Error('Token de autenticação expirado ou inválido. Faça login novamente.')
        } else if (response.status === 403) {
          throw new Error('Acesso negado. Verifique suas permissões.')
        } else if (response.status === 404) {
          throw new Error('Endpoint de veículos não encontrado.')
        } else if (response.status === 422) {
          throw new Error('Parâmetros de requisição inválidos.')
        } else if (response.status === 500) {
          throw new Error('Erro interno do servidor. Tente novamente mais tarde.')
        } else {
          throw new Error(`Erro ao carregar veículos: ${response.status} ${response.statusText}`)
        }
      }

      const responseData = await response.json()

      // Debug: verificar estrutura dos dados retornados
      console.log('🔍 API Response:', responseData)
      console.log('📊 Vehicles data:', responseData.data)

      if (responseData.data && responseData.data.length > 0) {
        console.log('🚗 Primeiro veículo:', responseData.data[0])
        console.log('🖼️ Main image do primeiro veículo:', responseData.data[0].main_image)
        console.log('📷 Images array do primeiro veículo:', responseData.data[0].images)
        console.log('⭐ Imagem principal (main_image):', responseData.data[0].main_image?.image_url)

        // Debug adicional para entender a estrutura
        console.log('🔍 Estrutura completa do primeiro veículo:', JSON.stringify(responseData.data[0], null, 2))
        console.log('📋 Todas as chaves do primeiro veículo:', Object.keys(responseData.data[0]))

        // Verificar se há algum campo de imagem diferente
        if (responseData.data[0].main_image) {
          console.log('🖼️ Campos do main_image:', Object.keys(responseData.data[0].main_image))
        }
      }

      const vehiclesData = responseData.data || []

      // Se as imagens não vieram com os veículos, tentar carregar individualmente
      if (vehiclesData.length > 0 && !vehiclesData[0].images && !vehiclesData[0].main_image) {
        console.log('🖼️ Imagens não incluídas, carregando individualmente...')
        try {
          const vehiclesWithImages = await Promise.all(
                        vehiclesData.map(async (vehicle: Record<string, unknown>) => {
              try {
                const imageResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicles/${vehicle.id}/images`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Tenant-Subdomain': user.tenant.subdomain,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  }
                })

                if (imageResponse.ok) {
                  const imageData = await imageResponse.json()
                  const images = imageData.data?.images || []
                  const mainImage = images.find((img: { is_primary: boolean }) => img.is_primary) || images[0] || null

                  return {
                    ...vehicle,
                    images,
                    main_image: mainImage
                  }
                }
              } catch (error) {
                console.warn(`⚠️ Erro ao carregar imagens do veículo ${vehicle.id}:`, error)
              }

              return vehicle
            })
          )

          setVehicles(vehiclesWithImages)
        } catch (error) {
          console.warn('⚠️ Erro ao carregar imagens individuais, usando veículos sem imagens:', error)
          setVehicles(vehiclesData)
        }
      } else {
        setVehicles(vehiclesData)
      }

      setPagination({
        current_page: responseData.current_page || 1,
        per_page: responseData.per_page || 10,
        total: responseData.total || 0,
        last_page: responseData.last_page || 1
      })

    } catch (error) {
      console.error('Erro ao carregar veículos:', error)
      showError('Erro ao carregar veículos')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.current_page, pagination.per_page, filters])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    // Inicializar sistema de mensagens
    initializeMessages('vehicles')

    loadVehicles()
    loadBrands()
  }, [isAuthenticated, router, loadVehicles])

  // Carregar marcas
  const loadBrands = async () => {
    try {
      // Obter token JWT do estado de autenticação
      const { token } = useAuth.getState()
      if (!token) {
        console.error('❌ VehiclesPage: Token JWT não encontrado para marcas')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        console.log('⚠️ VehiclesPage: API retornou erro para marcas:', response.status, response.statusText)
        return
      }

      const brandsData = await response.json()

      // Verificar se é array direto ou objeto com estrutura { success, data }
      let brandsArray: VehicleBrand[] = []

      if (Array.isArray(brandsData)) {
        // API retorna array direto: [{...}, {...}, ...]
        brandsArray = brandsData
      } else if (brandsData.success && brandsData.data && Array.isArray(brandsData.data)) {
        // API retorna objeto estruturado: { success: true, data: [...], message: "..." }
        brandsArray = brandsData.data
      } else {
        console.log('⚠️ VehiclesPage: Formato de resposta inválido para marcas:', brandsData)
        brandsArray = []
      }

      setBrands(brandsArray)
    } catch (error) {
      console.error('❌ VehiclesPage: Erro ao carregar marcas:', error)
    }
  }



  // Aplicar filtros
  const applyFilters = () => {
    setFilters((prev: VehicleFilters) => ({ ...prev, page: 1 }))
  }

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      brand_id: undefined,
      price_min: undefined,
      price_max: undefined,
      fuel_type: undefined,
      transmission: undefined,
      page: 1,
      per_page: 10
    })
  }

  // Atualizar filtros
  const updateFilter = (key: keyof VehicleFilters, value: string | number | undefined) => {
    setFilters((prev: VehicleFilters) => ({ ...prev, [key]: value }))
  }

  // Mudar página
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current_page: page }))
  }

  // Mudar itens por página
  const handlePerPageChange = (newPerPage: number) => {
    setPagination(prev => ({ ...prev, per_page: newPerPage, current_page: 1 }))
    setFilters(prev => ({ ...prev, per_page: newPerPage, page: 1 }))
  }

  // Alterar status do veículo
  const handleStatusChange = async (vehicleId: number, newStatus: string) => {
    try {
      const { token, user } = useAuth.getState()
      if (!token) {
        showError('Token de autenticação não encontrado')
        return
      }

      if (!user?.tenant?.subdomain) {
        showError('Subdomínio do tenant não encontrado')
        return
      }

      console.log('🔄 Alterando status do veículo:', { vehicleId, newStatus })

      // Preparar dados para atualização
      const updateData: { status: string; is_active?: number } = {
        status: newStatus
      }

      // Se for exclusão, marcar como inativo também
      if (newStatus === 'maintenance') {
        updateData.is_active = 0
      }

      console.log('📤 Dados para atualização:', updateData)

      // Atualizar o veículo
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': user.tenant.subdomain,
        },
        body: JSON.stringify(updateData)
      })

      console.log('📡 Resposta da API:', response.status, response.statusText)

      if (!response.ok) {
        let errorMessage = 'Erro ao alterar status do veículo'

        try {
          const responseText = await response.text()
          console.log('📋 Resposta bruta da API:', responseText)

          if (responseText.trim()) {
            const errorData = JSON.parse(responseText)
            console.error('📋 Detalhes do erro:', errorData)

            // Tentar diferentes campos de mensagem
            errorMessage = errorData.message ||
                          errorData.error ||
                          errorData.errors?.status?.[0] ||
                          errorData.data?.message ||
                          errorMessage
          } else {
            console.warn('⚠️ Resposta vazia da API')
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
        } catch (parseError) {
          console.warn('⚠️ Não foi possível fazer parse do erro:', parseError)
          errorMessage = `Erro ${response.status}: ${response.statusText}`
        }

        console.error('❌ Erro na API:', response.status, errorMessage)

        // Mensagens específicas por status HTTP
        if (response.status === 401) {
          throw new Error('Token de autenticação expirado ou inválido. Faça login novamente.')
        } else if (response.status === 403) {
          throw new Error('Acesso negado. Você não tem permissão para alterar este veículo.')
        } else if (response.status === 404) {
          throw new Error('Veículo não encontrado.')
        } else if (response.status === 422) {
          throw new Error('Dados inválidos. Verifique se o status é válido.')
        } else if (response.status === 500) {
          throw new Error('Erro interno do servidor. Tente novamente mais tarde.')
        } else {
          throw new Error(errorMessage)
        }
      }

      const result = await response.json()
      console.log('✅ Status alterado com sucesso:', result)

      // Recarregar veículos para atualizar a lista
      await loadVehicles()

      // Mostrar mensagem de sucesso
      const statusText = newStatus === 'maintenance' ? 'excluído permanentemente' :
                        newStatus === 'maintenance' ? 'colocado em manutenção' :
                        'disponibilizado'
      showSuccess(`Veículo ${statusText} com sucesso!`)

    } catch (error) {
      console.error('❌ Erro ao alterar status do veículo:', error)
      showError(error instanceof Error ? error.message : 'Erro ao alterar status do veículo')
    }
  }


  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Obter status do veículo
  const getVehicleStatus = (vehicle: Vehicle) => {
    if (vehicle.status === 'available') return 'Disponível'
    if (vehicle.status === 'sold') return 'Vendido'
    if (vehicle.status === 'reserved') return 'Reservado'
    if (vehicle.status === 'maintenance') return 'Manutenção'
    return 'Indisponível'
  }

  // Obter cor do status
  const getStatusColor = (vehicle: Vehicle) => {
    if (vehicle.status === 'available') return 'bg-green-100 text-green-800'
    if (vehicle.status === 'sold') return 'bg-red-100 text-red-800'
    if (vehicle.status === 'reserved') return 'bg-yellow-100 text-yellow-800'
    if (vehicle.status === 'maintenance') return 'bg-orange-100 text-orange-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>
  }

  return (
    <AdminLayout title="Veículos" subtitle="Gerencie seu estoque de veículos">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Veículos</h1>
              <p className="text-gray-600 mt-2">Gerencie seu estoque de veículos</p>
            </div>
            <Button
              onClick={() => router.push('/admin/vehicles/create')}
              variant="primary"
              size="lg"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
            >
              Novo Veículo
            </Button>
          </div>

          {/* Estatísticas */}
          <div className="mt-8 mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Veículos</p>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {vehicles.filter(v => v.status === 'available').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-xl">
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vendidos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {vehicles.filter(v => v.status === 'sold').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPrice(vehicles.reduce((sum, v) => sum + parseFloat(v.price), 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mensagens de erro e sucesso */}
          {/* Filtros */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Título, marca, modelo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <select
                  value={filters.brand_id || ''}
                  onChange={(e) => updateFilter('brand_id', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as marcas</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preço mínimo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço mínimo
                </label>
                <input
                  type="number"
                  value={filters.price_min || ''}
                  onChange={(e) => updateFilter('price_min', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="R$ 0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Preço máximo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço máximo
                </label>
                <input
                  type="number"
                  value={filters.price_max || ''}
                  onChange={(e) => updateFilter('price_max', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="R$ 0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-4">
              <div className="flex space-x-2">
                <Button
                  onClick={applyFilters}
                  variant="primary"
                  size="sm"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                >
                  Aplicar Filtros
                </Button>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                >
                  Limpar
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de veículos */}
          <div className="bg-white rounded-xl shadow-lg">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando veículos...</p>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">Nenhum veículo encontrado</p>
                <Button
                  onClick={() => router.push('/admin/vehicles/create')}
                  variant="primary"
                  size="md"
                  className="mt-4"
                >
                  Cadastrar primeiro veículo
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Veículo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <VehicleAvatar
                                vehicle={vehicle}
                                size="md"
                                className="h-12 w-12"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {vehicle.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {vehicle.brand?.name} • {vehicle.model?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {vehicle.model_year} • {vehicle.color} • {vehicle.mileage}km
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(parseFloat(vehicle.price))}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle)}`}>
                            {getVehicleStatus(vehicle)}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-sm text-gray-500">
                          {formatDate(vehicle.created_at)}
                        </td>
                        <td className="px-6 py-6 text-sm font-medium">
                          <div className="flex space-x-3">
                            <Button
                              onClick={() => {
                                try {
                                  if (vehicle.id) {
                                    router.push(`/admin/vehicles/${vehicle.id}`)
                                  } else {
                                    console.error('ID do veículo não encontrado:', vehicle)
                                  }
                                } catch (error) {
                                  console.error('Erro ao navegar para visualização:', error)
                                }
                              }}
                              variant="outline"
                              size="sm"
                              icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              }
                            >
                              Ver
                            </Button>
                            <Button
                              onClick={() => {
                                try {
                                  if (vehicle.id) {
                                    router.push(`/admin/vehicles/${vehicle.id}/edit`)
                                  } else {
                                    console.error('ID do veículo não encontrado:', vehicle)
                                  }
                                } catch (error) {
                                  console.error('Erro ao navegar para edição:', error)
                                }
                              }}
                              variant="success"
                              size="sm"
                              icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              }
                            >
                              Editar
                            </Button>
                            <Button
                              onClick={() => {
                                const newStatus = vehicle.status === 'available' ? 'maintenance' : 'available'
                                handleStatusChange(vehicle.id, newStatus)
                              }}
                              variant={vehicle.status === 'available' ? 'warning' : 'success'}
                              size="sm"
                              icon={
                                vehicle.status === 'available' ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )
                              }
                            >
                              {vehicle.status === 'available' ? 'Manutenção' : 'Disponível'}
                            </Button>
                            {/* <Button
                              onClick={async () => {
                                const confirmed = await showConfirm(
                                  `Tem certeza que deseja excluir permanentemente o veículo "${vehicle.title}"? O veículo será removido de todos os locais e não poderá ser recuperado.`,
                                  'Confirmar Exclusão Permanente',
                                  'Sim, excluir permanentemente',
                                  'Cancelar'
                                )
                                if (confirmed.isConfirmed) {
                                  handleStatusChange(vehicle.id, 'deleted')
                                }
                              }}
                              variant="danger"
                              size="sm"
                              icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              }
                            >
                              Excluir
                            </Button> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Paginação */}
          {vehicles.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.last_page}
                totalItems={pagination.total}
                perPage={pagination.per_page}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
                showPerPageSelector={true}
              />
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  )
}
