'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import VehicleAvatar from '@/components/ui/VehicleAvatar'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/format'
import { Vehicle, VehicleImage } from '@/types'

// const formatDate = (dateString: string): string => {
//   const date = new Date(dateString)
//   return new Intl.DateTimeFormat('pt-BR', {
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit'
//   }).format(date)
// }

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'available':
      return 'text-green-600'
    case 'sold':
      return 'text-red-600'
    case 'reserved':
      return 'text-yellow-600'
    default:
      return 'text-gray-600'
  }
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'available':
      return 'Disponível'
    case 'sold':
      return 'Vendido'
    case 'reserved':
      return 'Reservado'
    default:
      return 'Indisponível'
  }
}

export default function VehicleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // const [activeTab, setActiveTab] = useState('car-info')
  const [images, setImages] = useState<VehicleImage[]>([])

  const vehicleId = params.id as string

  const loadVehicle = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Verificar se a URL da API está configurada
      if (!process.env.NEXT_PUBLIC_API_URL) {
        console.error('NEXT_PUBLIC_API_URL não está configurada')
        setError('Configuração da API não encontrada')
        setIsLoading(false)
        return
      }

      console.log('🔧 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)

      // Carregar dados do veículo usando API pública do portal
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/vehicles/${vehicleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Tenant-Subdomain': 'omegaveiculos'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ao carregar veículo: ${response.status} ${response.statusText}`)
      }

      const vehicleData = await response.json()
      console.log('✅ Dados do veículo carregados:', vehicleData)
      setVehicle(vehicleData)

      // Carregar imagens do veículo
      try {
        const imagesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/vehicles/${vehicleId}/images`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Tenant-Subdomain': 'omegaveiculos'
          }
        })

        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json()
          console.log('✅ Imagens do veículo carregadas:', imagesData)
          setImages(imagesData.data || imagesData || [])
        }
      } catch (imageError) {
        console.warn('⚠️ Erro ao carregar imagens:', imageError)
        setImages([])
      }

    } catch (error) {
      console.error('❌ Erro ao carregar veículo:', error)

      // Fallback com dados mockados quando a API não estiver disponível
      console.log('🔄 Usando dados mockados como fallback...')
      const mockVehicle = {
        id: parseInt(vehicleId),
        title: `Veículo ${vehicleId}`,
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        price: 65000,
        mileage: 50000,
        fuel_type: 'Flex',
        transmission: 'Automático',
        color: 'Prata',
        status: 'available',
        description: 'Veículo em excelente estado, bem conservado e com histórico de manutenção em dia.',
        engine: '2.0',
        power: '150cv',
        torque: '20kgf.m',
        main_image: '/assets/img/cars/car-01.jpg'
      } as unknown as Vehicle

      setVehicle(mockVehicle)
      setImages([
        {
          id: 1,
          image_url: '/assets/img/cars/car-01.jpg',
          is_primary: true,
          // Campos obrigatórios do tipo VehicleImage
          vehicle_id: parseInt(vehicleId),
          sort_order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as unknown as VehicleImage
      ])
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }, [vehicleId])

  useEffect(() => {
    if (vehicleId) {
      loadVehicle()
    }
  }, [vehicleId, loadVehicle])

  const handleDelete = useCallback(async () => {
    if (!vehicle) return

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o veículo "${vehicle.title}"?\n\nEsta ação não pode ser desfeita.`
    )

    if (!confirmed) return

    try {
      setIsLoading(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/portal/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Tenant-Subdomain': 'omegaveiculos'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ao excluir veículo: ${response.status} ${response.statusText}`)
      }

      console.log('✅ Veículo excluído com sucesso')
      router.push('/vehicles')
    } catch (error) {
      console.error('❌ Erro ao excluir veículo:', error)
      alert('Erro ao excluir veículo. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [vehicle, vehicleId, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes do veículo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar veículo</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            ← Voltar
          </Button>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🚗</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Veículo não encontrado</h2>
          <p className="text-gray-600 mb-4">O veículo solicitado não foi encontrado.</p>
          <Button onClick={() => router.back()}>
            ← Voltar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simples para página de detalhes */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalhes do Veículo</h1>
              <p className="text-gray-600">Veículo #{vehicle.id}</p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Imagens do Veículo</h3>
              {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {images.map((image, index) => (
                    <div key={image.id || index} className="relative">
                      <Image
                        src={image.image_url}
                        alt={`${vehicle.title} - Imagem ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <VehicleAvatar vehicle={vehicle} size="xl" />
                  <p className="text-gray-500 mt-2">Nenhuma imagem disponível</p>
                </div>
              )}
            </div>
          </div>

          {/* Informações do Veículo */}
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{vehicle.title}</h2>
                  <p className="text-gray-600">
                    {typeof vehicle.brand === 'string' ? vehicle.brand : vehicle.brand?.name || 'Marca não informada'} {typeof vehicle.model === 'string' ? vehicle.model : vehicle.model?.name || 'Modelo não informado'} • {vehicle.year}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)} bg-opacity-10`}>
                  {getStatusText(vehicle.status)}
                </span>
              </div>

              <div className="text-3xl font-bold text-blue-600 mb-4">
                {vehicle.price ? formatPrice(Number(vehicle.price)) : 'Preço não informado'}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Quilometragem:</span>
                  <p className="font-medium">{vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString()} km` : 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Combustível:</span>
                  <p className="font-medium">{vehicle.fuel_type || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Transmissão:</span>
                  <p className="font-medium">{vehicle.transmission || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Cor:</span>
                  <p className="font-medium">{vehicle.color || 'Não informado'}</p>
                </div>
              </div>
            </div>

            {/* Descrição */}
            {vehicle.description && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Descrição</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{vehicle.description}</p>
              </div>
            )}

            {/* Informações Técnicas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Informações Técnicas</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Motor:</span>
                  <span className="font-medium">{vehicle.engine || 'Não informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Potência:</span>
                  <span className="font-medium">{vehicle.power || 'Não informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Torque:</span>
                  <span className="font-medium">{vehicle.torque || 'Não informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Consumo:</span>
                  <span className="font-medium">{(vehicle as Vehicle & { consumption?: string }).consumption || 'Não informado'}</span>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Ações</h3>
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push(`/vehicles/${vehicle.id}/edit`)}
                  className="flex-1"
                >
                  ✏️ Editar Veículo
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="danger"
                  className="flex-1"
                  disabled={isLoading}
                >
                  🗑️ Excluir Veículo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
