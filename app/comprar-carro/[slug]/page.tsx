'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import PortalLayout from '../../portal/layout'
import { getPortalVehicle } from '@/lib/portal-api'
import { parseVehicleSlug, normalizeTransmissionDisplay, normalizeFuelTypeDisplay } from '@/lib/slug-utils'
import { useSEOMetaTags, generateVehicleDetailMetaTags } from '@/lib/seo-metatags'
import { processContentVariations } from '@/lib/content-variations'
import VehicleCard from '@/components/ui/VehicleCard'

// Interfaces
interface VehicleImage {
  id: number
  image_url: string
  is_primary: boolean
}

interface VehicleBrand {
  id: number
  name: string
}

interface VehicleModel {
  id: number
  name: string
}

interface VehicleDetails {
  id: number
  title: string
  main_image: string | { url: string; id: number } | null
  images: VehicleImage[] | null
  city: string | null
  price: number | null
  year: number | null
  mileage: number | null
  fuel_type: string | null
  transmission: string | null
  brand: VehicleBrand | string | null
  model: VehicleModel | string
  description: string | null
  status: string
  created_at: string
  features?: string[]
  specifications?: Record<string, string>
  video_link?: string | null
}

function VehicleDetailsContent() {
  const params = useParams()
  const slug = params?.slug as string

  // Extrair dados do slug (incluindo ID)
  const slugData = parseVehicleSlug(slug)
  const vehicleId = slugData.id?.toString()

  const [vehicle, setVehicle] = useState<VehicleDetails | null>(null)
  const [tenant, setTenant] = useState<{
    id: number;
    name: string;
    subdomain: string;
    profile?: { company_name?: string; logo_url?: string; company_phone?: string; company_email?: string, company_website?: string; address?: string }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  // const [currentThumbnailIndex, setCurrentThumbnailIndex] = useState(0)
  // const [selectedPriceType, setSelectedPriceType] = useState('cash')
  // const [deliveryType, setDeliveryType] = useState('delivery')
  const [showMoreDescription, setShowMoreDescription] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [currentRelatedIndex, setCurrentRelatedIndex] = useState(0)
  const [relatedVehicles, setRelatedVehicles] = useState<VehicleDetails[]>([])
  const [isLoadingRelated, setIsLoadingRelated] = useState(false)
  const [vehicleArticle, setVehicleArticle] = useState<string>('')
  const [isLoadingArticle, setIsLoadingArticle] = useState(false)
  const [showFullArticle, setShowFullArticle] = useState(false)

  // Aplicar meta tags SEO completas com dados reais da API
  const metaTags = vehicle ? generateVehicleDetailMetaTags(vehicle as unknown as Parameters<typeof generateVehicleDetailMetaTags>[0], tenant) : {}
  useSEOMetaTags(metaTags, tenant)

  // Função para gerar link do WhatsApp
  const generateWhatsAppLink = useCallback((message?: string) => {
    const whatsappNumber = tenant?.profile?.company_phone

    if (!whatsappNumber) {
      console.warn('Número do WhatsApp não encontrado nos dados do tenant')
      // Fallback para o número real da Ômega Veículos
      const fallbackNumber = '551530340800'
      const encodedMessage = encodeURIComponent(message || 'Olá! Tenho interesse neste veículo.')
      return `https://wa.me/${fallbackNumber}?text=${encodedMessage}`
    }

    // Limpar e formatar o número (remover caracteres especiais)
    const cleanNumber = whatsappNumber.replace(/\D/g, '')

    // Adicionar código do país se não tiver (assumindo Brasil)
    const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`

    // Mensagem padrão se não for fornecida
    const defaultMessage = message || `Olá! Tenho interesse no veículo ${vehicle?.brand} ${vehicle?.model} ${vehicle?.year}. Podem me enviar mais informações?`

    // Codificar a mensagem para URL
    const encodedMessage = encodeURIComponent(defaultMessage)

    return `https://wa.me/${formattedNumber}?text=${encodedMessage}`
  }, [tenant, vehicle])

  // Função para obter URL da imagem
  const getImageUrl = useCallback((image: string | { url: string; id: number } | null): string => {
    if (!image) return '/portal/assets/img/cars/slider-01.jpg'
    if (typeof image === 'string') return image
    return image.url || '/portal/assets/img/cars/slider-01.jpg'
  }, [])

  // Função para obter imagens do veículo
  const getImages = useCallback((): string[] => {
    if (!vehicle) {
      console.log('🚗 Veículo não carregado, usando imagens padrão')
      return ['/portal/assets/img/cars/slider-01.jpg']
    }

    console.log('🖼️ Processando imagens do veículo:', {
      main_image: vehicle.main_image,
      images: vehicle.images,
      images_length: vehicle.images?.length || 0
    })

    const validImages: string[] = []

    // Adicionar imagem principal primeiro se existir
    if (vehicle.main_image) {
      const mainImageUrl = getImageUrl(vehicle.main_image)
      console.log('🖼️ Imagem principal processada:', { mainImageUrl })
      if (mainImageUrl && typeof mainImageUrl === 'string' && mainImageUrl.trim() !== '') {
        validImages.push(mainImageUrl)
        console.log('✅ Imagem principal adicionada:', mainImageUrl)
      }
    }

    // Adicionar imagens do array images se existirem e forem válidas
    if (vehicle.images && vehicle.images.length > 0) {
      console.log('🖼️ Processando imagens adicionais:', vehicle.images)
      vehicle.images.forEach((img, index) => {
        // A API retorna 'url' não 'image_url'
        const imageUrl = (img as { url?: string }).url || img.image_url
        console.log(`🖼️ Imagem ${index + 1}:`, { img, imageUrl })
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
          // Evitar duplicatas
          if (!validImages.includes(imageUrl)) {
            validImages.push(imageUrl)
            console.log('✅ Imagem adicional adicionada:', imageUrl)
          } else {
            console.log('⚠️ Imagem duplicada ignorada:', imageUrl)
          }
        } else {
          console.log('❌ Imagem inválida ignorada:', { img, imageUrl })
        }
      })
    } else {
      console.log('⚠️ Nenhuma imagem adicional encontrada')
    }

    // Se não há imagens suficientes, adicionar imagens padrão
    if (validImages.length < 3) {
      const fallbackImages = [
        '/portal/assets/img/cars/slider-01.jpg',
        '/portal/assets/img/cars/slider-02.jpg',
        '/portal/assets/img/cars/slider-03.jpg',
        '/portal/assets/img/cars/slider-04.jpg',
        '/portal/assets/img/cars/slider-05.jpg'
      ]

      // Adicionar imagens de fallback que não duplicam as existentes
      fallbackImages.forEach(fallbackImg => {
        if (!validImages.includes(fallbackImg)) {
          validImages.push(fallbackImg)
        }
      })
    }

    // Garantir que sempre retornamos pelo menos 3 imagens únicas
    const uniqueImages = [...new Set(validImages)]
    console.log('🖼️ Imagens finais processadas:', {
      validImages,
      uniqueImages,
      count: uniqueImages.length
    })

    // Se ainda não temos 3 imagens únicas, usar fallback padrão
    if (uniqueImages.length < 3) {
      console.log('⚠️ Usando imagens de fallback padrão')
      return [
        '/portal/assets/img/cars/slider-01.jpg',
        '/portal/assets/img/cars/slider-02.jpg',
        '/portal/assets/img/cars/slider-03.jpg'
      ]
    }

    console.log('✅ Retornando imagens únicas:', uniqueImages)
    return uniqueImages
  }, [vehicle, getImageUrl])

  // Funções de navegação de imagem
  const nextImage = useCallback(() => {
    const images = getImages()
    if (images.length > 1) {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }, [getImages])

  const prevImage = useCallback(() => {
    const images = getImages()
    if (images.length > 1) {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }, [getImages])

  // Navegação por teclado
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Navegação normal do carrossel
      if (event.key === 'ArrowLeft') {
        prevImage()
      } else if (event.key === 'ArrowRight') {
        nextImage()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [nextImage, prevImage])

  // Funções de navegação do carrossel de miniaturas
  // const prevThumbnail = () => {
  //   setCurrentThumbnailIndex(prev =>
  //     prev > 0 ? prev - 1 : Math.max(0, Math.ceil(images.length / 4) - 1)
  //   )
  // }

  // const nextThumbnail = () => {
  //   setCurrentThumbnailIndex(prev =>
  //     prev < Math.ceil(images.length / 4) - 1 ? prev + 1 : 0
  //   )
  // }

  // Funções de navegação do carrossel
  const prevRelatedVehicle = () => {
    setCurrentRelatedIndex(prev =>
      prev > 0 ? prev - 1 : Math.max(0, Math.ceil(relatedVehicles.length / 3) - 1)
    )
  }

  const nextRelatedVehicle = () => {
    setCurrentRelatedIndex(prev =>
      prev < Math.ceil(relatedVehicles.length / 3) - 1 ? prev + 1 : 0
    )
  }


  const getBrandName = (brand: VehicleBrand | string | null): string => {
    if (!brand) return 'Marca'
    if (typeof brand === 'string') return brand
    return brand.name || 'Marca'
  }

  // Função para processar conteúdo com variações
  const processContent = useCallback((content: string) => {
    return processContentVariations(content)
  }, [])

  // Função para gerar artigo sobre o veículo
  const generateVehicleArticle = useCallback(async (vehicleData: VehicleDetails) => {
    setIsLoadingArticle(true)
    try {

      const brandName = getBrandName(vehicleData.brand)

      const modelName = typeof vehicleData.model === 'string' ? vehicleData.model : vehicleData.model?.name || 'Modelo'

      const year = vehicleData.year || '2024'

      const fuelType = vehicleData.fuel_type || 'Flex'

      const transmission = vehicleData.transmission || 'Automática'

      const mileage = vehicleData.mileage ? `${vehicleData.mileage.toLocaleString('pt-BR')} km` : 'Baixa quilometragem'

      const price = vehicleData.price ? `R$ ${vehicleData.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Preço especial'

      // Gerar artigo dinâmico baseado nas características do veículo (sem a introdução)
      const articleFull =
        '<div class="space-y-6">' +
          '<div class="grid md:grid-cols-2 gap-6">' +
            '<div class="bg-white p-6 rounded-lg shadow-sm border">' +
              '<h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">' +
                '<span class="text-orange-500 mr-2">⚡</span>' +
                'Performance e Tecnologia' +
              '</h3>' +
              '<p class="text-gray-700 leading-relaxed mb-4">' + processContent("{O | Este} <strong>" + brandName + " " + modelName + "</strong> {é ideal para quem deseja|é perfeito para você que quer|foi feito para quem procura} {comprar carro|adquirir veículo|garantir seu automóvel} com {desempenho superior|performance impressionante|potência e economia}. Seu motor " + fuelType.toLowerCase() + " {oferece|garante|entrega} {excelente economia de combustível|ótima eficiência|baixo consumo} sem abrir mão da potência. A transmissão " + transmission.toLowerCase() + " {proporciona|garante|entrega} trocas {suaves|precisas|confortáveis}, tornando cada viagem {um prazer|mais agradável|única}.") + '</p>' +
              '<ul class="space-y-2 text-gray-600">' +
                '<li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Motor ' + processContent(fuelType + " {eficiente|econômico|potente}") + '</li>' +
                '<li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Transmissão ' + processContent(transmission) + '</li>' +
                '<li class="flex items-center"><span class="text-green-500 mr-2">✓</span> ' + processContent("{Tecnologia de ponta|Soluções tecnológicas avançadas}") + '</li>' +
                '<li class="flex items-center"><span class="text-green-500 mr-2">✓</span> ' + processContent("{Performance otimizada|Alto desempenho}") + '</li>' +
              '</ul>' +
            '</div>' +
            '<div class="bg-white p-6 rounded-lg shadow-sm border">' +
              '<h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">' +
                '<span class="text-blue-500 mr-2">🛡️</span>' +
                'Confiabilidade e Histórico' +
              '</h3>' +
              '<p class="text-gray-700 leading-relaxed mb-4">' + processContent("Com apenas <strong>" + mileage + "</strong>, este " + brandName + " " + modelName + " " + year + " {mostra|demonstra|revela} um histórico de uso {cuidadoso|bem preservado|exemplar}, perfeito para quem busca {comprar carro usado|comprar seminovo|adquirir um veículo de qualidade}. A marca " + brandName + " é {sinônimo de confiança|reconhecida por sua confiabilidade|referência em durabilidade}.") + '</p>' +
              '<ul class="space-y-2 text-gray-600">' +
                '<li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Quilometragem: ' + processContent(mileage) + '</li>' +
                '<li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Histórico de manutenção ' + processContent("{em dia|completo|verificado}") + '</li>' +
                '<li class="flex items-center"><span class="text-green-500 mr-2">✓</span> Marca ' + processContent("{confiável|respeitada|líder de mercado}") + '</li>' +
                '<li class="flex items-center"><span class="text-green-500 mr-2">✓</span> ' + processContent("{Ótimo estado de conservação|Excelente condição geral}") + '</li>' +
              '</ul>' +
            '</div>' +
          '</div>' +
          '<div class="bg-gradient-to-r from-green-50 to-orange-50 p-6 rounded-lg">' +
            '<h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">' +
              '<span class="text-green-500 mr-2">💰</span>' +
              'Oportunidade Única de Investimento' +
            '</h3>' +
            '<p class="text-gray-700 leading-relaxed mb-4">' + processContent("Este <strong>" + brandName + " " + modelName + " " + year + "</strong> é uma {oportunidade rara|chance imperdível|oferta exclusiva} para quem deseja {comprar carro novo|comprar veículo seminovo|adquirir um usado de confiança}. Com preço especial de <strong>" + price + "</strong>, você está {levando mais que um carro|fazendo um ótimo negócio|investindo em qualidade}.") + '</p>' +
            '<div class="bg-white p-4 rounded-lg border-l-4 border-green-500">' +
              '<p class="text-gray-800 font-medium">' + processContent("🎯 <strong>Por que escolher este veículo?</strong><br>• {Melhor custo-benefício|Preço competitivo}<br>• {Tecnologia moderna|Recursos atuais e inteligentes}<br>• {Marca respeitada|Confiabilidade garantida}<br>• {Histórico de manutenção em dia|Manutenção comprovada}<br>• {Pronto para rodar|Entrega imediata}") + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="bg-white p-6 rounded-lg shadow-sm border">' +
            '<h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">' +
              '<span class="text-purple-500 mr-2">🌟</span>' +
              'Experiência de Condução Excepcional' +
            '</h3>' +
            '<div class="text-gray-700 leading-relaxed">' + processContent("{Dirigir|Pilotar|Conduzir} um <strong>" + brandName + " " + modelName + "</strong> é {uma experiência única|puro prazer|sinônimo de conforto e tecnologia}. Cada detalhe foi {projetado|pensado|desenvolvido} para {encantar|satisfazer|superar expectativas} de quem procura {comprar carros novos|comprar veículos seminovos|trocar de carro com segurança}.") + '</div>' +
            '<div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">' +
              '<div class="text-center p-3 bg-gray-50 rounded-lg">' +
                '<div class="text-2xl mb-2">🚗</div>' +
                '<div class="text-sm font-medium text-gray-700">Conforto</div>' +
              '</div>' +
              '<div class="text-center p-3 bg-gray-50 rounded-lg">' +
                '<div class="text-2xl mb-2">🔒</div>' +
                '<div class="text-sm font-medium text-gray-700">Segurança</div>' +
              '</div>' +
              '<div class="text-center p-3 bg-gray-50 rounded-lg">' +
                '<div class="text-2xl mb-2">⚡</div>' +
                '<div class="text-sm font-medium text-gray-700">Eficiência</div>' +
              '</div>' +
              '<div class="text-center p-3 bg-gray-50 rounded-lg">' +
                '<div class="text-2xl mb-2">🎵</div>' +
                '<div class="text-sm font-medium text-gray-700">Tecnologia</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500">' +
            '<h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">' +
              '<span class="text-orange-500 mr-2">🎯</span>' +
              'Não Perca Esta Oportunidade!' +
            '</h3>' +
            '<p class="text-gray-700 leading-relaxed mb-4">' + processContent("{Veículos|Carros|Automóveis} como este <strong>" + brandName + " " + modelName + " " + year + "</strong> {vendem rápido|saem do estoque em pouco tempo|não ficam disponíveis por muito tempo}. Se você quer {comprar carro usado|comprar carro novo|garantir seu seminovo}, esta é a hora! {Clique agora|Entre em contato|Garanta já o seu} e {faça um excelente negócio|não perca essa chance|tenha seu próximo carro hoje mesmo}.") + '</p>' +
            '<div class="flex flex-col sm:flex-row gap-4">' +
              '<button class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">' +
                '🚗 Quero Comprar Agora!' +
              '</button>' +
              '<button class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">' +
                '📱 Falar no WhatsApp' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>'

      // Armazenar ambas as versões do artigo
      setVehicleArticle(articleFull)
    } catch (error) {
      console.error('❌ Erro ao gerar artigo do veículo:', error)
      setVehicleArticle('')
    } finally {
      setIsLoadingArticle(false)
    }
  }, [processContent])


  // Função para buscar veículos relacionados da mesma marca
  const loadRelatedVehicles = async (tenantId: number, excludeId: number, currentBrand: { id: number; name: string } | null) => {
    try {
      setIsLoadingRelated(true)

      // Usar a mesma API externa que o resto do sistema
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.api.omegaveiculos.com.br/api'

      // Se temos uma marca atual, filtrar por marca usando o mesmo filtro do portal
      let url = `${apiUrl}/portal/vehicles?per_page=20`
      if (currentBrand && currentBrand.id) {
        url += `&brand_id=${currentBrand.id}`
      }

      const response = await fetch(url, {
        headers: {
          'X-Tenant-Subdomain': 'omegaveiculos',
          'Accept': 'application/json'
        }
      })
      const data = await response.json()

      if (data.success && data.data && data.data.length > 0) {
        const allVehicles = data.data

        // Filtrar o veículo atual
        const filteredVehicles = allVehicles.filter((vehicle: { id: number }) => vehicle.id !== excludeId)

        // Pegar até 3 veículos da mesma marca
        const shuffled = [...filteredVehicles].sort(() => Math.random() - 0.5)
        const relatedVehicles = shuffled.slice(0, 3)

        console.log(`🔍 Veículos da marca ${currentBrand?.name || 'Não Informado'} encontrados: ${relatedVehicles.length}`)

        setRelatedVehicles(relatedVehicles)
      } else {
        setRelatedVehicles([])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar veículos relacionados:', error)
      setRelatedVehicles([])
    } finally {
      setIsLoadingRelated(false)
    }
  }







  useEffect(() => {
    const loadData = async () => {
      if (!vehicleId) return


      try {
        setIsLoading(true)
        const subdomain = 'omegaveiculos'

        // Carregar dados do veículo específico usando o ID extraído do slug
        const vehicleData = await getPortalVehicle(subdomain, parseInt(vehicleId))

        if (vehicleData) {
          console.log('🚗 Dados do veículo recebidos:', vehicleData)
          console.log('🖼️ Imagens do veículo:', {
            main_image: vehicleData.main_image,
            images: vehicleData.images,
            images_type: typeof vehicleData.images,
            images_length: vehicleData.images?.length || 0
          })

          // Carregar dados do tenant dos dados do veículo
          if (vehicleData.tenant) {
            const tenantData = vehicleData.tenant as typeof vehicleData.tenant & {
              logo_url?: string;
              company_phone?: string;
              phone?: string;
              company_email?: string;
              email?: string;
              address?: string;
            }

            setTenant({
              id: tenantData.id,
              name: tenantData.name,
              subdomain: tenantData.subdomain,
              profile: {
                company_name: tenantData.name,
                logo_url: tenantData.logo_url,
                company_phone: tenantData.company_phone || tenantData.phone,
                company_email: tenantData.company_email || tenantData.email,
                address: tenantData.address
              }
            })
          }

          // Preparar imagens para o carrossel
          const images: VehicleImage[] = []

          // Adicionar imagem principal se existir
          if (vehicleData.main_image) {
            const mainImageUrl = typeof vehicleData.main_image === 'string'
              ? vehicleData.main_image
              : (vehicleData.main_image as { url: string }).url
            images.push({
        id: 1,
              image_url: mainImageUrl,
              is_primary: true
            })
          }

          // Adicionar imagens adicionais se existirem
          if (vehicleData.images && vehicleData.images.length > 0) {
            vehicleData.images.forEach((img, index) => {
              images.push({
                id: img.id || index + 2,
                image_url: (img as { url?: string }).url || img.image_url, // A API retorna 'url' não 'image_url'
                is_primary: img.is_primary || false
              })
            })
          }

          // Se não há imagens suficientes, adicionar imagens padrão
          if (images.length < 3) {
            const fallbackImages = [
              { id: 1001, image_url: '/portal/assets/img/cars/slider-01.jpg', is_primary: false },
              { id: 1002, image_url: '/portal/assets/img/cars/slider-02.jpg', is_primary: false },
              { id: 1003, image_url: '/portal/assets/img/cars/slider-03.jpg', is_primary: false },
              { id: 1004, image_url: '/portal/assets/img/cars/slider-04.jpg', is_primary: false },
              { id: 1005, image_url: '/portal/assets/img/cars/slider-05.jpg', is_primary: false }
            ]

            // Adicionar imagens de fallback que não duplicam as existentes
            fallbackImages.forEach(fallbackImg => {
              if (!images.some(img => img.image_url === fallbackImg.image_url)) {
                images.push(fallbackImg)
              }
            })
          }

          const convertedVehicle: VehicleDetails = {
            id: vehicleData.id,
            title: vehicleData.title,
            main_image: vehicleData.main_image,
            images: images,
            city: vehicleData.city || 'São Paulo, SP',
            price: vehicleData.price ? parseFloat(vehicleData.price.toString()) / 100 : null,
            year: vehicleData.year,
            mileage: vehicleData.mileage,
            fuel_type: vehicleData.fuel_type,
            transmission: vehicleData.transmission,
            brand: vehicleData.brand || 'Marca',
            model: vehicleData.model || 'Modelo',
            description: vehicleData.description || 'Descrição não disponível',
            status: vehicleData.status || 'active',
            created_at: vehicleData.created_at || new Date().toISOString(),
            video_link: vehicleData.video_link || null,
        features: [
          'Ar condicionado multi-zona',
          'Bancos aquecidos',
          'Sistema de navegação',
          'Sistema de som premium',
          'Bluetooth',
          'Partida sem chave',
          'Bancos com memória',
          '6 cilindros',
          'Controle de cruzeiro adaptativo',
          'Limpadores intermitentes',
          '4 vidros elétricos'
        ],
        specifications: {
          // 'Carroceria': 'Cupê',
              'Marca': getBrandName(vehicleData.brand || 'Marca'),
              'Transmissão': normalizeTransmissionDisplay(vehicleData.transmission || ''),
              'Tipo de Combustível': normalizeFuelTypeDisplay(vehicleData.fuel_type || ''),
              'Quilometragem': vehicleData.mileage ? `${vehicleData.mileage} km` : 'Não Informado',
          // 'Tração': 'Traseira',
              'Ano': vehicleData.year?.toString() || 'Não Informado',
          'Ar Condicionado': 'Sim',

              'Portas': '4 portas',
          'Freios': 'ABS',
              'Motor (HP)': 'Não Informado'
            }
          }
          setVehicle(convertedVehicle)

          // Gerar artigo sobre o veículo
          generateVehicleArticle(convertedVehicle)

          // Carregar veículos relacionados da mesma marca
          if (vehicleData.tenant?.id) {
            const brandData = typeof vehicleData.brand === 'object' ? vehicleData.brand : null
            loadRelatedVehicles(vehicleData.tenant.id, parseInt(vehicleId), brandData)
          }
        } else {
          // Se não encontrar dados, usar dados padrão
          const defaultVehicle: VehicleDetails = {
            id: parseInt(vehicleId),
            title: 'Veículo não encontrado',
            main_image: '/portal/assets/img/cars/slider-01.jpg',
            images: [
              { id: 1, image_url: '/portal/assets/img/cars/slider-01.jpg', is_primary: true },
              { id: 2, image_url: '/portal/assets/img/cars/slider-02.jpg', is_primary: false },
              { id: 3, image_url: '/portal/assets/img/cars/slider-03.jpg', is_primary: false },
              { id: 4, image_url: '/portal/assets/img/cars/slider-04.jpg', is_primary: false },
              { id: 5, image_url: '/portal/assets/img/cars/slider-05.jpg', is_primary: false }
            ],
            city: 'São Paulo, SP',
            price: null,
            year: null,
            mileage: null,
            fuel_type: null,
            transmission: null,
            brand: 'Marca',
            model: 'Modelo',
            description: 'Veículo não encontrado ou indisponível.',
            status: 'inactive',
            created_at: new Date().toISOString(),
            video_link: null,
            features: [],
            specifications: {}
          }
          setVehicle(defaultVehicle)
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do veículo:', error)
        // Em caso de erro, usar dados padrão
        const errorVehicle: VehicleDetails = {
          id: parseInt(vehicleId),
          title: 'Erro ao carregar veículo',
          main_image: '/portal/assets/img/cars/slider-01.jpg',
          images: [
            { id: 1, image_url: '/portal/assets/img/cars/slider-01.jpg', is_primary: true },
            { id: 2, image_url: '/portal/assets/img/cars/slider-02.jpg', is_primary: false },
            { id: 3, image_url: '/portal/assets/img/cars/slider-03.jpg', is_primary: false },
            { id: 4, image_url: '/portal/assets/img/cars/slider-04.jpg', is_primary: false },
            { id: 5, image_url: '/portal/assets/img/cars/slider-05.jpg', is_primary: false }
          ],
          city: 'São Paulo, SP',
          price: null,
          year: null,
          mileage: null,
          fuel_type: null,
          transmission: null,
          brand: 'Marca',
          model: 'Modelo',
          description: 'Erro ao carregar dados do veículo. Tente novamente mais tarde.',
          status: 'inactive',
          created_at: new Date().toISOString(),
          video_link: null,
          features: [],
          specifications: {}
        }
        setVehicle(errorVehicle)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [vehicleId, generateVehicleArticle])

  // Carregar dados do tenant da API real
  useEffect(() => {
    const loadTenantData = async () => {
      try {
        console.log('🔍 Carregando dados do tenant da API...')

        // Buscar dados reais do tenant da API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.api.omegaveiculos.com.br/api'
        const response = await fetch(`${apiUrl}/portal/tenant-info`, {
          headers: {
            'X-Tenant-Subdomain': 'omegaveiculos',
            'Accept': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('✅ Dados do tenant carregados da API:', data)

        if (data.success && data.data) {
          const tenantData = data.data
          setTenant({
            id: tenantData.id,
            name: tenantData.name,
            subdomain: tenantData.subdomain,
            profile: {
              company_name: tenantData.profile?.company_name || tenantData.name,
              logo_url: tenantData.profile?.logo_url,
              company_phone: tenantData.profile?.company_phone || tenantData.portal_settings?.whatsapp?.number,
              company_email: tenantData.profile?.company_email,
              address: tenantData.profile?.address
            }
          })
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do tenant da API:', error)
        // Fallback para dados de exemplo em caso de erro
        const fallbackTenant = {
          id: 1,
          name: 'Ômega Veículos',
          subdomain: 'omegaveiculos',
          profile: {
            company_name: 'Ômega Veículos',
            logo_url: undefined,
            company_phone: '(15) 3034-0800',
            company_email: 'contato@omegaveiculos.com.br',
            address: 'R. Comendador Oetterer, 1483, LOJA, Vila Carvalho, Sorocaba, SP'
          }
        }
        setTenant(fallbackTenant)
      }
    }

    loadTenantData()
  }, [])

  // Verificar se vehicleId existe
  if (!vehicleId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ID do veículo não encontrado</h1>
          <Link
            href="/vehicles"
            className="text-orange-600 hover:text-orange-700"
            title="Voltar para lista de veículos"
          >
            ← Voltar para lista de veículos
          </Link>
        </div>
      </div>
    )
  }

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando detalhes do veículo...</p>
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded max-w-md mx-auto">
            <p className="text-yellow-800 font-bold">Teste Spintext:</p>
            <p className="text-yellow-700" id="spintext-test-result">Carregando...</p>
            <script dangerouslySetInnerHTML={{
              __html: `
                setTimeout(() => {
                  const result = window.spintextTestResult || 'Não encontrado';
                  document.getElementById('spintext-test-result').textContent = result;
                }, 1000);
              `
            }} />
          </div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Veículo não encontrado</h1>
          <Link
            href="/vehicles"
            className="text-orange-600 hover:text-orange-700"
            title="Voltar para lista de veículos"
          >
            ← Voltar para lista de veículos
          </Link>
        </div>
      </div>
    )
  }

  const images = getImages()
  const currentImage = images[currentImageIndex] || '/portal/assets/img/cars/slider-01.jpg'

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando veículo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <div className="bg-gray-800 py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              {vehicle.title} à Venda
            </h1>
            <nav className="flex justify-center" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-gray-300 hover:text-white flex items-center"
                    title="Ir para página inicial"
                    aria-label="Ir para página inicial"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span className="hidden sm:inline">{tenant?.profile?.company_name || tenant?.name || 'Omega Veículos'}</span>
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <Link
                    href="/comprar-carro"
                    className="text-gray-300 hover:text-white"
                    title="Ir para lista de Carros"
                    aria-label="Ir para lista de Carros"
                  >
                    <span className="hidden sm:inline">Comprar-Carro</span>
                    <span className="sm:hidden">...</span>
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-white font-medium" aria-current="page">
                  <span className="hidden sm:inline">{vehicle.title}</span>
                  <span className="sm:hidden truncate max-w-32 inline-block" title={vehicle.title || ''}>
                    {vehicle.title && vehicle.title.length > 15 ? vehicle.title.substring(0, 15) + '...' : vehicle.title || 'Carro'}
                  </span>
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Header do Veículo */}
      <section className="py-1 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">



          <div className="mt-1">

            <div className="hidden sm:flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt mr-1"></i>
                <span>Localização: {typeof vehicle.city === 'string' ? vehicle.city : 'São Paulo, SP'}</span>
              </div>
              <div className="flex items-center" itemScope itemType="https://schema.org/QuantitativeValue">
                <i className="fas fa-eye mr-1"></i>
                <span itemProp="name">Visualizações:</span>
                <span itemProp="value" className="ml-1">{Math.floor(Math.random() * 5000) + 5000}</span>
                <meta itemProp="unitCode" content="C62" />
              </div>
              <div className="flex items-center">
                <i className="fas fa-calendar mr-1"></i>
                <span>Publicado em: {vehicle.created_at ? new Date(vehicle.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '01 Jan, 2024'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-8 mb-0 lg:mb-0">
              <div className="flex items-center space-x-2">
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {getBrandName(vehicle.brand)}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {typeof vehicle.year === 'number' ? vehicle.year : String(vehicle.year || 'Não Informado')}
                </span>
              </div>
              <div className="flex items-center" itemScope itemType="https://schema.org/AggregateRating">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">⭐</span>
                ))}
                <span className="ml-2 text-gray-600">
                  (<span itemProp="ratingValue">{(4 + Math.random()).toFixed(1)}</span> -
                  <span itemProp="reviewCount">{Math.floor(Math.random() * 200) + 100}</span>)
              </span>
                <meta itemProp="bestRating" content="5" />
                <meta itemProp="worstRating" content="1" />
                <div itemProp="itemReviewed" itemScope itemType="https://schema.org/Car" style={{ display: 'none' }}>
                  <span itemProp="name">{vehicle.title}</span>
                  <div itemProp="brand" itemScope itemType="https://schema.org/Brand">
                    <span itemProp="name">{typeof vehicle.brand === 'string' ? vehicle.brand : vehicle.brand?.name}</span>
            </div>
                  <span itemProp="model">{typeof vehicle.model === 'string' ? vehicle.model : vehicle.model?.name}</span>
                  <span itemProp="vehicleModelDate">{vehicle.year}</span>
          </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-2">
            {/* Galeria de Imagens */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative">
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <Image
                    src={currentImage}
                    alt={`${vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} ${vehicle.model && typeof vehicle.model === 'object' ? vehicle.model.name : vehicle.model} ${vehicle.year} ${vehicle.transmission} ${vehicle.fuel_type} à Venda`}
                    fill
                    className="object-cover"
                    priority={currentImageIndex === 0}
                    loading={currentImageIndex === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 768px) 100vw, 66vw"
                    quality={85}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                  {images.length > 1 && (
                    <>
                  <button
                    onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 w-16 h-16 rounded-full hover:bg-opacity-70 transition-all z-10"
                        aria-label="Imagem anterior"
                  >
                        <i className="fas fa-chevron-left text-lg"></i>
                  </button>
                  <button
                    onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 w-16 h-16 rounded-full hover:bg-opacity-70 transition-all z-10"
                        aria-label="Próxima imagem"
                  >
                        <i className="fas fa-chevron-right text-lg"></i>
                  </button>
                    </>
                  )}
                </div>

                {/* Indicadores de posição */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                    {images.map((_, index) => (
                      <button
                        key={`indicator-${index}`}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-6 h-6 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-orange-500 scale-125'
                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                        aria-label={`Ir para imagem ${index + 1}`}
                        title={`Ir para imagem ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Thumbnails */}
                {/* {images.length > 1 && (
                  <div className="mt-4 bg-gray-50 p-4">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {images.map((image, index) => {
                        const imageSrc = (image && typeof image === 'string' && image.trim() !== '') ? image : '/portal/assets/img/cars/slider-01.jpg'
                        return (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                              index === currentImageIndex
                                ? 'border-orange-500 ring-2 ring-orange-200'
                                : 'border-gray-200 hover:border-orange-300'
                            }`}
                            aria-label={`Ir para imagem ${index + 1}`}
                            title={`Ir para imagem ${index + 1}`}
                          >
                            <Image
                              src={imageSrc}
                              alt={`${vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} ${vehicle.model && typeof vehicle.model === 'object' ? vehicle.model.name : vehicle.model} ${vehicle.year} ${vehicle.transmission} ${vehicle.fuel_type} à Venda - Imagem ${index + 1}`}
                              width={80}
                              height={64}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              quality={60}
                            />
                          </button>
                        )
                      })}
                    </div> */}

                    {/* Contador de imagens */}
                    {/* <div className="text-center pt-2">
                      <span className="text-sm text-gray-500">
                        {currentImageIndex + 1} de {images.length} imagens
                      </span>
                    </div>
                  </div>
                )} */}
              </div>
            </div>

            {/* Informações do Veículo */}
            <div className="bg-white rounded-lg shadow-sm p-6" itemScope itemType="https://schema.org/Offer">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Informações para comprar carro {vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} {vehicle.model && typeof vehicle.model === 'object' ? vehicle.model.name : vehicle.model} {vehicle.year}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Preço:</span>
                    <span className=" font-bold text-orange-600" itemProp="price">
                      {vehicle.price ? `R$ ${vehicle.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Consulte'}
                    </span>
                    <meta itemProp="priceCurrency" content="BRL" />
                    <meta itemProp="availability" content="https://schema.org/InStock" />
                    <meta itemProp="itemCondition" content="https://schema.org/UsedCondition" />
                    <meta itemProp="validFrom" content={new Date().toISOString()} />
                    <meta itemProp="priceValidUntil" content={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()} />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Ano:</span>
                    <span className="font-semibold text-gray-900" itemProp="itemCondition">
                      {vehicle.year || 'Não Informado'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Quilometragem:</span>
                    <span className="font-semibold text-gray-900">
                      {vehicle.mileage ? `${vehicle.mileage.toLocaleString('pt-BR')} km` : 'Não Informado'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Combustível:</span>
                    <span className="font-semibold text-gray-900">
                      {normalizeFuelTypeDisplay(vehicle.fuel_type || '') || 'Não Informado'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Transmissão:</span>
                    <span className="font-semibold text-gray-900">
                      {normalizeTransmissionDisplay(vehicle.transmission || '') || 'Não Informado'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Cidade:</span>
                    <span className="font-semibold text-gray-900">
                      {vehicle.city || 'Não Informado'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Disponibilidade:</span>
                    <span className="font-semibold text-green-600">
                      Disponível
                    </span>
                    <meta itemProp="availability" content="https://schema.org/InStock" />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Condição:</span>
                    <span className="font-semibold text-gray-900">
                      Usado
                    </span>
                  </div>
                </div>
              </div>

              {/* Microdados adicionais do Offer */}
              <div itemProp="itemOffered" itemScope itemType="https://schema.org/Car" style={{ display: 'none' }}>
                <span itemProp="name">{vehicle.title}</span>
                <div itemProp="brand" itemScope itemType="https://schema.org/Brand">
                  <span itemProp="name">{typeof vehicle.brand === 'string' ? vehicle.brand : vehicle.brand?.name}</span>
                </div>
                <span itemProp="model">{typeof vehicle.model === 'string' ? vehicle.model : vehicle.model?.name}</span>
                <span itemProp="vehicleModelDate">{vehicle.year}</span>
                <span itemProp="fuelType">{vehicle.fuel_type}</span>
                <span itemProp="vehicleTransmission">{vehicle.transmission}</span>
                <span itemProp="mileageFromOdometer">{vehicle.mileage}</span>
              </div>

              <div itemProp="seller" itemScope itemType="https://schema.org/Organization" style={{ display: 'none' }}>
                <span itemProp="name">{tenant?.profile?.company_name || tenant?.name || 'Omega Veículos'}</span>
                <span itemProp="url">{tenant?.profile?.company_website|| 'https://loja.webcarros.app.br/portal'}</span>
                <span itemProp="email">{tenant?.profile?.company_email || 'vendas@omegaveiculos.com.br'}</span>
                <span itemProp="telephone">{tenant?.profile?.company_phone || '+55 11 99999-9999'}</span>
                <span itemProp="image">{tenant?.profile?.logo_url || 'https://loja.webcarros.app.br/logo.png'}</span>
                <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                  <span itemProp="streetAddress">{tenant?.profile?.address || 'Rua das Flores, 123'}</span>
                  <span itemProp="addressLocality">São Paulo</span>
                  <span itemProp="addressRegion">SP</span>
                  <span itemProp="postalCode">01234-567</span>
                  <span itemProp="addressCountry">BR</span>
                </div>
              </div>
            </div>

            {/* Vídeo */}
            {(vehicle.video_link || vehicle.id === 22) && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-orange-500 mr-3"></div>
                    Vídeo
                  </h3>
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={vehicle.video_link || "https://www.youtube.com/embed/cX_BQrTmy1g"}
                      title={`Vídeo do ${vehicle.title}`}
                      className="w-full h-full"

                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {vehicle.id === 22 && !vehicle.video_link && (
                    <p className="text-sm text-gray-600 mt-2">
                      * Vídeo de demonstração - Link fornecido pelo usuário
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="bg-white rounded-lg shadow-sm p-6">
<h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 leading-tight">
                  Tudo sobre o seu {vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} {vehicle.model && typeof vehicle.model === 'object' ? vehicle.model.name : vehicle.model} {vehicle.year}
                </h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">
                  {vehicle.description || 'Este veículo oferece uma experiência de condução excepcional, combinando performance, conforto e tecnologia de ponta. Perfeito para quem busca qualidade e confiabilidade.'}
                </p>
                {showMoreDescription && (
                  <div className="space-y-4">
                    <p>
                      O veículo está em excelente estado de conservação, com manutenção regular e histórico completo.
                      Todos os sistemas estão funcionando perfeitamente e o veículo está pronto para uso imediato.
                    </p>
                    <p>
                      Inclui documentação completa, seguro e garantia. Entre em contato para mais informações
                      sobre este veículo excepcional.
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setShowMoreDescription(!showMoreDescription)}
                  className="text-orange-600 hover:text-orange-700 font-medium mt-2"
                >
                  {showMoreDescription ? 'Mostrar Menos' : 'Mostrar Mais'}
                </button>
              </div>
            </div>
            {/* Serviços Extras */}
            {/* <div className="bg-white rounded-lg shadow-sm p-6 border border-green-200">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Serviços Extras</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: 'fas fa-map-marked-alt', text: 'Sistema de Navegação GPS' },
                  { icon: 'fas fa-wifi', text: 'Hotspot Wi-Fi' },
                  { icon: 'fas fa-child', text: 'Assentos de Segurança' },
                  { icon: 'fas fa-gas-pump', text: 'Opções de Combustível' },
                  { icon: 'fas fa-tools', text: 'Assistência na Estrada' },
                  { icon: 'fas fa-satellite-dish', text: 'Rádio Satélite' },
                  { icon: 'fas fa-plus', text: 'Acessórios Adicionais' },
                  { icon: 'fas fa-clock', text: 'Check-in/out Expresso' }
                ].map((service, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      <i className={`${service.icon} text-green-600 text-lg`}></i>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{service.text}</span>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Descrição */}


            {/* Especificações */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Especificações Técnicas do {vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} {vehicle.model && typeof vehicle.model === 'object' ? vehicle.model.name : vehicle.model} {vehicle.year}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {vehicle.specifications && Object.entries(vehicle.specifications).map(([key, value], index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <i className="fas fa-check text-green-500"></i>
                    <div>
                      <span className="text-sm text-gray-700">{key}</span>
                      <p className="font-medium text-gray-900">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Artigo sobre o Veículo */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">
                Porque comprar o carro {vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} {vehicle.model && typeof vehicle.model === 'object' ? vehicle.model.name : vehicle.model} {vehicle.year}
              </h2>
              <hr className="my-6" />

              {isLoadingArticle ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Gerando artigo personalizado...</p>
                  </div>
                </div>
              ) : vehicleArticle ? (
                <div>
                  {/* Introdução do artigo */}
                  <div className=" border-orange-500">
                    <span className="text-lg sm:text-xl font-bold text-gray-900 mb-6">
                      O {vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} {vehicle.model && typeof vehicle.model === 'object' ? vehicle.model.name : vehicle.model} {vehicle.year}: Uma Escolha Excepcional!
                    </span>
                    <p className="text-lg mt-4 text-gray-700 leading-relaxed mb-4">
                      Descubra por que o <strong>{vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} {vehicle.model && typeof vehicle.model === 'object' ? vehicle.model.name : vehicle.model} {vehicle.year}</strong> é uma das melhores opções do mercado automotivo!
                      Este veículo combina tecnologia de ponta, conforto incomparável e eficiência energética em um pacote irresistível.
                    </p>

                    {/* Botão Leia Mais integrado na introdução */}
                    <div className="text-center">
                      <button
                        onClick={() => setShowFullArticle(!showFullArticle)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                      >
                        {showFullArticle ? '📖 Ler Menos' : '📖 Leia Mais'}
                      </button>
                    </div>
                  </div>

                  {/* Conteúdo completo (condicional) */}
                  {showFullArticle && (
                    <div className="mt-6">
                      <div
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: vehicleArticle }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📝</div>
                  <p className="text-gray-600">Artigo não disponível no momento</p>
                </div>
              )}
            </div>

            {/* Benefícios de Comprar */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Benefícios de Comprar seu {vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} {vehicle.year}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-shield-alt text-green-600 text-sm"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Garantia e Procedência</h3>
                      <p className="text-sm text-gray-600">Veículo com procedência garantida e histórico completo de manutenção.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-tools text-blue-600 text-sm"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Revisão em Dia</h3>
                      <p className="text-sm text-gray-600">Manutenção preventiva realizada regularmente por profissionais qualificados.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-car text-orange-600 text-sm"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Estado de Conservação</h3>
                      <p className="text-sm text-gray-600">Veículo em excelente estado, sem sinistros e bem conservado.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-handshake text-purple-600 text-sm"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Atendimento Personalizado</h3>
                      <p className="text-sm text-gray-600">Suporte completo durante todo o processo de compra e pós-venda.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Preços */}
            {/* <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Opções de Pagamento</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Forma de Pagamento</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Valor</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Entrada</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b">Parcelas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const basePrice = vehicle?.price || 0
                      const formatPrice = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

                      const paymentOptions = [
                        {
                          period: 'À Vista',
                          totalValue: basePrice,
                          downPayment: 0,
                          installments: '1x'
                        },
                        {
                          period: '12x sem juros',
                          totalValue: basePrice,
                          downPayment: 0,
                          installments: '12x'
                        },
                        {
                          period: '24x com juros',
                          totalValue: basePrice * 1.15,
                          downPayment: 0,
                          installments: '24x'
                        },
                        {
                          period: '36x com juros',
                          totalValue: basePrice * 1.25,
                          downPayment: 0,
                          installments: '36x'
                        }
                      ]

                      return paymentOptions.map((option, index) => (
                      <tr key={index} className="border-b">
                          <td className="px-4 py-3 text-sm text-gray-900">{option.period}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{formatPrice(option.totalValue)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(option.downPayment)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{option.installments}</td>
                      </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>
            </div> */}

            {/* Galeria */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Veja mais fotos do {vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} {vehicle.model && typeof vehicle.model === 'object' ? vehicle.model.name : vehicle.model} {vehicle.year} a venda</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.slice(0, 4).map((image, index) => {
                  const imageSrc = (image && typeof image === 'string' && image.trim() !== '') ? image : '/portal/assets/img/cars/slider-01.jpg'
                  return (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                        src={imageSrc}
                      alt={`${vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} ${vehicle.model && typeof vehicle.model === 'object' ? vehicle.model.name : vehicle.model} ${vehicle.year} ${vehicle.transmission} ${vehicle.fuel_type} à Venda - Galeria ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      quality={80}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  </div>
                  )
                })}
              </div>
            </div>



            {/* FAQ */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                Perguntas Frequentes sobre o {vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} {vehicle.year}
              </h2>
              <div className="space-y-4">
                {[
                  {
                    question: `Qual o consumo médio do ${vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} ${vehicle.model && typeof vehicle.model === 'object' ? vehicle.model.name : vehicle.model}?`,
                    answer: `O consumo médio varia conforme o tipo de combustível e condições de uso. Em geral, este modelo apresenta um consumo eficiente na categoria.`
                  },
                  {
                    question: `O ${vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} ${vehicle.year} tem boa revenda?`,
                    answer: `Sim, este modelo tem excelente aceitação no mercado de usados, mantendo um bom valor de revenda devido à sua confiabilidade e qualidade.`
                  },
                  {
                    question: 'Quais documentos são necessários para a compra?',
                    answer: 'Você precisará de RG, CPF, comprovante de renda e comprovante de residência atualizados.'
                  },
                  {
                    question: 'O veículo vem com garantia?',
                    answer: 'Sim, oferecemos garantia de 3 meses ou 3.000 km, o que ocorrer primeiro, além de suporte técnico especializado.'
                  }
                ].map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900">{faq.question}</h3>
                      <i className={`fas fa-chevron-${expandedFaq === index ? 'up' : 'down'} text-gray-600`}></i>
                    </button>
                    {expandedFaq === index && (
                      <div className="px-4 pb-3 text-gray-700">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Políticas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Políticas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Taxas de Cancelamento</h4>
                    <p className="text-sm text-gray-700">As taxas de cancelamento serão aplicadas conforme a política</p>
                  </div>
                  <Link
                    href="#"
                    className="text-orange-600 hover:text-orange-700 font-medium"
                    title="Saiba mais sobre taxas de cancelamento"
                  >
                    Saiba Mais
                  </Link>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Política</h4>
                    <p className="text-sm text-gray-700">Concordo com os termos e condições do Contrato de Compra</p>
                  </div>
                  <Link
                    href="#"
                    className="text-orange-600 hover:text-orange-700 font-medium"
                    title="Ver detalhes da política de compra"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Fixa */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Preços */}
              {/* <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Preços</h3>
                <div className="space-y-3">
                  {(() => {
                    const basePrice = vehicle?.price || 0
                    const formatPrice = (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

                    return [
                      { type: 'cash', label: 'À Vista', price: formatPrice(basePrice), selected: selectedPriceType === 'cash' },
                      { type: 'installments_12', label: '12x sem juros', price: formatPrice(basePrice / 12), selected: selectedPriceType === 'installments_12' },
                      { type: 'installments_24', label: '24x com juros', price: formatPrice((basePrice * 1.15) / 24), selected: selectedPriceType === 'installments_24' },
                      { type: 'installments_36', label: '36x com juros', price: formatPrice((basePrice * 1.25) / 36), selected: selectedPriceType === 'installments_36' }
                  ].map((option) => (
                    <label key={option.type} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="price_type"
                          value={option.type}
                          checked={option.selected}
                          onChange={(e) => setSelectedPriceType(e.target.value)}
                          className="mr-3"
                        />
                        <span className="font-medium">{option.label}</span>
                      </div>
                      <span className="font-bold text-orange-600">{option.price}</span>
                    </label>
                    ))
                  })()}
                </div>
              </div> */}

              {/* Opções de Entrega */}
              {/* <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Opções de Entrega</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="delivery_type"
                      value="delivery"
                      checked={deliveryType === 'delivery'}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-medium">Entrega em Domicílio</span>
                  </label>
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="delivery_type"
                      value="pickup"
                      checked={deliveryType === 'pickup'}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-medium">Retirada na Loja</span>
                  </label>
                </div>

                <form className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Local de Entrega</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Rua, Número, Bairro, Cidade"
                      />
                      <i className="fas fa-map-marker-alt absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input type="checkbox" id="same_location" className="mr-2" />
                    <label htmlFor="same_location" className="text-sm text-gray-700">
                      Entregar no mesmo local
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Local de Entrega</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Rua, Número, Bairro, Cidade"
                      />
                      <i className="fas fa-map-marker-alt absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Visita</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <input
                        type="time"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Entrega</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <input
                        type="time"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                      Comprar
                    </button>
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors">
                      Entrar em Contato
                    </button>
                  </div>
                </form>
              </div> */}

              {/* Detalhes do Proprietário */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Detalhes do Proprietário</h3> */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-gray-600"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Omega Veículos</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">⭐</span>
                      ))}
                      <span className="ml-1 text-sm text-gray-600">(5.0)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900">{tenant?.profile?.company_email || 'vendas@omegaveiculos.com.br'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Telefone:</span>
                    <span className="text-gray-900">{tenant?.profile?.company_phone || '+55 11 99999-9999'}</span>
                  </div>

                </div>

                <div className="mt-4 space-y-2">
                  <a
                    href={generateWhatsAppLink('Olá! Tenho interesse em comprar este veículo. Podem me enviar mais informações sobre preço e condições?')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center"
                  >
                    <i className="fas fa-check mr-2"></i>Quero comprar
                  </a>
                  <a
                    href={generateWhatsAppLink('Olá! Gostaria de receber uma cotação para este veículo. Podem me enviar mais detalhes?')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center"
                  >
                    <i className="fab fa-whatsapp mr-2"></i>
                    Cotações via WhatsApp
                  </a>
                </div>
              </div>

              {/* Localização do Veículo */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Comprar Carro {vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} {vehicle.model && typeof vehicle.model === 'object' ? vehicle.model.name : vehicle.model} {vehicle.fuel_type} perto de mim </h3>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3659.270463083784!2d-47.465780599999995!3d-23.4867658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94cf61d7efdc06b5%3A0xffb940e44745828!2s%C3%94mega%20Ve%C3%ADculos%20%7C%20Comendador%20Sorocaba!5e0!3m2!1spt-BR!2sbr!4v1759005238643!5m2!1spt-BR!2sbr" loading="lazy"
                    title="Mapa do carro {vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} {vehicle.model && typeof vehicle.model === 'object' ? vehicle.model.name : vehicle.model}"
                    aria-label="Mapa do carro {vehicle.brand && typeof vehicle.brand === 'object' ? vehicle.brand.name : vehicle.brand} {vehicle.model && typeof vehicle.model === 'object' ? vehicle.model.name : vehicle.model}
                    "
                    ></iframe>
                  </div>
                </div>

              </div>

              {/* Compartilhar */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Compartilhar</h3>
                <div className="flex space-x-4">
                  {[
                    {
                      icon: 'fab fa-facebook-f fa-2x',
                      color: 'bg-blue-600 hover:bg-blue-700',
                      label: 'Compartilhar no Facebook',
                      title: 'Compartilhar no Facebook',
                      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
                    },
                    {
                      icon: 'fab fa-instagram fa-2x',
                      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
                      label: 'Compartilhar no Instagram',
                      title: 'Compartilhar no Instagram',
                      url: `https://www.instagram.com/omegaveiculos`
                    },
                    {
                      icon: 'fab fa-whatsapp fa-2x',
                      color: 'bg-green-500 hover:bg-green-600',
                      label: 'Compartilhar no WhatsApp',
                      title: 'Compartilhar no WhatsApp',
                      url: `https://wa.me/?text=${encodeURIComponent(`Confira este veículo: ${vehicle?.title || 'Veículo'} - ${window.location.href}`)}`
                    },
                    {
                      icon: 'fab fa-twitter fa-2x',
                      color: 'bg-blue-400 hover:bg-blue-500',
                      label: 'Compartilhar no Twitter',
                      title: 'Compartilhar no Twitter',
                      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Confira este veículo: ${vehicle?.title || 'Veículo'}`)}&url=${encodeURIComponent(window.location.href)}`
                    }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-16 h-16 ${social.color} text-white rounded-full flex items-center justify-center hover:opacity-80 transition-all duration-200 hover:scale-105`}
                      aria-label={social.label}
                      title={social.label}
                    >
                      <i className={social.icon}></i>
                    </a>
                  ))}
                </div>

                {/* Redes sociais da empresa */}
                {tenant?.profile && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {/* <h4 className="text-sm font-semibold text-gray-700 mb-3">Siga a {tenant.profile.company_name}</h4> */}
                    {/* <div className="flex space-x-3">
                      {[
                        {
                          icon: 'fab fa-facebook-f',
                          color: 'bg-blue-600 hover:bg-blue-700',
                          label: `Facebook da ${tenant.profile.company_name}`,
                          url: 'https://www.facebook.com/omegaveiculos'
                        },
                        {
                          icon: 'fab fa-instagram',
                          color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
                          label: `Instagram da ${tenant.profile.company_name}`,
                          url: 'https://www.instagram.com/omegaveiculos'
                        },
                        {
                          icon: 'fab fa-whatsapp',
                          color: 'bg-green-500 hover:bg-green-600',
                          label: `WhatsApp da ${tenant.profile.company_name}`,
                          url: generateWhatsAppLink('Olá! Gostaria de mais informações sobre os veículos disponíveis.')
                        }
                      ].map((social, index) => (
                        <a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-12 h-12 ${social.color} text-white rounded-full flex items-center justify-center hover:opacity-80 transition-all duration-200 hover:scale-105`}
                          aria-label={social.label}
                          title={social.label}
                        >
                          <i className={social.icon}></i>
                        </a>
                      ))}
                    </div> */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Veículos Relacionados - Carrossel */}
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">

              <p className="text-gray-600">Descubra outros veículos da marca {typeof vehicle?.brand === 'object' ? vehicle.brand?.name : 'Lexus'} que podem interessar você</p>
            </div>

            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentRelatedIndex * 33.333}%)` }}
                >
                  {isLoadingRelated ? (
                    <div className="w-full flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                  ) : relatedVehicles.length > 0 ? (
                    relatedVehicles.map((relatedVehicle) => {
                      // Converter para o formato esperado pelo VehicleCard
                      const convertedVehicle = {
                        ...relatedVehicle,
                        main_image: typeof relatedVehicle.main_image === 'object'
                          ? relatedVehicle.main_image?.url || null
                          : relatedVehicle.main_image
                      }

                      return (
                    <div key={relatedVehicle.id} className="w-1/3 flex-shrink-0 px-3">
                          <VehicleCard
                            vehicle={convertedVehicle}
                            className="h-full"
                          />
                          </div>
                      )
                    })
                  ) : (
                    <div className="w-full text-center py-12">
                      <p className="text-gray-600">Nenhum veículo da mesma marca encontrado.</p>
                          </div>
                  )}
                </div>
              </div>

              {/* Botões de navegação */}
              <button
                onClick={prevRelatedVehicle}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                aria-label="Ver veículos anteriores"
                title="Ver veículos anteriores"
              >
                <i className="fas fa-chevron-left text-gray-600"></i>
              </button>
              <button
                onClick={nextRelatedVehicle}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                aria-label="Ver próximos veículos"
                title="Ver próximos veículos"
              >
                <i className="fas fa-chevron-right text-gray-600"></i>
              </button>
            </div>

            {/* Indicadores */}
            {relatedVehicles.length > 3 && (
            <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: Math.ceil(relatedVehicles.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentRelatedIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentRelatedIndex ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                  aria-label={`Ir para página ${index + 1} de veículos relacionados`}
                  title={`Ir para página ${index + 1} de veículos relacionados`}
                />
              ))}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra Fixa Mobile - Apenas para Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
        <div className="px-4 py-3">
          <div className="flex space-x-3">
            <a
              href={generateWhatsAppLink('Olá! Tenho interesse em comprar este veículo. Podem me enviar mais informações sobre preço e condições?')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center text-sm"
            >
              <i className="fas fa-shopping-cart mr-2"></i>
              Comprar Carro
            </a>
            <a
              href={generateWhatsAppLink('Olá! Gostaria de receber uma cotação para este veículo. Podem me enviar mais detalhes?')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg flex items-center justify-center text-sm"
            >
              <i className="fab fa-whatsapp mr-2"></i>
              Fazer Cotação
            </a>
          </div>
        </div>
      </div>

      {/* Espaçamento para evitar sobreposição com a barra fixa */}
      <div className="h-20 md:hidden"></div>

</div>
  )
}

export default function VehicleDetailsPage() {
  return (
    <PortalLayout>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando detalhes do veículo...</p>
          </div>
        </div>
      }>
        <VehicleDetailsContent />
      </Suspense>
    </PortalLayout>
  )
}
