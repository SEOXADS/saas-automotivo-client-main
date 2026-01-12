'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { Vehicle, VehicleBrand, VehicleModel, VehicleFormData, DEFAULT_VEHICLE_CHARACTERISTICS, DEFAULT_VEHICLE_OPTIONALS } from '@/types'
import { initializeMessages } from '@/lib/messages'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Select2 from '@/components/ui/Select2'
import Collapse from '@/components/ui/Collapse'
import VehicleImageManager from '@/components/ui/VehicleImageManager'
import { showSuccess, showError, showLoading, showWarning } from '@/lib/swal'
import { uploadVehicleImage } from '@/lib/api'
import { formatPrice } from '@/lib/format'

export default function EditVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const vehicleId = parseInt(params.id as string)
  const { isAuthenticated } = useAuth()


  // Funções de formatação para máscaras

  const removeCurrencyMask = (value: string): string => {
    console.log(`💰 removeCurrencyMask - Input:`, value)
    const result = value.replace(/\D/g, '')
    console.log(`💰 removeCurrencyMask - Resultado:`, result)
    return result
  }

  const formatChassi = (value: string): string => {
    if (!value) return ''
    // Formato: 9BWZZZ377VT004251 (17 caracteres)
    const cleanValue = value.replace(/\W/g, '').toUpperCase()
    if (cleanValue.length <= 4) return cleanValue
    if (cleanValue.length <= 8) return `${cleanValue.slice(0, 4)}-${cleanValue.slice(4)}`
    if (cleanValue.length <= 12) return `${cleanValue.slice(0, 4)}-${cleanValue.slice(4, 8)}-${cleanValue.slice(8)}`
    return `${cleanValue.slice(0, 4)}-${cleanValue.slice(4, 8)}-${cleanValue.slice(8, 12)}-${cleanValue.slice(12)}`
  }

  const removeChassiMask = (value: string): string => {
    return value.replace(/\W/g, '').toUpperCase()
  }

  const formatRenavam = (value: string): string => {
    if (!value) return ''
    // Formato: 12345678901 (11 dígitos)
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length <= 3) return cleanValue
    if (cleanValue.length <= 6) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3)}`
    if (cleanValue.length <= 9) return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6)}`
    return `${cleanValue.slice(0, 3)}.${cleanValue.slice(3, 6)}.${cleanValue.slice(6, 9)}.${cleanValue.slice(9)}`
  }

  const removeRenavamMask = (value: string): string => {
    return value.replace(/\D/g, '')
  }

  const [isLoadingVehicle, setIsLoadingVehicle] = useState(true)

  // Dados para o formulário
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [brands, setBrands] = useState<VehicleBrand[]>([])
  const [models, setModels] = useState<VehicleModel[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<number>(0)





  // Formulário
  const [formData, setFormData] = useState<VehicleFormData>({
    // Relacionamentos
    brand_id: 0,
    model_id: 0,

    // Tipo e condição
    vehicle_type: 'car',
    condition: 'used',

    // Dados básicos
    title: '',
    version: '',
    year: new Date().getFullYear(),
    model_year: new Date().getFullYear(),
    color: 'white',
    fuel_type: 'gasoline',
    transmission: 'manual',
    doors: 5,
    mileage: 0,
    hide_mileage: 0, // 0 = false, 1 = true

    // Preços
    price: 0,
    classified_price: 0,
    cost_type: '',
    fipe_price: 0,

    // Opções de venda
    accept_financing: 0, // 0 = false, 1 = true
    accept_exchange: 0, // 0 = false, 1 = true

    // Especificações técnicas
    engine: '',
    power: '',
    torque: '',
    consumption_city: '',
    consumption_highway: '',

    // Descrições
    description: '',
    use_same_observation: 1, // 0 = false, 1 = true
    custom_observation: '',
    classified_observations: [],

    // Características e opcionais
    standard_features: [],
    optional_features: [],

    // Documentação
    plate: '',
    chassi: '',
    renavam: '',

    // Mídia
    video_link: '',

    // Informações do proprietário
    owner_name: '',
    owner_phone: '',
    owner_email: '',

    // Flags especiais (tinyint)
    is_featured: 0, // 0 = false, 1 = true
    is_licensed: 0, // 0 = false, 1 = true
    has_warranty: 0, // 0 = false, 1 = true
    is_adapted: 0, // 0 = false, 1 = true
    is_armored: 0, // 0 = false, 1 = true
    has_spare_key: 0, // 0 = false, 1 = true
    ipva_paid: 0, // 0 = false, 1 = true
    has_manual: 0, // 0 = false, 1 = true
    auction_history: 0, // 0 = false, 1 = true
    dealer_serviced: 0, // 0 = false, 1 = true
    single_owner: 0, // 0 = false, 1 = true
    is_active: 1, // 0 = false, 1 = true

    // Estatísticas
    views: 0,

    // Status
    status: 'available',

    // Imagens
    images: []
  })

  // Callback para atualizar URLs das imagens
  const handleImagesChange = useCallback(() => {
    // Callback para compatibilidade com VehicleImageManager
  }, [])

  // Verificar autenticação
  // Carregar veículo
  const loadVehicle = useCallback(async () => {
    try {
      const { token } = useAuth.getState()
      if (!token) {
        showError('Token de autenticação não encontrado')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicles/${vehicleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar veículo')
      }

      const data = await response.json()
      const vehicleData = data.data || data
      setVehicle(vehicleData)

      // Log dos dados do veículo carregados
      console.log('📋 Dados do veículo carregados:', {
        id: vehicleData.id,
        title: vehicleData.title,
        price: vehicleData.price,
        classified_price: vehicleData.classified_price,
        fipe_price: vehicleData.fipe_price,
        brand_id: vehicleData.brand_id,
        model_id: vehicleData.model_id
      })

      // Preencher formulário com dados do veículo
      console.log('📋 Inicializando formData com dados do veículo:', {
        price: vehicleData.price,
        classified_price: vehicleData.classified_price,
        fipe_price: vehicleData.fipe_price
      })

      setFormData({
        brand_id: vehicleData.brand_id || 0,
        model_id: vehicleData.model_id || 0,
        vehicle_type: vehicleData.vehicle_type || 'car',
        condition: vehicleData.condition || 'used',
        title: vehicleData.title || '',
        version: vehicleData.version || '',
        year: vehicleData.year || new Date().getFullYear(),
        model_year: vehicleData.model_year || new Date().getFullYear(),
        color: vehicleData.color || 'white',
        fuel_type: vehicleData.fuel_type || 'gasoline',
        transmission: vehicleData.transmission || 'manual',
        doors: vehicleData.doors || 5,
        mileage: vehicleData.mileage || 0,
        hide_mileage: vehicleData.hide_mileage || 0,
        // Manter preços em centavos (como no create)
        price: vehicleData.price || 0,
        classified_price: vehicleData.classified_price || 0,
        cost_type: vehicleData.cost_type || '',
        fipe_price: vehicleData.fipe_price || 0,
        accept_financing: vehicleData.accept_financing ? 1 : 0,
        accept_exchange: vehicleData.accept_exchange ? 1 : 0,
        engine: vehicleData.engine || '',
        power: vehicleData.power || '',
        torque: vehicleData.torque || '',
        consumption_city: vehicleData.consumption_city || '',
        consumption_highway: vehicleData.consumption_highway || '',
        description: vehicleData.description || '',
        use_same_observation: vehicleData.use_same_observation ? 1 : 0,
        custom_observation: vehicleData.custom_observation || '',
        classified_observations: vehicleData.classified_observations || [],
        // Mapear características - verificar diferentes campos possíveis
        standard_features: (() => {
          if (vehicleData.characteristics && Array.isArray(vehicleData.characteristics)) {
            return vehicleData.characteristics.map((f: { id: number, name: string }) => f?.name).filter(Boolean)
          }
          if (vehicleData.standard_features && Array.isArray(vehicleData.standard_features)) {
            return vehicleData.standard_features
          }
          if (vehicleData.features && Array.isArray(vehicleData.features)) {
            return vehicleData.features.map((f: { id: number, name: string }) => f?.name).filter(Boolean)
          }
          return []
        })(),
        // Mapear opcionais - verificar diferentes campos possíveis
        optional_features: (() => {
          if (vehicleData.optionals && Array.isArray(vehicleData.optionals)) {
            return vehicleData.optionals.map((f: { id: number, name: string }) => f?.name).filter(Boolean)
          }
          if (vehicleData.optional_features && Array.isArray(vehicleData.optional_features)) {
            return vehicleData.optional_features
          }
          return []
        })(),
        plate: vehicleData.plate || '',
        chassi: vehicleData.chassi || '',
        renavam: vehicleData.renavam || '',
        video_link: vehicleData.video_link || '',
        owner_name: vehicleData.owner_name || '',
        owner_phone: vehicleData.owner_phone || '',
        owner_email: vehicleData.owner_email || '',
        is_featured: vehicleData.is_featured ? 1 : 0,
        is_licensed: vehicleData.is_licensed ? 1 : 0,
        has_warranty: vehicleData.has_warranty ? 1 : 0,
        is_adapted: vehicleData.is_adapted ? 1 : 0,
        is_armored: vehicleData.is_armored ? 1 : 0,
        has_spare_key: vehicleData.has_spare_key ? 1 : 0,
        ipva_paid: vehicleData.ipva_paid ? 1 : 0,
        has_manual: vehicleData.has_manual ? 1 : 0,
        auction_history: vehicleData.auction_history ? 1 : 0,
        dealer_serviced: vehicleData.dealer_serviced ? 1 : 0,
        single_owner: vehicleData.single_owner ? 1 : 0,
        is_active: vehicleData.is_active ? 1 : 0,
        views: vehicleData.views || 0,
        status: vehicleData.status || 'available',
        images: []
      })

      // Debug: Log das flags especiais e preços
      console.log('🔍 Debug - Flags especiais carregadas:', {
        is_featured: vehicleData.is_featured,
        is_licensed: vehicleData.is_licensed,
        has_warranty: vehicleData.has_warranty,
        is_adapted: vehicleData.is_adapted,
        is_armored: vehicleData.is_armored,
        has_spare_key: vehicleData.has_spare_key,
        ipva_paid: vehicleData.ipva_paid,
        has_manual: vehicleData.has_manual,
        auction_history: vehicleData.auction_history,
        dealer_serviced: vehicleData.dealer_serviced,
        single_owner: vehicleData.single_owner,
        is_active: vehicleData.is_active
      })

      console.log('💰 Debug - Preços carregados:', {
        price: vehicleData.price,
        classified_price: vehicleData.classified_price,
        fipe_price: vehicleData.fipe_price,
        price_type: typeof vehicleData.price
      })

      setSelectedBrandId(vehicleData.brand_id || 0)

      // Carregar dados relacionados
      await Promise.all([
        loadBrands(),
        loadCharacteristics(),
        loadOptionals()
      ])


      if (vehicleData.brand_id) {
        await loadModels(vehicleData.brand_id)
      }

      // Carregar imagens existentes (apenas para debug)
      if (vehicleData.images && vehicleData.images.length > 0) {
        console.log('📸 Imagens existentes carregadas:', vehicleData.images.length)
      }

    } catch (error) {
      console.error('Erro ao carregar veículo:', error)
      showError('Erro ao carregar veículo')
    } finally {
      setIsLoadingVehicle(false)
    }
  }, [vehicleId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Inicializar sistema de mensagens
    initializeMessages('vehicles')

    if (vehicleId) {
      loadVehicle()
    }
  }, [isAuthenticated, router, vehicleId, loadVehicle])

  // Carregar marcas
  const loadBrands = async () => {
    try {
      const { token } = useAuth.getState()
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
      const brandsData = data.data || data
      console.log('📋 Marcas carregadas (primeiras 3):', brandsData.slice(0, 3).map((brand: VehicleBrand & { code?: string }) => ({
        id: brand.id,
        name: brand.name,
        code: brand.code || 'sem code',
        hasCode: !!brand.code
      })))
      setBrands(brandsData)
    } catch (error) {
      console.error('Erro ao carregar marcas:', error)
      showError('Erro ao carregar marcas')
    }
  }

  // Carregar modelos com fallback inteligente para FIPE
  const loadModels = useCallback(async (brandId: number) => {
    try {
      const { token } = useAuth.getState()
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

        // Verificar se a marca tem código FIPE
        const brandCode = (selectedBrand as VehicleBrand & { code?: string }).code || selectedBrand.id
        console.log(`🔍 Marca selecionada: ${selectedBrand.name}, ID: ${selectedBrand.id}, Code: ${brandCode}`)

        // Mapear tipo de veículo (assumindo que é 'car' por padrão)
        const vehicleType = 'cars' as const

        console.log(`🌐 Buscando modelos FIPE para marca ${selectedBrand.name} (${vehicleType}) usando code: ${brandCode}`)

        const fipeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fipe/brands/${vehicleType}/${brandCode}/models`, {
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
  }, [brands])

  // Carregar características
  const loadCharacteristics = async () => {
    // Usar características padrão do sistema
    return DEFAULT_VEHICLE_CHARACTERISTICS
  }

  // Carregar opcionais
  const loadOptionals = async () => {
    // Usar opcionais padrão do sistema
    return DEFAULT_VEHICLE_OPTIONALS
  }



  // Manipular mudanças no formulário
  const handleInputChange = (field: keyof VehicleFormData, value: string | number | boolean) => {
    console.log(`🔄 Campo ${field} alterado para:`, value)
    console.log(`🔄 Tipo do valor:`, typeof value)
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      console.log(`🔄 Novo formData.${field}:`, newData[field])
      return newData
    })
  }

  // Verificar se modelo existe no banco local
  const checkModelExists = async (modelId: number, modelName: string) => {
    try {
      console.log(`🔍 Verificando se modelo ${modelName} (ID: ${modelId}) existe no banco local...`)

      const token = useAuth.getState().token
      if (!token) {
        console.log('❌ Token não encontrado para verificação de modelo')
        return false
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/models/${modelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': useAuth.getState().user?.tenant.subdomain || 'demo',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const modelData = await response.json()
        console.log(`✅ Modelo ${modelName} encontrado no banco local:`, modelData)
        return true
      } else {
        console.log(`⚠️ Modelo ${modelName} não encontrado no banco local (status: ${response.status})`)
        return false
      }
    } catch (error) {
      console.error(`❌ Erro ao verificar modelo ${modelName}:`, error)
      return false
    }
  }

  // Manipular seleção de modelo com verificação no banco
  const handleModelChange = async (modelId: number) => {
    console.log(`🎯 Modelo selecionado: ID ${modelId}`)

    // Atualizar o formulário imediatamente
    setFormData(prev => ({ ...prev, model_id: modelId }))

    // Encontrar o modelo selecionado
    const selectedModel = models.find(m => m.id === modelId)
    if (!selectedModel) {
      console.log('❌ Modelo selecionado não encontrado na lista')
      return
    }

    console.log(`📋 Modelo selecionado: ${selectedModel.name} (ID: ${selectedModel.id})`)

    // Verificar se o modelo veio da API FIPE (tem propriedade is_fipe ou similar)
    const isFromFipe = 'is_fipe' in selectedModel && selectedModel.is_fipe

    if (isFromFipe) {
      console.log(`🌐 Modelo ${selectedModel.name} veio da API FIPE, verificando se existe no banco local...`)

      // Aguardar 5 segundos antes de verificar
      console.log('⏳ Aguardando 5 segundos antes de verificar no banco...')
      await new Promise(resolve => setTimeout(resolve, 5000))

      const existsInLocal = await checkModelExists(modelId, selectedModel.name)

      if (existsInLocal) {
        console.log(`✅ Modelo ${selectedModel.name} existe no banco local, mantendo seleção`)
        // Modelo já está selecionado, não precisa fazer nada
      } else {
        console.log(`⚠️ Modelo ${selectedModel.name} não existe no banco local`)
        // Opcional: mostrar aviso para o usuário ou criar o modelo
        showWarning(`Modelo ${selectedModel.name} não encontrado no banco local. Verifique se precisa ser criado.`)
      }
    } else {
      console.log(`🏠 Modelo ${selectedModel.name} veio da API local`)
    }
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
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    // Salvar arquivos no formData para envio
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }))
  }

  // Remover imagem
  const removeImage = (index: number) => {
    // Remover do formData.images
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
      showLoading('Atualizando veículo...')

      // Validar vehicleId
      if (!vehicleId || isNaN(vehicleId)) {
        showError('ID do veículo inválido')
        return
      }

      const { token, user } = useAuth.getState()
      console.log('🔑 Token obtido do estado:', token ? `${token.substring(0, 20)}...` : 'null')
      console.log('👤 Usuário obtido do estado:', user ? `${user.name} (${user.tenant?.subdomain})` : 'null')

      if (!token) {
        showError('Token de autenticação não encontrado')
        return
      }

      console.log('🔑 Token encontrado:', token ? `${token.substring(0, 20)}...` : 'null')
      console.log('🔍 Dados de debug:', {
        vehicleId,
        vehicleIdType: typeof vehicleId,
        token: token ? 'Presente' : 'Ausente',
        user: user?.tenant?.subdomain || 'demo'
      })

      // Validar campos obrigatórios
      if (!formData.brand_id || formData.brand_id === 0) {
        showError('Selecione uma marca')
        return
      }

      if (!formData.model_id || formData.model_id === 0) {
        showError('Selecione um modelo')
        return
      }

      if (!formData.title || formData.title.trim() === '') {
        showError('Digite o título do veículo')
        return
      }

      // Validar se os IDs são válidos
      if (Number(formData.brand_id) === 0) {
        showError('Marca inválida selecionada')
        return
      }

      if (Number(formData.model_id) === 0) {
        showError('Modelo inválido selecionado')
        return
      }

      // Preparar dados para envio no formato JSON (como mostrado no exemplo)
      const submitData = {
        brand_id: Number(formData.brand_id) || 0,
        model_id: Number(formData.model_id) || 0,
        vehicle_type: formData.vehicle_type || 'car',
        condition: formData.condition || 'used',
        title: formData.title.trim(),
        version: formData.version || '',
        year: Number(formData.year) || new Date().getFullYear(),
        model_year: Number(formData.model_year) || new Date().getFullYear(),
        color: formData.color || 'white',
        fuel_type: formData.fuel_type || 'gasoline',
        transmission: formData.transmission || 'manual',
        doors: Number(formData.doors) || 4,
        mileage: Number(formData.mileage) || 0,
        hide_mileage: Number(formData.hide_mileage) || 0,
        // Preços - já estão em centavos (como no create)
        price: Number(formData.price) || 0,
        classified_price: Number(formData.classified_price) || 0,
        fipe_price: Number(formData.fipe_price) || 0,
        cost_type: formData.cost_type || 'sale',
        engine: formData.engine || '',
        power: formData.power || '',
        torque: formData.torque || '',
        consumption_city: formData.consumption_city || '',
        consumption_highway: formData.consumption_highway || '',
        description: formData.description || '',
        use_same_observation: Boolean(formData.use_same_observation),
        custom_observation: formData.custom_observation || '',
        plate: formData.plate || '',
        chassi: formData.chassi || '',
        renavam: formData.renavam || '',
        video_link: formData.video_link || '',
        owner_name: formData.owner_name || '',
        owner_phone: formData.owner_phone || '',
        owner_email: formData.owner_email || '',
        accept_financing: Boolean(formData.accept_financing),
        accept_exchange: Boolean(formData.accept_exchange),
        is_featured: Number(formData.is_featured) || 0,
        is_licensed: Boolean(formData.is_licensed),
        has_warranty: Boolean(formData.has_warranty),
        is_adapted: Boolean(formData.is_adapted),
        is_armored: Number(formData.is_armored) || 0,
        has_spare_key: Boolean(formData.has_spare_key),
        ipva_paid: Number(formData.ipva_paid) || 0,
        has_manual: Number(formData.has_manual) || 0,
        auction_history: Boolean(formData.auction_history),
        dealer_serviced: Boolean(formData.dealer_serviced),
        single_owner: Number(formData.single_owner) || 0,
        is_active: Boolean(formData.is_active),
        views: Number(formData.views) || 0,
        status: formData.status || 'available',
        // Arrays - filtrar valores vazios e null
        classified_observations: formData.classified_observations.filter(obs => obs && obs.trim()),
        standard_features: formData.standard_features.filter(feature => feature && feature.trim()),
        optional_features: formData.optional_features.filter(feature => feature && feature.trim())
      }

      console.log('🔍 Validação dos dados antes do envio:', {
        brand_id: formData.brand_id,
        model_id: formData.model_id,
        price: formData.price,
        classified_price: formData.classified_price,
        fipe_price: formData.fipe_price
      })

      console.log('💰 Preços sendo enviados (reais -> centavos):', {
        price: `${formData.price} -> ${submitData.price}`,
        classified_price: `${formData.classified_price} -> ${submitData.classified_price}`,
        fipe_price: `${formData.fipe_price} -> ${submitData.fipe_price}`
      })

      console.log('🔍 Debug completo dos preços:', {
        formData_price: formData.price,
        formData_price_type: typeof formData.price,
        formData_classified_price: formData.classified_price,
        formData_classified_price_type: typeof formData.classified_price,
        formData_fipe_price: formData.fipe_price,
        formData_fipe_price_type: typeof formData.fipe_price,
        submitData_price: submitData.price,
        submitData_classified_price: submitData.classified_price,
        submitData_fipe_price: submitData.fipe_price
      })

      console.log('📤 Dados principais sendo enviados:', {
        brand_id: submitData.brand_id,
        model_id: submitData.model_id,
        title: submitData.title,
        price: submitData.price,
        classified_price: submitData.classified_price,
        fipe_price: submitData.fipe_price,
        standard_features: submitData.standard_features,
        optional_features: submitData.optional_features
      })

      // Atualizar veículo diretamente na API Laravel
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/vehicles/${vehicleId}`
      console.log('🔄 Enviando requisição diretamente para API Laravel:', apiUrl)
      console.log('📚 Documentação da API: https://www.api.webcarros.app.br/api/documentation#/Veículos/170b50ff07739fd3e9a2f910611ea552')
      console.log('🔍 Token:', token ? 'Presente' : 'Ausente')
      console.log('🔍 Tenant:', user?.tenant?.subdomain || 'demo')
      console.log('🔍 API URL completa:', apiUrl)
      console.log('🔍 Variável de ambiente NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)

      // Headers para requisição JSON
      const subdomain = user?.tenant?.subdomain || 'demo'

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Tenant-Subdomain': subdomain
      }

      console.log('📋 Headers sendo enviados:', headers)
      // Verificar se há valores problemáticos no submitData
      console.log('🔍 Verificação final dos dados:', {
        brand_id: submitData.brand_id,
        model_id: submitData.model_id,
        price: submitData.price,
        hasInvalidValues: Object.values(submitData).some(val => val === undefined || val === null)
      })

      console.log('📦 Dados JSON sendo enviados:', JSON.stringify(submitData, null, 2))

      // Verificar se a URL está válida
      if (!apiUrl || !apiUrl.startsWith('http')) {
        throw new Error(`URL inválida: ${apiUrl}`)
      }

      let response
      try {
        const jsonBody = JSON.stringify(submitData)
        console.log('📦 JSON stringificado com sucesso, tamanho:', jsonBody.length)
        console.log('🌐 Fazendo requisição para:', apiUrl)
        console.log('📋 Headers finais:', headers)

        response = await fetch(apiUrl, {
          method: 'PUT',
          headers: headers,
          body: jsonBody
        })

        console.log('📡 Requisição enviada com sucesso, aguardando resposta...')
      } catch (fetchError) {
        console.error('❌ Erro na requisição fetch:', fetchError)
        console.error('❌ Tipo do erro:', typeof fetchError)
        console.error('❌ Stack trace:', fetchError instanceof Error ? fetchError.stack : 'N/A')
        console.error('❌ URL que causou o erro:', apiUrl)
        throw new Error(`Erro de rede: ${fetchError instanceof Error ? fetchError.message : 'Erro desconhecido'}`)
      }

      console.log('📡 Resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        let errorData
        let responseText

        try {
          responseText = await response.text()
          console.log('📄 Resposta bruta da API:', responseText)

          if (responseText.trim()) {
            errorData = JSON.parse(responseText)
          } else {
            errorData = { message: 'Resposta vazia do servidor' }
          }
        } catch (parseError) {
          // Se não conseguir fazer parse do JSON, a resposta provavelmente é HTML
          console.error('❌ Erro ao fazer parse da resposta:', parseError)
          console.error('❌ Resposta não é JSON válido:', {
            status: response.status,
            statusText: response.statusText,
            contentType: response.headers.get('content-type'),
            responseText: responseText?.substring(0, 500) + '...'
          })
          throw new Error(`Erro do servidor (${response.status}): ${response.statusText}`)
        }

        console.error('❌ Erro na resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          responseText: responseText?.substring(0, 200)
        })

        // Determinar mensagem de erro mais específica
        let errorMessage = `Erro ao atualizar veículo (${response.status}: ${response.statusText})`

        if (errorData && typeof errorData === 'object') {
          if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.error) {
            errorMessage = errorData.error
          } else if (Object.keys(errorData).length > 0) {
            // Se errorData não está vazio, mostrar o conteúdo
            errorMessage = `Erro da API: ${JSON.stringify(errorData)}`
          }
        } else if (responseText && responseText.trim()) {
          // Se não conseguiu fazer parse do JSON, usar o texto da resposta
          errorMessage = `Erro do servidor: ${responseText.substring(0, 200)}`
        }

        throw new Error(errorMessage)
      }

      // Log da resposta de sucesso
      const responseData = await response.json()
      console.log('✅ Veículo atualizado com sucesso:', responseData)

      // Verificar se os dados foram realmente salvos
      if (responseData.data) {
        console.log('📊 Dados salvos no banco:', {
          id: responseData.data.id,
          price: responseData.data.price,
          classified_price: responseData.data.classified_price,
          fipe_price: responseData.data.fipe_price
        })
      }

      // Upload das novas imagens após atualizar o veículo
      if (formData.images.length > 0) {
        showLoading('Fazendo upload das novas imagens...')

        const newImagePaths: string[] = []

        for (let i = 0; i < formData.images.length; i++) {
          const image = formData.images[i]

          // Verificar se o arquivo é válido
          if (!image || !(image instanceof File)) {
            console.error(`❌ Arquivo inválido na posição ${i}:`, image)
            continue
          }

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

          // Usar o mesmo formato que funciona na página de criação
          imageFormData.append('images[]', image)  // Campo correto: images[]

          // Debug: Log da imagem sendo processada
          console.log(`🖼️ Processando imagem ${i + 1}:`, {
            name: image.name,
            size: image.size,
            type: image.type
          })

          // Debug: Log do FormData criado
          console.log(`📋 FormData criado para imagem ${i + 1}:`)
          for (const [key, value] of imageFormData.entries()) {
            console.log(`  ${key}:`, value)
          }

          try {
            // Usar a mesma função que funciona na página de criação
            const uploadResult = await uploadVehicleImage(vehicleId, imageFormData)

            // Tratar diferentes formatos de resposta
            let imagePath = null
            if (uploadResult.data) {
              if (typeof uploadResult.data === 'string') {
                imagePath = uploadResult.data
              } else if (uploadResult.data && typeof uploadResult.data === 'object') {
                const data = uploadResult.data as Record<string, unknown>
                imagePath = (data.image_url || data.url || data.path) as string
              }
            }

            if (imagePath) {
            newImagePaths.push(imagePath)
            console.log(`✅ Nova imagem ${i + 1} enviada com sucesso: ${imagePath}`)
            } else {
              console.warn(`⚠️ Resposta inesperada para imagem ${i + 1}:`, uploadResult)
              // Continuar mesmo sem caminho específico
            }
          } catch (error) {
            console.error(`❌ Erro ao enviar nova imagem ${i + 1}:`, error)
            // Continuar com outras imagens mesmo se uma falhar
          }
        }

        // Atualizar o veículo com os novos caminhos das imagens
        if (newImagePaths.length > 0) {
          try {
            // Obter imagens existentes usando o endpoint específico de imagens
            const existingImagesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicles/${vehicleId}/images`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              }
            })

            if (existingImagesResponse.ok) {
              const existingImagesData = await existingImagesResponse.json()
              const imagesData = existingImagesData.data || existingImagesData
              const existingImagePaths = imagesData.images?.filter((img: unknown) => img && typeof img === 'object' && 'image_url' in img).map((img: { image_url: string }) => img.image_url) || []

              // Combinar imagens existentes com novas
              const allImagePaths = [...existingImagePaths, ...newImagePaths]

              const updateFormData = new FormData()
              updateFormData.append('image_paths', JSON.stringify(allImagePaths))

              // Manter a imagem principal existente ou usar a primeira se não houver
              const primaryImage = existingImagesData.data.find((img: { is_primary: boolean }) => img.is_primary)
              if (primaryImage) {
                updateFormData.append('primary_image_path', primaryImage.image_url)
              } else if (allImagePaths.length > 0) {
                updateFormData.append('primary_image_path', allImagePaths[0])
              }

              const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicles/${vehicleId}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
                body: updateFormData
              })

              if (updateResponse.ok) {
                console.log('✅ Caminhos das imagens atualizados no banco')
              } else {
                console.warn('⚠️ Aviso: Veículo atualizado mas caminhos das imagens não foram salvos')
              }
            }
          } catch (error) {
            console.warn('⚠️ Aviso: Erro ao salvar caminhos das imagens:', error)
          }
        }
      }

      // Log dos dados que foram enviados com sucesso
      console.log('📋 Dados enviados com sucesso:', {
        vehicleId,
        brand_id: formData.brand_id,
        model_id: formData.model_id,
        title: formData.title,
        price: formData.price,
        status: formData.status
      })

      showSuccess('Veículo atualizado com sucesso!')
      router.push('/vehicles')

    } catch (error) {
      console.error('❌ Erro ao atualizar veículo:', error)

      let errorMessage = 'Erro ao atualizar veículo'

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        // Se for um objeto de erro da API
        if ('message' in error) {
          errorMessage = String(error.message)
        } else if ('error' in error) {
          errorMessage = String(error.error)
        }
      }

      console.error('❌ Mensagem de erro final:', errorMessage)
      showError(errorMessage)
    }
  }


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
  }, [brands, models, formData.brand_id, formData.model_id, formData.version, formData.transmission, formData.color, formData.year]) // Removido formData.title da dependência



  if (!isAuthenticated) {
    return null
  }

  if (isLoadingVehicle) {
    return (
      <AdminLayout title="Editando Veículo" subtitle="Carregando dados...">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Carregando veículo...</div>
        </div>
      </AdminLayout>
    )
  }

  if (!vehicle) {
    return (
      <AdminLayout title="Veículo não encontrado" subtitle="Erro ao carregar dados">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg text-red-600">Veículo não encontrado</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Editar Veículo">
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Cabeçalho Moderno */}
          <div  className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Editar Veículo
                </h1>
                <p className="text-gray-600 mt-3 text-lg">Atualize as informações do veículo</p>
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
                <p className="text-gray-600">Gerencie as imagens do veículo</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Upload de novas imagens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Adicionar Novas Imagens
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-edit"
                  />
                  <label htmlFor="image-upload-edit" className="cursor-pointer">
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

              {/* Preview das novas imagens selecionadas */}
              {formData.images.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Novas Imagens Selecionadas:</h4>
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
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                          Nova
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gerenciador de imagens existentes */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                  <span className="mr-2">🔧</span>
                  Gerenciar Imagens Existentes
                </h4>
                <VehicleImageManager
                  vehicleId={vehicleId}
                  onImagesChange={handleImagesChange}
                />
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
              {/* Linha 1 */}
              <div className="md:col-span-2 flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Placa</label>
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
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo 10 caracteres (ex: ABC-1234)
                  </p>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    📋 Detalhes
                  </button>
                </div>
                <div className="flex items-end">
                  <div className="flex gap-3">
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

              {/* Linha 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Veículo</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-3">Combustível</label>
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

              {/* Linha 3 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Marca</label>
                <Select2
                  value={`brand_${formData.brand_id}_${brands.findIndex(b => b.id === formData.brand_id)}`}
                  onChange={(value: string | number) => {
                    const brandId = String(value).replace('brand_', '').split('_')[0]
                    handleBrandChange(Number(brandId))
                  }}
                  options={brands.filter(brand => brand && brand.name).map((brand, index) => ({ value: `brand_${brand.id}_${index}`, label: brand.name }))}
                  placeholder="Selecione a marca"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Cor</label>
                <Select2
                  value={formData.color}
                  onChange={(value: string | number) => handleInputChange('color', value as string)}
                  options={[
                    { value: 'white', label: '⚪ Branco' },
                    { value: 'black', label: '⚫ Preto' },
                    { value: 'silver', label: '⚪ Prata' },
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
                <label className="block text-sm font-medium text-gray-700 mb-3">Modelo</label>
                <Select2
                  value={`model_${formData.model_id}_${models.findIndex(m => m.id === formData.model_id)}`}
                  onChange={async (value: string | number) => {
                    const modelId = String(value).replace('model_', '').split('_')[0]
                    await handleModelChange(Number(modelId))
                  }}
                  options={models.filter(model => model && model.name).map((model, index) => ({ value: `model_${model.id}_${index}`, label: model.name }))}
                  placeholder="SELECIONE"
                  disabled={!selectedBrandId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Câmbio</label>
                <Select2
                  value={formData.transmission}
                  onChange={(value: string | number) => handleInputChange('transmission', value as string)}
                  options={[
                    { value: 'manual', label: 'Manual' },
                    { value: 'automatica', label: 'Automático' },
                    { value: 'cvt', label: 'CVT' },
                    { value: 'automatizada', label: 'Semi-automático' }
                  ]}
                  placeholder="Selecione uma opção"
                />
              </div>

              {/* Linha 5 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Ano Fab./Modelo</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-3">KM</label>
                <input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange('mileage', Number(e.target.value))}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="Não exibir km"
                />
              </div>

              {/* Linha 6 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Versão</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  placeholder="Ex: 2.0 Flex"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Portas</label>
                <Select2
                  value={formData.doors}
                  onChange={(value: string | number) => handleInputChange('doors', Number(value))}
                  options={[
                    { value: 2, label: '2' },
                    { value: 3, label: '3' },
                    { value: 4, label: '4' },
                    { value: 5, label: '5' }
                  ]}
                  placeholder="Selecione uma opção"
                />
              </div>

              {/* Linha 7 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preço Loja
                </label>
                <input
                  type="text"
                  value={formatPrice(formData.price)}
                  onChange={(e) => handleInputChange('price', Number(removeCurrencyMask(e.target.value)))}
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
                  value={formatPrice(formData.classified_price)}
                  onChange={(e) => handleInputChange('classified_price', Number(removeCurrencyMask(e.target.value)))}
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
                <div className="flex items-center mb-4">
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.use_same_observation === 1}
                        onChange={(e) => handleInputChange('use_same_observation', e.target.checked ? 1 : 0)}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        formData.use_same_observation === 1
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent'
                          : 'border-gray-300 group-hover:border-blue-400'
                      }`}>
                        {formData.use_same_observation === 1 && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">
                      Utilizar a mesma observação de site nos classificados.
                    </span>
                  </label>
                </div>

                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
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
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                ➕ Adicionar
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
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                            placeholder="Nome do classificado"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={observation}
                            onChange={(e) => updateClassifiedInfo(index, e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                            placeholder="Observação específica"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={observation}
                            onChange={(e) => updateClassifiedInfo(index, e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
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
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.accept_financing === 1}
                    onChange={(e) => handleInputChange('accept_financing', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.accept_financing === 1
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-transparent'
                      : 'border-gray-300 group-hover:border-green-400'
                  }`}>
                    {formData.accept_financing === 1 && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">💰 Aceita Financiamento</span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.accept_exchange === 1}
                    onChange={(e) => handleInputChange('accept_exchange', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.accept_exchange === 1
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-transparent'
                      : 'border-gray-300 group-hover:border-blue-400'
                  }`}>
                    {formData.accept_exchange === 1 && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">🔄 Aceita Troca</span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.is_featured === 1}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.is_featured === 1
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 border-transparent'
                      : 'border-gray-300 group-hover:border-yellow-400'
                  }`}>
                    {formData.is_featured === 1 && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">⭐ Destaque</span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.is_licensed === 1}
                    onChange={(e) => handleInputChange('is_licensed', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.is_licensed === 1
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-transparent'
                      : 'border-gray-300 group-hover:border-purple-400'
                  }`}>
                    {formData.is_licensed === 1 && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">📋 Licenciado</span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.has_warranty === 1}
                    onChange={(e) => handleInputChange('has_warranty', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.has_warranty === 1
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-500 border-transparent'
                      : 'border-gray-300 group-hover:border-indigo-400'
                  }`}>
                    {formData.has_warranty === 1 && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">🛡️ Tem Garantia</span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.is_adapted === 1}
                    onChange={(e) => handleInputChange('is_adapted', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.is_adapted === 1
                      ? 'bg-gradient-to-r from-teal-500 to-green-500 border-transparent'
                      : 'border-gray-300 group-hover:border-teal-400'
                  }`}>
                    {formData.is_adapted === 1 && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">♿ Adaptado</span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.is_armored === 1}
                    onChange={(e) => handleInputChange('is_armored', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.is_armored === 1
                      ? 'bg-gradient-to-r from-gray-600 to-gray-800 border-transparent'
                      : 'border-gray-300 group-hover:border-gray-400'
                  }`}>
                    {formData.is_armored === 1 && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">🛡️ Blindado</span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.has_spare_key === 1}
                    onChange={(e) => handleInputChange('has_spare_key', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.has_spare_key === 1
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 border-transparent'
                      : 'border-gray-300 group-hover:border-amber-400'
                  }`}>
                    {formData.has_spare_key === 1 && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">🔑 Tem Chave Reserva</span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.ipva_paid === 1}
                    onChange={(e) => handleInputChange('ipva_paid', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.ipva_paid === 1
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 border-transparent'
                      : 'border-gray-300 group-hover:border-red-400'
                  }`}>
                    {formData.ipva_paid === 1 && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">📄 IPVA Pago</span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.has_manual === 1}
                    onChange={(e) => handleInputChange('has_manual', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.has_manual === 1
                      ? 'bg-gradient-to-r from-sky-500 to-blue-500 border-transparent'
                      : 'border-gray-300 group-hover:border-sky-400'
                  }`}>
                    {formData.has_manual === 1 && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">📚 Tem Manual</span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.auction_history === 1}
                    onChange={(e) => handleInputChange('auction_history', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.auction_history === 1
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 border-transparent'
                      : 'border-gray-300 group-hover:border-violet-400'
                  }`}>
                    {formData.auction_history === 1 && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">🏛️ Histórico de Leilão</span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.dealer_serviced === 1}
                    onChange={(e) => handleInputChange('dealer_serviced', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.dealer_serviced === 1
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 border-transparent'
                      : 'border-gray-300 group-hover:border-emerald-400'
                  }`}>
                    {formData.dealer_serviced === 1 && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">🔧 Serviçado na Concessionária</span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.single_owner === 1}
                    onChange={(e) => handleInputChange('single_owner', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.single_owner === 1
                      ? 'bg-gradient-to-r from-rose-500 to-red-500 border-transparent'
                      : 'border-gray-300 group-hover:border-rose-400'
                  }`}>
                    {formData.single_owner === 1 && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">👤 Único Proprietário</span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.is_active === 1}
                    onChange={(e) => handleInputChange('is_active', e.target.checked ? 1 : 0)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    formData.is_active === 1
                      ? 'bg-gradient-to-r from-lime-500 to-green-500 border-transparent'
                      : 'border-gray-300 group-hover:border-lime-400'
                  }`}>
                    {formData.is_active === 1 && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">✅ Ativo</span>
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
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Selecione as características que se aplicam ao veículo
              </p>
              <button
                type="button"
                onClick={() => {
                  const allNames = DEFAULT_VEHICLE_CHARACTERISTICS.map(c => c.name)
                  setFormData(prev => ({ ...prev, standard_features: allNames }))
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🎯 SELECIONAR TODOS
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEFAULT_VEHICLE_CHARACTERISTICS.map(characteristic => {
                const isChecked = formData.standard_features.includes(characteristic.name)
                return (
                <label key={characteristic.id} className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isChecked}
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
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent'
                        : 'border-gray-300 group-hover:border-blue-400'
                    }`}>
                      {formData.standard_features.includes(characteristic.name) && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">
                    {characteristic.name}
                  </span>
                </label>
                )
              })}
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
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Selecione os opcionais disponíveis no veículo
              </p>
              <button
                type="button"
                onClick={() => {
                  const allNames = DEFAULT_VEHICLE_OPTIONALS.map(o => o.name)
                  setFormData(prev => ({ ...prev, optional_features: allNames }))
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                ⭐ SELECIONAR TODOS
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DEFAULT_VEHICLE_OPTIONALS.map(optional => {
                const isChecked = formData.optional_features.includes(optional.name)
                return (
                <label key={optional.id} className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isChecked}
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
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-transparent'
                        : 'border-gray-300 group-hover:border-green-400'
                    }`}>
                      {formData.optional_features.includes(optional.name) && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-gray-700 group-hover:text-gray-900 transition-colors">
                    {optional.name}
                  </span>
                </label>
                )
              })}
            </div>
          </Collapse>

          {/* Botões de ação - Modernos */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 border border-blue-500/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Pronto para atualizar?</h3>
                <p className="text-blue-100">Clique no botão abaixo para salvar as alterações</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={isLoadingVehicle}
                  className="w-full sm:w-auto bg-white text-blue-600 py-4 px-8 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingVehicle ? '⏳ Atualizando...' : '🚗 Atualizar Veículo'}
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
