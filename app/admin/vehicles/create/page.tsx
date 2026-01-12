'use client'

import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { VehicleFormData, VehicleBrand, VehicleModel, DEFAULT_VEHICLE_CHARACTERISTICS, DEFAULT_VEHICLE_OPTIONALS } from '@/types'
import Select2 from '@/components/ui/Select2'
import Collapse from '@/components/ui/Collapse'
import { showSuccess, showError, showLoading, showWarning } from '@/lib/swal'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { uploadVehicleImage } from '@/lib/api'

export default function CreateVehiclePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  // Estados do formulário
  const [formData, setFormData] = useState<VehicleFormData>({
    // Relacionamentos
    brand_id: 0,
    model_id: 0,
    vehicle_type: 'car',
    condition: 'new',
    title: '',
    version: '',
    year: new Date().getFullYear(),
    model_year: new Date().getFullYear(),
    color: 'white',
    fuel_type: 'gasoline',
    transmission: 'manual',
    doors: 4,
    mileage: 0,
    hide_mileage: 0,
    price: 0,
    classified_price: 0,
    fipe_price: 0,
    cost_type: 'sale',
    engine: '',
    power: '',
    torque: '',
    consumption_city: '',
    consumption_highway: '',
    description: '',
    use_same_observation: 0,
    custom_observation: '',
    classified_observations: [],
    standard_features: [],
    optional_features: [],
    plate: '',
    chassi: '',
    renavam: '',
    video_link: '',
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    accept_financing: 0,
    accept_exchange: 0,
    is_featured: 0,
    is_licensed: 0,
    has_warranty: 0,
    is_adapted: 0,
    is_armored: 0,
    has_spare_key: 0,
    ipva_paid: 0,
    has_manual: 0,
    auction_history: 0,
    dealer_serviced: 0,
    single_owner: 0,
    is_active: 1,
    views: 0,
    status: 'available',
    images: []
  })

  // Dados para o formulário
  const [brands, setBrands] = useState<VehicleBrand[]>([])
  const [models, setModels] = useState<VehicleModel[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<number>(0)

  // Carregar marcas
  const loadBrands = async () => {
    try {
      const token = useAuth.getState().token
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar marcas')
      }

      const data = await response.json()
      setBrands(data.data || data)
    } catch (error) {
      console.error('Erro ao carregar marcas:', error)
      showError('Erro ao carregar marcas')
    }
  }

  // Carregar modelos com fallback inteligente para FIPE
  const loadModels = async (brandId: number) => {
    try {
      const token = useAuth.getState().token
      if (!token) return

      console.log('🔍 Tentando carregar modelos da API local...')

      // Primeiro, tentar buscar modelos na API local
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands/${brandId}/models`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': useAuth.getState().user?.tenant.subdomain || 'demo',
        }
      })

      if (response.ok) {
        const data = await response.json()
        const localModels = data.data || data

        if (localModels && localModels.length > 0) {
          console.log('✅ Modelos encontrados na API local:', localModels.length)
          setModels(localModels)
          return
        }
      }

      // Se não encontrou modelos na API local, tentar FIPE
      console.log('⚠️ Nenhum modelo encontrado na API local, tentando FIPE...')

      try {
        // Determinar o tipo de veículo baseado na marca selecionada
        const selectedBrand = brands.find(b => b.id === brandId)
        if (!selectedBrand) {
          console.log('❌ Marca não encontrada para determinar tipo de veículo')
          setModels([])
          return
        }

        // Mapear tipo de veículo (assumindo que é 'car' por padrão)
        const vehicleType = 'cars' as const

        console.log(`🌐 Buscando modelos FIPE para marca ${selectedBrand.name} (${vehicleType})`)

        const fipeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fipe/brands/${vehicleType}/${brandId}/models`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Subdomain': useAuth.getState().user?.tenant.subdomain || 'demo',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        if (fipeResponse.ok) {
          const fipeData = await fipeResponse.json()
          const fipeModels = fipeData.data || fipeData

          if (fipeModels && fipeModels.length > 0) {
            console.log('✅ Modelos encontrados na API FIPE:', fipeModels.length)

            // Converter modelos FIPE para o formato local
            const convertedModels = fipeModels.map((fipeModel: {
              id: number
              name: string
              brand_id: number
              is_active: boolean
              created_at?: string
              updated_at?: string
            }) => ({
              id: fipeModel.id,
              name: fipeModel.name,
              brand_id: fipeModel.brand_id,
              is_active: fipeModel.is_active,
              created_at: fipeModel.created_at,
              updated_at: fipeModel.updated_at
            }))

            setModels(convertedModels)
            return
          }
        }

        console.log('⚠️ Nenhum modelo encontrado na API FIPE também')
        setModels([])

      } catch (fipeError) {
        console.error('❌ Erro ao buscar modelos FIPE:', fipeError)
        setModels([])
      }

    } catch (error) {
      console.error('❌ Erro ao carregar modelos:', error)
      setModels([])
    }
  }

  // Carregar dados iniciais
  const loadInitialData = useCallback(async () => {
    try {
      await loadBrands()
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error)
      showError('Erro ao carregar dados iniciais')
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Inicializar sistema de mensagens
    // Removed initializeMessages as it's not imported

    loadInitialData()
  }, [isAuthenticated, router, loadInitialData])

  // Montar título automaticamente
  useEffect(() => {
    const brandName = brands.find(b => b.id === formData.brand_id)?.name || ''
    const modelName = models.find(m => m.id === formData.model_id)?.name || ''

    const transmissionLabelMap: Record<string, string> = {
      manual: 'Manual',
      automatico: 'Automático',
      cvt: 'CVT',
      semi_automatico: 'Semi-automático'
    }
    const transmissionLabel = transmissionLabelMap[formData.transmission] || formData.transmission || ''

    const parts = [brandName, modelName, formData.version, transmissionLabel, formData.color, String(formData.year)].filter(Boolean)
    const computedTitle = parts.join(' ')

    if (computedTitle && computedTitle !== formData.title) {
      setFormData(prev => ({ ...prev, title: computedTitle }))
    }
  }, [brands, models, formData.brand_id, formData.model_id, formData.version, formData.transmission, formData.color, formData.year, formData.title])

  // Funções de máscara para formatação
  const formatCurrency = (value: string | number): string => {
    if (!value || value === '0') return 'R$ 0,00'
    const numericValue = typeof value === 'string' ? value.replace(/\D/g, '') : String(value)
    if (!numericValue) return 'R$ 0,00'

    const number = parseInt(numericValue, 10)
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number / 100)
  }

  const removeCurrencyMask = (value: string): string => {
    return value.replace(/\D/g, '')
  }

  const formatChassi = (value: string): string => {
    if (!value) return ''
    const cleanValue = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    return cleanValue.slice(0, 17)
  }

  const removeChassiMask = (value: string): string => {
    return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  }

  const formatRenavam = (value: string): string => {
    if (!value) return ''
    const cleanValue = value.replace(/\D/g, '').slice(0, 11)
    return cleanValue
  }

  const removeRenavamMask = (value: string): string => {
    return value.replace(/\D/g, '')
  }

  // Manipular mudanças no formulário
  const handleInputChange = (field: keyof VehicleFormData, value: string | number | boolean) => {
    console.log(`🔄 Campo ${field} alterado para:`, value)
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Manipular seleção de marca
  const handleBrandChange = (brandId: number) => {
    setSelectedBrandId(brandId)
    setFormData(prev => ({ ...prev, brand_id: brandId, model_id: 0 }))
    setModels([])
    if (brandId > 0) {
      loadModels(brandId)
    }
  }

  // Manipular upload de imagens
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }))
  }

  // Remover imagem
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  // Adicionar informação de classificado
  const addClassifiedInfo = () => {
    setFormData(prev => ({
      ...prev,
      classified_observations: [...prev.classified_observations, '']
    }))
  }

  // Remover informação de classificado
  const removeClassifiedInfo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      classified_observations: prev.classified_observations.filter((_, i) => i !== index)
    }))
  }

  // Atualizar informação de classificado
  const updateClassifiedInfo = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      classified_observations: prev.classified_observations.map((item, i) =>
        i === index ? value : item
      )
    }))
  }

  // Enviar formulário
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      // Validação básica
      if (formData.images.length === 0) {
        showWarning('⚠️ Nenhuma imagem selecionada. O veículo será criado sem imagens.')
      }

      showLoading('Criando veículo...')

      const token = useAuth.getState().token
      if (!token) {
        showError('Token de autenticação não encontrado')
        return
      }

      // Preparar dados para envio no formato JSON
      const submitData = {
        brand_id: formData.brand_id,
        model_id: formData.model_id,
        vehicle_type: formData.vehicle_type,
        condition: formData.condition,
        title: formData.title,
        version: formData.version,
        year: formData.year,
        model_year: formData.model_year,
        color: formData.color,
        fuel_type: formData.fuel_type,
        transmission: formData.transmission,
        doors: formData.doors,
        mileage: formData.mileage,
        hide_mileage: formData.hide_mileage === 1,
        price: Number(formData.price) || 0,
        classified_price: Number(formData.classified_price) || 0,
        fipe_price: Number(formData.fipe_price) || 0,
        cost_type: formData.cost_type,
        engine: formData.engine,
        power: formData.power,
        torque: formData.torque,
        consumption_city: formData.consumption_city,
        consumption_highway: formData.consumption_highway,
        description: formData.description,
        use_same_observation: formData.use_same_observation === 1,
        custom_observation: formData.custom_observation,
        classified_observations: formData.classified_observations,
        standard_features: formData.standard_features,
        optional_features: formData.optional_features,
        plate: formData.plate,
        chassi: formData.chassi,
        renavam: formData.renavam,
        video_link: formData.video_link,
        owner_name: formData.owner_name,
        owner_phone: formData.owner_phone,
        owner_email: formData.owner_email,
        accept_financing: formData.accept_financing === 1,
        accept_exchange: formData.accept_exchange === 1,
        is_featured: formData.is_featured === 1,
        is_licensed: formData.is_licensed === 1,
        has_warranty: formData.has_warranty === 1,
        is_adapted: formData.is_adapted === 1,
        is_armored: formData.is_armored === 1,
        has_spare_key: formData.has_spare_key === 1,
        ipva_paid: formData.ipva_paid === 1,
        has_manual: formData.has_manual === 1,
        auction_history: formData.auction_history === 1,
        dealer_serviced: formData.dealer_serviced === 1,
        single_owner: formData.single_owner === 1
      }

      // Debug: Log dos dados sendo enviados
      console.log('📤 Dados sendo enviados:', submitData)

      // Criar veículo
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Tenant-Subdomain': useAuth.getState().user?.tenant.subdomain || 'demo',
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao criar veículo')
      }

      const result = await response.json()
      const vehicleId = result.data.id

      // Upload das imagens após criar o veículo
      if (formData.images.length > 0) {
        console.log(`🖼️ Iniciando upload de ${formData.images.length} imagens...`)
        showLoading('Fazendo upload das imagens...')

        const imagePaths: string[] = []
        let primaryImagePath = ''

        for (let i = 0; i < formData.images.length; i++) {
          const image = formData.images[i]

          // Validação do tipo de arquivo
          if (!image.type.startsWith('image/')) {
            console.warn(`⚠️ Arquivo ${image.name} não é uma imagem válida:`, image.type)
            continue
          }

          // Validação do tamanho do arquivo (máximo 5MB)
          const maxSize = 5 * 1024 * 1024 // 5MB
          if (image.size > maxSize) {
            console.warn(`⚠️ Arquivo ${image.name} é muito grande: ${(image.size / 1024 / 1024).toFixed(2)}MB`)
            continue
          }

          const imageFormData = new FormData()

          // Debug: Log da imagem sendo processada
          console.log(`🖼️ Processando imagem ${i + 1}:`, {
            name: image.name,
            size: image.size,
            type: image.type
          })

          // Usando o mesmo formato que funcionou no Swagger
          imageFormData.append('images[]', image)  // Campo correto: images[]

          // Comentando campos que não são necessários (backend gera automaticamente)
          // imageFormData.append('original_name', image.name)
          // imageFormData.append('size', String(image.size))
          // imageFormData.append('mime_type', image.type)
          // imageFormData.append('is_primary', String(i === 0 ? 1 : 0))
          // imageFormData.append('sort_order', String(i))

          // Campo obrigatório: url (será construída pelo backend)
          // O backend deve gerar a URL baseada no path

          // Debug: Log do FormData criado
          console.log(`📋 FormData criado para imagem ${i + 1}:`)
          for (const [key, value] of imageFormData.entries()) {
            console.log(`  ${key}:`, value)
          }

          try {
            const uploadResult = await uploadVehicleImage(vehicleId, imageFormData)
            const imagePath = (uploadResult.data as { image_url: string }).image_url

            imagePaths.push(imagePath)

            // Primeira imagem é a principal
            if (i === 0) {
              primaryImagePath = imagePath
            }

            console.log(`✅ Imagem ${i + 1} enviada com sucesso: ${imagePath}`)
          } catch (error) {
            console.error(`❌ Erro ao enviar imagem ${i + 1}:`, error)
            // Continuar com outras imagens mesmo se uma falhar
          }
        }

        // Atualizar o veículo com os caminhos das imagens
        if (imagePaths.length > 0) {
          try {
            const updateFormData = new FormData()
            updateFormData.append('image_paths', JSON.stringify(imagePaths))
            updateFormData.append('primary_image_path', primaryImagePath)

            const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicles/${vehicleId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              body: updateFormData
            })

            if (updateResponse.ok) {
              console.log('✅ Caminhos das imagens salvos no banco')
            } else {
              console.warn('⚠️ Aviso: Veículo criado mas caminhos das imagens não foram salvos')
            }
          } catch (error) {
            console.warn('⚠️ Aviso: Erro ao salvar caminhos das imagens:', error)
          }
        }
      }

      showSuccess('Veículo criado com sucesso!')
      router.push('/vehicles')

    } catch (error) {
      console.error('Erro ao criar veículo:', error)
      showError(error instanceof Error ? error.message : 'Erro ao criar veículo')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout title="Cadastrar Veículo">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Cabeçalho Moderno */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Cadastrar Veículo
                </h1>
                <p className="text-gray-600 mt-3 text-lg">Preencha as informações para cadastrar um novo veículo</p>
              </div>
              <Link
                href="/admin/vehicles"
                className="inline-flex items-center px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

          {/* Seção de Imagens - Moderna */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">📸</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Imagens do Veículo</h2>
                <p className="text-gray-600">Adicione fotos para destacar seu veículo</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Upload de imagens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selecionar Imagens
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">Clique para selecionar imagens</p>
                    <p className="text-sm text-gray-500">
                      Arraste e solte ou clique para selecionar arquivos
                    </p>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Formatos: JPG, PNG, GIF, WebP • Máximo: 5MB por imagem
                </p>
              </div>



              {/* Preview das imagens selecionadas */}
              {formData.images.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Imagens Selecionadas:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          width={96}
                          height={96}
                          className="w-full h-32 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
                        >
                          ×
                        </button>
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                            Principal
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Informações sobre as imagens */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  Dicas sobre Imagens
                </h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    A primeira imagem será definida como principal automaticamente
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Após criar o veículo, você poderá gerenciar todas as imagens
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Formatos suportados: JPG, PNG, GIF, WebP
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Tamanho máximo recomendado: 5MB por imagem
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Seção de Dados do Veículo - Moderna */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                <span className="text-2xl">🚗</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dados do Veículo</h2>
                <p className="text-gray-600">Informações principais e características</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Linha 1 - Placa e Condição */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Placa */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Placa do Veículo
                    </label>
                    <input
                      type="text"
                      value={formData.plate}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase()
                        if (value.length <= 10) {
                          handleInputChange('plate', value)
                        }
                      }}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                      placeholder="ABC-1234"
                      maxLength={10}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Máximo 10 caracteres (ex: ABC-1234)
                    </p>
                  </div>

                  {/* Condição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Condição
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer">
                        <input
                          type="radio"
                          value="new"
                          checked={formData.condition === 'new'}
                          onChange={(e) => handleInputChange('condition', e.target.value)}
                          className="mr-3 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="font-medium">0km</span>
                      </label>
                      <label className="flex items-center p-3 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer">
                        <input
                          type="radio"
                          value="used"
                          checked={formData.condition === 'used'}
                          onChange={(e) => handleInputChange('condition', e.target.value)}
                          className="mr-3 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="font-medium">Usado</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Linha 2 - Tipo e Combustível */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Veículo
                </label>
                <Select2
                  value={formData.vehicle_type}
                  onChange={(value: string | number) => handleInputChange('vehicle_type', value as string)}
                  options={[
                    { value: 'car', label: '🚗 Carro' },
                    { value: 'motorcycle', label: '🏍️ Moto' },
                    { value: 'truck', label: '🚛 Caminhão' },
                    { value: 'van', label: '🚐 Van' },
                    { value: 'suv', label: '🚙 SUV' }
                  ]}
                  placeholder="Selecione o tipo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Combustível
                </label>
                <Select2
                  value={formData.fuel_type}
                  onChange={(value: string | number) => handleInputChange('fuel_type', value as string)}
                  options={[
                    { value: 'gasolina', label: '⛽ Gasolina' },
                    { value: 'etanol', label: '🌱 Etanol' },
                    { value: 'flex', label: '🔄 Flex' },
                    { value: 'diesel', label: '🛢️ Diesel' },
                    { value: 'electrico', label: '⚡ Elétrico' },
                    { value: 'hibrido', label: '🔋 Híbrido' }
                  ]}
                  placeholder="Selecione o combustível"
                />
              </div>

              {/* Linha 3 - Marca e Cor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Marca
                </label>
                <Select2
                  value={`brand_${formData.brand_id}_${brands.findIndex(b => b.id === formData.brand_id)}`}
                  onChange={(value: string | number) => {
                    const brandId = String(value).replace('brand_', '').split('_')[0]
                    handleBrandChange(Number(brandId))
                  }}
                  options={brands.map((brand, index) => ({ value: `brand_${brand.id}_${index}`, label: brand.name }))}
                  placeholder="Selecione a marca"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cor
                </label>
                <Select2
                  value={formData.color}
                  onChange={(value: string | number) => handleInputChange('color', value as string)}
                  options={[
                    { value: 'white', label: '⚪ Branco' },
                    { value: 'black', label: '⚫ Preto' },
                    { value: 'silver', label: '🔘 Prata' },
                    { value: 'gray', label: '🔘 Cinza' },
                    { value: 'blue', label: '🔵 Azul' },
                    { value: 'red', label: '🔴 Vermelho' },
                    { value: 'green', label: '🟢 Verde' },
                    { value: 'yellow', label: '🟡 Amarelo' },
                    { value: 'orange', label: '🟠 Laranja' },
                    { value: 'brown', label: '🟤 Marrom' }
                  ]}
                  placeholder="Selecione a cor"
                />
              </div>

              {/* Linha 4 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                <Select2
                  value={`model_${formData.model_id}_${models.findIndex(m => m.id === formData.model_id)}`}
                  onChange={(value: string | number) => {
                    const modelId = String(value).replace('model_', '').split('_')[0]
                    handleInputChange('model_id', Number(modelId))
                  }}
                  options={models.map((model, index) => ({ value: `model_${model.id}_${index}`, label: model.name }))}
                  placeholder="SELECIONE"
                  disabled={!selectedBrandId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Câmbio</label>
                <Select2
                  value={formData.transmission}
                      onChange={(value: string | number) => handleInputChange('transmission', value as string)}
                  options={[
                    { value: 'manual', label: 'Manual' },
                    { value: 'automatica', label: 'Automático' },
                    { value: 'cvt', label: 'CVT' },
                    { value: 'automatizada', label: 'Semi-automático' }
                  ]}
                  placeholder="SELECIONE"
                />
              </div>

              {/* Linha 5 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ano Fab./Modelo</label>
                <div className="grid grid-cols-2 gap-2">
                  <Select2
                    value={`year_${formData.year}`}
                    onChange={(value: string | number) => {
                      const year = String(value).replace('year_', '')
                      handleInputChange('year', Number(year))
                    }}
                    options={Array.from({ length: 30 }, (_, i) => {
                      const year = new Date().getFullYear() - i
                      return { value: `year_${year}`, label: String(year) }
                    })}
                    placeholder="Ano"
                  />
                  <Select2
                    value={`model_year_${formData.model_year}`}
                    onChange={(value: string | number) => {
                      const year = String(value).replace('model_year_', '')
                      handleInputChange('model_year', Number(year))
                    }}
                    options={Array.from({ length: 30 }, (_, i) => {
                      const year = new Date().getFullYear() - i
                      return { value: `model_year_${year}`, label: String(year) }
                    })}
                    placeholder="Modelo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">KM</label>
                <input
                  type="text"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange('mileage', Number(e.target.value))}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="Não exibir km"
                />
              </div>

              {/* Linha 6 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Versão</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="Ex: 2.0 Flex"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Portas</label>
                <Select2
                  value={formData.doors}
                                      onChange={(value: string | number) => handleInputChange('doors', Number(value))}
                  options={[
                    { value: 2, label: '2' },
                    { value: 3, label: '3' },
                    { value: 4, label: '4' },
                    { value: 5, label: '5' }
                  ]}
                  placeholder="SELECIONE"
                />
              </div>

              {/* Linha 7 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preço Loja
                </label>
                <input
                  type="text"
                  value={formatCurrency(formData.price)}
                  onChange={(e) => handleInputChange('price', removeCurrencyMask(e.target.value))}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="R$ 0,00"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Digite apenas números (ex: 50000 para R$ 50.000,00)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chassi
                </label>
                <input
                  type="text"
                  value={formatChassi(formData.chassi)}
                  onChange={(e) => handleInputChange('chassi', removeChassiMask(e.target.value))}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="9BWZZZ377VT004251"
                  maxLength={17}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Formato: 17 caracteres alfanuméricos
                </p>
              </div>

              {/* Linha 8 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preço Classificado
                </label>
                <input
                  type="text"
                  value={formatCurrency(formData.fipe_price)}
                  onChange={(e) => handleInputChange('fipe_price', removeCurrencyMask(e.target.value))}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="R$ 0,00"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Digite apenas números (ex: 45000 para R$ 45.000,00)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Renavam
                </label>
                <input
                  type="text"
                  value={formatRenavam(formData.renavam)}
                  onChange={(e) => handleInputChange('renavam', removeRenavamMask(e.target.value))}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="12345678901"
                  maxLength={11}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Formato: 11 dígitos numéricos
                </p>
              </div>

              {/* Linha 9 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Link do Vídeo
                </label>
                <input
                  type="url"
                  value={formData.video_link}
                  onChange={(e) => handleInputChange('video_link', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  URL completa do vídeo (YouTube, Vimeo, etc.)
                </p>
              </div>

              {/* Linha 10 */}
              <div className="md:col-span-2">
                <div className="mb-6">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.use_same_observation === 1}
                        onChange={(e) => handleInputChange('use_same_observation', e.target.checked ? 1 : 0)}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        formData.use_same_observation === 1
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500'
                          : 'border-gray-300 group-hover:border-blue-400'
                      }`}>
                        {formData.use_same_observation === 1 && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                      Utilizar a mesma observação de site nos classificados
                    </span>
                  </label>
                </div>

                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição detalhada do veículo..."
                />

                <p className="text-sm text-gray-600 mt-2">
                  Clique aqui para gravar uma observação padrão para seus veículos.
                </p>
              </div>
            </div>
          </div>

          {/* Seção de Informações Personalizadas por Classificado */}
          <Collapse
            title="INFORMAÇÕES PERSONALIZADAS POR CLASSIFICADO"
            scrollable
            maxHeight="50vh"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Se utilizar essa funcionalidade, você poderá informar uma observação e/ou preço diferenciado em cada classificado.
                Caso utilize a mesma observação e preço em todos os classificados, só preencher essas informações nos dados do veículo.
              </p>
              <button
                type="button"
                onClick={addClassifiedInfo}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                + Adicionar
              </button>
            </div>

            {formData.classified_observations.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CLASSIFICADO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        OBSERVAÇÃO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PREÇO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        AÇÕES
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.classified_observations.map((observation, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={observation}
                            onChange={(e) => updateClassifiedInfo(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nome do classificado"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={observation}
                            onChange={(e) => updateClassifiedInfo(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Observação específica"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={observation}
                            onChange={(e) => updateClassifiedInfo(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="R$ 0,00"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => removeClassifiedInfo(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Collapse>

          {/* Seção de Flags Especiais */}
          <Collapse
            title="FLAGS ESPECIAIS"
            scrollable
            maxHeight="50vh"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.accept_financing === 1}
                    onChange={(e) => handleInputChange('accept_financing', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.accept_financing === 1
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500'
                      : 'border-gray-300 group-hover:border-green-400'
                  }`}>
                    {formData.accept_financing === 1 && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  💰 Aceita Financiamento
                </span>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.accept_exchange === 1}
                    onChange={(e) => handleInputChange('accept_exchange', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.accept_exchange === 1
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500'
                      : 'border-gray-300 group-hover:border-blue-400'
                  }`}>
                    {formData.accept_exchange === 1 && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  🔄 Aceita Troca
                </span>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.is_featured === 1}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.is_featured === 1
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-500'
                      : 'border-gray-300 group-hover:border-orange-400'
                  }`}>
                    {formData.is_featured === 1 && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  ⭐ Destaque
                </span>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.is_licensed === 1}
                    onChange={(e) => handleInputChange('is_licensed', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.is_licensed === 1
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500'
                      : 'border-gray-300 group-hover:border-green-400'
                  }`}>
                    {formData.is_licensed === 1 && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  📋 Licenciado
                </span>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.has_warranty === 1}
                    onChange={(e) => handleInputChange('has_warranty', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.has_warranty === 1
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500'
                      : 'border-gray-300 group-hover:border-blue-400'
                  }`}>
                    {formData.has_warranty === 1 && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  🛡️ Tem Garantia
                </span>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.is_adapted === 1}
                    onChange={(e) => handleInputChange('is_adapted', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.is_adapted === 1
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-500'
                      : 'border-gray-300 group-hover:border-purple-400'
                  }`}>
                    {formData.is_adapted === 1 && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  ♿ Adaptado
                </span>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-gray-600 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.is_armored === 1}
                    onChange={(e) => handleInputChange('is_armored', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.is_armored === 1
                      ? 'bg-gradient-to-r from-gray-600 to-gray-800 border-gray-600'
                      : 'border-gray-300 group-hover:border-gray-500'
                  }`}>
                    {formData.is_armored === 1 && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  🛡️ Blindado
                </span>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-yellow-300 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.has_spare_key === 1}
                    onChange={(e) => handleInputChange('has_spare_key', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.has_spare_key === 1
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-500'
                      : 'border-gray-300 group-hover:border-yellow-400'
                  }`}>
                    {formData.has_spare_key === 1 && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  🔑 Tem Chave Reserva
                </span>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.ipva_paid === 1}
                      onChange={(e) => handleInputChange('ipva_paid', e.target.checked ? 1 : 0)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      formData.ipva_paid === 1
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500'
                        : 'border-gray-300 group-hover:border-green-400'
                    }`}>
                      {formData.ipva_paid === 1 && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
                <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  📄 IPVA Pago
                </span>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.has_manual === 1}
                    onChange={(e) => handleInputChange('has_manual', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.has_manual === 1
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500'
                      : 'border-gray-300 group-hover:border-blue-400'
                  }`}>
                    {formData.has_manual === 1 && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                                <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  📚 Tem Manual
                </span>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-red-300 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.auction_history === 1}
                    onChange={(e) => handleInputChange('auction_history', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.auction_history === 1
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 border-red-500'
                      : 'border-gray-300 group-hover:border-red-400'
                  }`}>
                    {formData.auction_history === 1 && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  🏛️ Histórico de Leilão
                </span>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.dealer_serviced === 1}
                    onChange={(e) => handleInputChange('dealer_serviced', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.dealer_serviced === 1
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500'
                      : 'border-gray-300 group-hover:border-blue-400'
                  }`}>
                    {formData.dealer_serviced === 1 && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  🔧 Serviçado na Concessionária
                </span>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.single_owner === 1}
                    onChange={(e) => handleInputChange('single_owner', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.single_owner === 1
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500'
                      : 'border-gray-300 group-hover:border-green-400'
                  }`}>
                    {formData.single_owner === 1 && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  👤 Único Proprietário
                </span>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-300 transition-all duration-200 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.is_active === 1}
                    onChange={(e) => handleInputChange('is_active', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.is_active === 1
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500'
                      : 'border-gray-300 group-hover:border-emerald-400'
                  }`}>
                    {formData.is_active === 1 && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  ✅ Ativo
                </span>
              </label>
            </div>
          </Collapse>

          {/* Seção de Características */}
          <Collapse
            title="CARACTERÍSTICAS"
            scrollable
            maxHeight="55vh"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-xl">🔧</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Características do Veículo</h3>
                  <p className="text-sm text-gray-600">
                    Selecione as características que se aplicam ao veículo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const allNames = DEFAULT_VEHICLE_CHARACTERISTICS.map(c => c.name)
                  setFormData(prev => ({ ...prev, standard_features: allNames }))
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                ✨ SELECIONAR TODOS
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEFAULT_VEHICLE_CHARACTERISTICS.map(characteristic => (
                <label key={characteristic.id} className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.standard_features.includes(characteristic.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            standard_features: [...prev.standard_features, characteristic.name]
                          }))
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            standard_features: prev.standard_features.filter(name => name !== characteristic.name)
                          }))
                        }
                      }}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      formData.standard_features.includes(characteristic.name)
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {formData.standard_features.includes(characteristic.name) && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                    {characteristic.name}
                  </span>
                </label>
              ))}
            </div>
          </Collapse>

          {/* Seção de Opcionais */}
          <Collapse
            title="OPCIONAIS"
            scrollable
            maxHeight="55vh"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-xl">⭐</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Opcionais do Veículo</h3>
                  <p className="text-sm text-gray-600">
                    Selecione os opcionais disponíveis no veículo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const allNames = DEFAULT_VEHICLE_OPTIONALS.map(o => o.name)
                  setFormData(prev => ({ ...prev, optional_features: allNames }))
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                ✨ SELECIONAR TODOS
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DEFAULT_VEHICLE_OPTIONALS.map(optional => (
                <label key={optional.id} className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 transition-all duration-200 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.optional_features.includes(optional.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            optional_features: [...prev.optional_features, optional.name]
                          }))
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            optional_features: prev.optional_features.filter(name => name !== optional.name)
                          }))
                        }
                      }}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      formData.optional_features.includes(optional.name)
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500'
                        : 'border-gray-300 group-hover:border-green-400'
                      }`}>
                      {formData.optional_features.includes(optional.name) && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-4 text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                    {optional.name}
                  </span>
                </label>
              ))}
            </div>
          </Collapse>

          {/* Botões de ação - Modernos */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 border border-blue-500/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Pronto para criar?</h3>
                <p className="text-blue-100">Clique no botão abaixo para cadastrar seu veículo</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-white text-blue-600 py-4 px-8 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  🚗 Criar Veículo
                </button>
                <Link
                  href="/admin/vehicles"
                  className="w-full sm:w-auto bg-transparent border-2 border-white text-white py-4 px-8 rounded-xl font-medium text-lg hover:bg-white hover:text-blue-600 transition-all duration-200 text-center"
                >
                  ← Voltar
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    </AdminLayout>
  )
}
