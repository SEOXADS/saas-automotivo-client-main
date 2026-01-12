'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { showSuccess, showError, showLoading } from '@/lib/swal'
import Button from '@/components/ui/Button'
import { Download, ExternalLink, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import * as cheerio from 'cheerio'

interface ImportSource {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  baseUrl: string
  exampleUrl: string
}

interface ImportHistory {
  id: string
  source: string
  url: string
  status: 'pending' | 'success' | 'failed'
  vehicle_id?: number
  created_at: string
  error_message?: string
}

export default function ImportVehiclesPage() {
  const router = useRouter()
  const { isAuthenticated, token } = useAuth()
  const [importUrl, setImportUrl] = useState('')
  const [selectedSource, setSelectedSource] = useState<string>('webmotors')
  const [isImporting, setIsImporting] = useState(false)
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Fontes de importação disponíveis
  const importSources: ImportSource[] = [
    {
      id: 'webmotors',
      name: 'Webmotors',
      description: 'Importar anúncios do Webmotors',
      icon: <ExternalLink className="w-5 h-5" />,
      baseUrl: 'https://www.webmotors.com.br',
      exampleUrl: 'https://www.webmotors.com.br/comprar/fiat/argo/10-firefly-flex-drive-manual/4/2024/59209372'
    },
    {
      id: 'olx',
      name: 'OLX',
      description: 'Importar anúncios da OLX',
      icon: <ExternalLink className="w-5 h-5" />,
      baseUrl: 'https://www.olx.com.br',
      exampleUrl: 'https://www.olx.com.br/veiculos/...'
    },
    {
      id: 'icarros',
      name: 'iCarros',
      description: 'Importar anúncios do iCarros',
      icon: <ExternalLink className="w-5 h-5" />,
      baseUrl: 'https://www.icarros.com.br',
      exampleUrl: 'https://www.icarros.com.br/carros/...'
    },
    {
      id: 'omegaveiculos',
      name: 'OmeGa Veículos',
      description: 'Importar anúncios do OmeGa Veículos',
      icon: <ExternalLink className="w-5 h-5" />,
      baseUrl: 'https://www.omegaveiculos.com.br',
      exampleUrl: 'https://www.omegaveiculos.com.br/...'
    }
  ]

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadImportHistory()
  }, [isAuthenticated, router])

  // Função para fazer webscraping direto
  const scrapeVehicleData = async (url: string, source: string) => {
    // Verificar se está no cliente
    if (typeof window === 'undefined') {
      throw new Error('Webscraping só pode ser executado no cliente')
    }

    try {
      console.log('🕷️ Iniciando webscraping direto da URL:', url)

      // Fazer requisição para a página
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ao acessar página: ${response.status} ${response.statusText}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      console.log('✅ HTML carregado com sucesso, iniciando extração...')

      // Função auxiliar para encontrar valores por label
      const findByLabel = (label: string): string | undefined => {
        let val: string | undefined = undefined
        $('li, td, th, span, div').each((_, el) => {
          const text = $(el).text()
          if (text.includes(label)) {
            val = text.split(':')[1]?.trim() || undefined
            if (!val) {
              // Tentar encontrar o próximo elemento
              const nextEl = $(el).next()
              if (nextEl.length) {
                val = nextEl.text().trim()
              }
            }
          }
        })
        return val
      }

      // Extrair dados baseado na fonte
      let scrapedData: {
        titulo?: string
        preco?: string
        marca?: string
        modelo?: string
        versao?: string
        ano_modelo?: string
        quilometragem?: string
        placa?: string
        cor?: string
        cambio?: string
        combustivel?: string
        equipamentos?: string[]
        condicoes?: string[]
        loja?: string
        endereco?: string
        telefone?: string
        imagens?: string[]
      } = {}

      if (source === 'omegaveiculos') {
        scrapedData = {
          titulo: $('h1').first().text().trim(),
          preco: $('h3').first().text().trim(),
          marca: findByLabel('Marca') || findByLabel('Fabricante'),
          modelo: findByLabel('Modelo'),
          versao: findByLabel('Versão') || findByLabel('Versao'),
          ano_modelo: findByLabel('Ano/Modelo') || findByLabel('Ano Modelo'),
          quilometragem: findByLabel('Quilometragem') || findByLabel('KM'),
          placa: findByLabel('Final da placa') || findByLabel('Placa'),
          cor: findByLabel('Cor'),
          cambio: findByLabel('Câmbio') || findByLabel('Cambio'),
          combustivel: findByLabel('Combustível') || findByLabel('Combustivel'),
          equipamentos: $('.items--list li, .features li, .equipamentos li')
            .map((_, el) => $(el).text().trim())
            .get()
            .filter((text: string) => text.length > 0),
          condicoes: $('.labels__container span, .badges span, .tags span')
            .map((_, el) => $(el).text().trim())
            .get()
            .filter((text: string) => text.length > 0),
          loja: $('.single__store-title, .store-name, .dealer-name').text().trim(),
          endereco: $('.single__store-address, .store-address, .dealer-address').text().trim(),
          telefone: $('.single__store-phone, .store-phone, .dealer-phone').text().trim(),
          imagens: $('.swiper-wrapper img, .gallery img, .images img')
            .map((_, el) => $(el).attr('src'))
            .get()
            .filter((src: string) => src && src.startsWith('http'))
        }
      } else if (source === 'webmotors') {
        scrapedData = {
          titulo: $('h1').first().text().trim(),
          preco: $('[data-testid="price"], .price, .value').first().text().trim(),
          marca: findByLabel('Marca') || findByLabel('Fabricante'),
          modelo: findByLabel('Modelo'),
          versao: findByLabel('Versão') || findByLabel('Versao'),
          ano_modelo: findByLabel('Ano/Modelo') || findByLabel('Ano Modelo'),
          quilometragem: findByLabel('Quilometragem') || findByLabel('KM'),
          placa: findByLabel('Final da placa') || findByLabel('Placa'),
          cor: findByLabel('Cor'),
          cambio: findByLabel('Câmbio') || findByLabel('Cambio'),
          combustivel: findByLabel('Combustível') || findByLabel('Combustivel'),
          equipamentos: $('.features li, .equipments li, .items li')
            .map((_, el) => $(el).text().trim())
            .get()
            .filter((text: string) => text.length > 0),
          condicoes: $('.badges span, .tags span, .labels span')
            .map((_, el) => $(el).text().trim())
            .get()
            .filter((text: string) => text.length > 0),
          loja: $('.dealer-name, .store-name, .seller-name').text().trim(),
          endereco: $('.dealer-address, .store-address, .seller-address').text().trim(),
          telefone: $('.dealer-phone, .store-phone, .seller-phone').text().trim(),
          imagens: $('.gallery img, .images img, .photos img')
            .map((_, el) => $(el).attr('src'))
            .get()
            .filter((src: string) => src && src.startsWith('http'))
        }
      } else if (source === 'olx') {
        scrapedData = {
          titulo: $('h1').first().text().trim(),
          preco: $('.price, .value, [data-testid="price"]').first().text().trim(),
          marca: findByLabel('Marca') || findByLabel('Fabricante'),
          modelo: findByLabel('Modelo'),
          versao: findByLabel('Versão') || findByLabel('Versao'),
          ano_modelo: findByLabel('Ano/Modelo') || findByLabel('Ano Modelo'),
          quilometragem: findByLabel('Quilometragem') || findByLabel('KM'),
          placa: findByLabel('Final da placa') || findByLabel('Placa'),
          cor: findByLabel('Cor'),
          cambio: findByLabel('Câmbio') || findByLabel('Cambio'),
          combustivel: findByLabel('Combustível') || findByLabel('Combustivel'),
          equipamentos: $('.features li, .equipments li, .items li')
            .map((_, el) => $(el).text().trim())
            .get()
            .filter((text: string) => text.length > 0),
          condicoes: $('.badges span, .tags span, .labels span')
            .map((_, el) => $(el).text().trim())
            .get()
            .filter((text: string) => text.length > 0),
          loja: $('.seller-name, .store-name, .dealer-name').text().trim(),
          endereco: $('.seller-address, .store-address, .dealer-address').text().trim(),
          telefone: $('.seller-phone, .store-phone, .dealer-phone').text().trim(),
          imagens: $('.gallery img, .images img, .photos img')
            .map((_, el) => $(el).attr('src'))
            .get()
            .filter((src: string) => src && src.startsWith('http'))
        }
      } else if (source === 'icarros') {
        scrapedData = {
          titulo: $('h1').first().text().trim(),
          preco: $('.price, .value, [data-testid="price"]').first().text().trim(),
          marca: findByLabel('Marca') || findByLabel('Fabricante'),
          modelo: findByLabel('Modelo'),
          versao: findByLabel('Versão') || findByLabel('Versao'),
          ano_modelo: findByLabel('Ano/Modelo') || findByLabel('Ano Modelo'),
          quilometragem: findByLabel('Quilometragem') || findByLabel('KM'),
          placa: findByLabel('Final da placa') || findByLabel('Placa'),
          cor: findByLabel('Cor'),
          cambio: findByLabel('Câmbio') || findByLabel('Cambio'),
          combustivel: findByLabel('Combustível') || findByLabel('Combustivel'),
          equipamentos: $('.features li, .equipments li, .items li')
            .map((_, el) => $(el).text().trim())
            .get()
            .filter((text: string) => text.length > 0),
          condicoes: $('.badges span, .tags span, .labels span')
            .map((_, el) => $(el).text().trim())
            .get()
            .filter((text: string) => text.length > 0),
          loja: $('.dealer-name, .store-name, .seller-name').text().trim(),
          endereco: $('.dealer-address, .store-address, .seller-address').text().trim(),
          telefone: $('.dealer-phone, .store-phone, .seller-phone').text().trim(),
          imagens: $('.gallery img, .images img, .photos img')
            .map((_, el) => $(el).attr('src'))
            .get()
            .filter((src: string) => src && src.startsWith('http'))
        }
      }

      // Limpar e processar dados
      const processedData = {
        title: scrapedData.titulo || 'Veículo Importado',
        description: `${scrapedData.titulo || 'Veículo'} - ${scrapedData.marca || ''} ${scrapedData.modelo || ''} ${scrapedData.versao || ''}`,
        price: scrapedData.preco ? parsePrice(scrapedData.preco) : 0,
        brand: scrapedData.marca || 'Não identificada',
        model: scrapedData.modelo || 'Não identificado',
        version: scrapedData.versao || '',
        year: scrapedData.ano_modelo ? extractYear(scrapedData.ano_modelo) : new Date().getFullYear(),
        mileage: scrapedData.quilometragem ? parseMileage(scrapedData.quilometragem) : 0,
        fuel_type: scrapedData.combustivel ? normalizeFuelType(scrapedData.combustivel) : 'flex',
        transmission: scrapedData.cambio ? normalizeTransmission(scrapedData.cambio) : 'manual',
        color: scrapedData.cor || 'Não informado',
        plate: scrapedData.placa || '',
        equipments: scrapedData.equipamentos || [],
        conditions: scrapedData.condicoes || [],
        store: scrapedData.loja || '',
        address: scrapedData.endereco || '',
        phone: scrapedData.telefone || '',
        images: scrapedData.imagens || []
      }

      console.log('✅ Dados extraídos via webscraping:', processedData)
      return processedData

    } catch (error) {
      console.error('❌ Erro no webscraping:', error)
      throw new Error(`Falha no webscraping: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // Função para extrair preço
  const parsePrice = (priceText: string): number => {
    const price = priceText.replace(/[^\d,]/g, '').replace(',', '.')
    const numericPrice = parseFloat(price)
    return isNaN(numericPrice) ? 0 : numericPrice * 1000 // Converter para centavos
  }

  // Função para extrair ano
  const extractYear = (yearText: string): number => {
    const year = yearText.match(/\d{4}/)
    return year ? parseInt(year[0]) : new Date().getFullYear()
  }

  // Função para extrair quilometragem
  const parseMileage = (mileageText: string): number => {
    const mileage = mileageText.replace(/[^\d]/g, '')
    return mileage ? parseInt(mileage) : 0
  }

  // Função para normalizar tipo de combustível
  const normalizeFuelType = (fuelText: string): string => {
    const fuel = fuelText.toLowerCase()
    if (fuel.includes('flex') || fuel.includes('gasolina') || fuel.includes('etanol')) return 'flex'
    if (fuel.includes('diesel')) return 'diesel'
    if (fuel.includes('elétrico') || fuel.includes('eletrico')) return 'electric'
    if (fuel.includes('híbrido') || fuel.includes('hibrido')) return 'hybrid'
    return 'flex'
  }

  // Função para normalizar transmissão
  const normalizeTransmission = (transmissionText: string): string => {
    const transmission = transmissionText.toLowerCase()
    if (transmission.includes('manual')) return 'manual'
    if (transmission.includes('automático') || transmission.includes('automatico')) return 'automatic'
    if (transmission.includes('cvt')) return 'cvt'
    return 'manual'
  }

  // Carregar histórico de importações
  const loadImportHistory = async () => {
    try {
      setIsLoadingHistory(true)
      // TODO: Implementar endpoint para buscar histórico
      // Por enquanto, usar dados mock
      setImportHistory([
        {
          id: '1',
          source: 'webmotors',
          url: 'https://www.webmotors.com.br/carros/honda-civic-2022',
          status: 'success',
          vehicle_id: 123,
          created_at: '2025-01-14T10:00:00Z'
        },
        {
          id: '2',
          source: 'olx',
          url: 'https://www.olx.com.br/veiculos/toyota-corolla-2023',
          status: 'pending',
          created_at: '2025-01-14T09:30:00Z'
        }
      ])
    } catch {
      console.error('Erro ao carregar histórico')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Importar veículo com retry automático
  const handleImport = async () => {
    if (!importUrl.trim()) {
      showError('Por favor, insira uma URL válida')
      return
    }

    // Validação básica de URL
    try {
      new URL(importUrl)
    } catch {
      showError('URL inválida. Por favor, insira uma URL completa começando com http:// ou https://')
      return
    }

    // Verificar se a URL corresponde à fonte selecionada
    const sourceConfig = importSources.find(s => s.id === selectedSource)
    if (sourceConfig && !importUrl.includes(sourceConfig.baseUrl.replace('https://', '').replace('http://', ''))) {
      showError(`A URL deve ser de ${sourceConfig.name}. URL atual: ${importUrl}`)
      return
    }

    // Verificar autenticação JWT
    if (!token) {
      showError('Token de autenticação não encontrado. Faça login novamente.')
      return
    }

    console.log('🔐 Verificação de autenticação:')
    console.log('  - isAuthenticated:', isAuthenticated)
    console.log('  - Token existe:', !!token)
    console.log('  - Token preview:', token ? `${token.substring(0, 30)}...` : 'NENHUM')
    console.log('  - URL validada:', importUrl)
    console.log('  - Fonte selecionada:', selectedSource)

    try {
      setIsImporting(true)
      showLoading('Importando veículo...')

            // PASSO 1: Extrair dados da URL via webscraping direto
      console.log('🔄 PASSO 1: Extraindo dados via webscraping direto...')

      let extractedData: {
        title?: string
        description?: string
        price?: string | number
        brand?: string
        model?: string
        version?: string
        year?: number
        mileage?: number
        fuel_type?: string
        transmission?: string
        color?: string
        plate?: string
        equipments?: string[]
        conditions?: string[]
        store?: string
        address?: string
        phone?: string
        images?: string[]
        vehicle?: Record<string, unknown> // Veículo retornado pelo backend
        data?: Record<string, unknown> // Dados estruturados do backend
      } | undefined

      // ESTRATÉGIA HÍBRIDA: Webscraping + Backend
      console.log('🔄 ESTRATÉGIA HÍBRIDA: Webscraping + Backend')

            // ESTRATÉGIA INTELIGENTE: Webscraping + Backend POST
      console.log('🚀 ESTRATÉGIA INTELIGENTE: Webscraping + Backend POST')
      const startTime = Date.now()

      try {
        // PASSO 1A: Webscraping rápido para dados básicos
        console.log('🕷️ PASSO 1A: Webscraping rápido para dados básicos...')
        const scrapedData = await scrapeVehicleData(importUrl, selectedSource)
        console.log('✅ Webscraping direto bem-sucedido:', scrapedData)

        // PASSO 1B: Backend POST com dados já extraídos
        console.log('🔄 PASSO 1B: Backend POST com dados otimizados...')
        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/vehicles/import/${selectedSource}`

        // Preparar payload completo para o backend
        const backendPayload = {
          url: importUrl,
          source: selectedSource,
          tenant_id: 1,
          // Dados completos extraídos via webscraping
          scraped_data: {
            title: scrapedData.title,
            description: scrapedData.description,
            price: scrapedData.price,
            brand: scrapedData.brand,
            model: scrapedData.model,
            version: scrapedData.version,
            year: scrapedData.year,
            mileage: scrapedData.mileage,
            fuel_type: scrapedData.fuel_type,
            transmission: scrapedData.transmission,
            color: scrapedData.color,
            plate: scrapedData.plate,
            equipments: scrapedData.equipments || [],
            conditions: scrapedData.conditions || [],
            store: scrapedData.store,
            address: scrapedData.address,
            phone: scrapedData.phone,
            images: scrapedData.images || []
          },
          // Metadados para otimização
          pre_processed: true,
          image_count: scrapedData.images?.length || 0,
          source_url: importUrl,
          import_timestamp: new Date().toISOString()
        }

        // Log detalhado de todos os dados sendo enviados
        console.log('📤 PAYLOAD COMPLETO enviando para o backend:')
        console.log('🔗 URL:', backendUrl)
        console.log('📊 Dados extraídos:', scrapedData)
        console.log('📦 Payload completo:', backendPayload)
        console.log('📸 Total de imagens:', scrapedData.images?.length || 0)

        const backendResponse = await fetch(backendUrl, {
          method: 'POST', // ✅ Usar POST para dados complexos
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(backendPayload)
        })

        if (!backendResponse.ok) {
          const errorText = await backendResponse.text()
          throw new Error(`Backend POST retornou erro: ${backendResponse.status} - ${errorText}`)
        }

                const backendResult = await backendResponse.json()
        const endTime = Date.now()
        const totalTime = endTime - startTime

        console.log('✅ Backend POST processou com sucesso:', backendResult)
        console.log('⚡ Performance: Processamento completo em', totalTime, 'ms')

        extractedData = backendResult.data || backendResult

      } catch (error) {
        console.warn('⚠️ Estratégia POST falhou, tentando GET como fallback:', error)

        // FALLBACK: Backend GET (método tradicional)
        console.log('🔄 FALLBACK: Backend GET (método tradicional)...')
        const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/vehicles/import/${selectedSource}?url=${encodeURIComponent(importUrl)}&tenant_id=1`

        const backendResponse = await fetch(backendUrl, {
          method: 'GET', // Fallback para GET
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (!backendResponse.ok) {
          const errorText = await backendResponse.text()
          throw new Error(`Backend GET falhou: ${backendResponse.status} - ${errorText}`)
        }

        const backendResult = await backendResponse.json()
        console.log('✅ Backend GET processou com sucesso (fallback):', backendResult)

        extractedData = backendResult.data || backendResult
      }

      // Verificar se temos dados extraídos
      if (!extractedData) {
        throw new Error('Nenhum dado foi extraído da URL')
      }

      // PASSO 2: Backend já criou o veículo e processou as imagens!
      console.log('✅ PASSO 2: Backend já processou tudo!')

      // O backend retornou o veículo criado com todas as imagens processadas
      const createdVehicle = extractedData.vehicle || extractedData
      console.log('🚗 Veículo criado pelo backend:', createdVehicle)

      // ✅ PASSO 3: Backend já processou todas as imagens automaticamente!
      console.log('✅ PASSO 3: Backend já processou todas as imagens!')
      console.log('📸 Imagens processadas:', extractedData.images?.length || 0, 'imagens')

      // Sucesso!
      showSuccess('Veículo importado e criado com sucesso!')

      // Adicionar ao histórico
      const newImport: ImportHistory = {
        id: Date.now().toString(),
        source: selectedSource,
        url: importUrl,
        status: 'success',
        vehicle_id: 0, // Será atualizado quando o veículo for criado
        created_at: new Date().toISOString()
      }

      setImportHistory(prev => [newImport, ...prev])
      setImportUrl('')

      // Redirecionar para edição do veículo criado
      const vehicleId = 0 // Será atualizado quando o veículo for criado
      if (vehicleId) {
        router.push(`/vehicles/${vehicleId}/edit`)
      }

    } catch (error) {
      console.error('❌ Erro na importação:', error)

      let errorMessage = 'Erro ao importar veículo'
      if (error instanceof Error) {
        errorMessage = error.message
      }

      showError(errorMessage)

      // Adicionar ao histórico como falha
      const failedImport: ImportHistory = {
        id: Date.now().toString(),
        source: selectedSource,
        url: importUrl,
        status: 'failed',
        created_at: new Date().toISOString(),
        error_message: errorMessage
      }

      setImportHistory(prev => [failedImport, ...prev])
    } finally {
      setIsImporting(false)
    }
  }

  // Obter ícone de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }



  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Verificar autenticação
  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return (
    <AdminLayout title="Importar Veículos">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Cabeçalho Moderno */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Importar Veículos
                </h1>
                <p className="text-gray-600 mt-3 text-lg">
                  Importe veículos automaticamente de anúncios do Webmotors, OLX, iCarros e OmeGa Veículos
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Download className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

        {/* Formulário de Importação - Moderno */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
              <span className="text-2xl">🔗</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nova Importação</h2>
              <p className="text-gray-600">Configure a fonte e URL para importar o veículo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Seleção da Fonte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Fonte do Anúncio
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {importSources.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSource(source.id)}
                    className={`p-6 border-2 rounded-xl text-left transition-all duration-300 hover:shadow-md ${
                      selectedSource === source.id
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedSource === source.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {source.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{source.name}</div>
                        <div className="text-sm text-gray-500">{source.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* URL do Anúncio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                URL do Anúncio
              </label>
              <div className="space-y-4">
                <input
                  type="url"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder={importSources.find(s => s.id === selectedSource)?.exampleUrl}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                />
                <p className="text-sm text-gray-500">
                  Cole aqui a URL completa do anúncio que deseja importar
                </p>

                {/* Exemplo de URL */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600">💡</span>
                    <span className="font-medium text-blue-800">Exemplo de URL:</span>
                  </div>
                  <p className="text-sm text-blue-700 font-mono break-all">
                    {importSources.find(s => s.id === selectedSource)?.exampleUrl}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Importação */}
          <div className="mt-8">
            <Button
              onClick={handleImport}
              disabled={!importUrl.trim() || isImporting}
              loading={isImporting}
              variant="primary"
              size="lg"
              icon={<Download className="w-6 h-6" />}
              fullWidth
              className="py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isImporting ? 'Importando...' : '🚗 Importar Veículo'}
            </Button>
          </div>
        </div>

        {/* Histórico de Importações - Moderno */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Histórico de Importações</h2>
              <p className="text-gray-600">Acompanhe todas as suas importações realizadas</p>
            </div>
          </div>

          {isLoadingHistory ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <p className="text-lg text-gray-600">Carregando histórico...</p>
            </div>
          ) : importHistory.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma importação ainda</h3>
              <p className="text-gray-500">Realize sua primeira importação para começar</p>
            </div>
          ) : (
            <div className="space-y-6">
              {importHistory.map((importItem) => (
                <div
                  key={importItem.id}
                  className="group p-6 border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                        importItem.status === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                        importItem.status === 'failed' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' :
                        'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                      }`}>
                        {getStatusIcon(importItem.status)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-gray-900 capitalize">{importItem.source}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            importItem.status === 'success' ? 'bg-green-100 text-green-700' :
                            importItem.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {importItem.status === 'success' ? 'Sucesso' :
                             importItem.status === 'failed' ? 'Falhou' :
                             'Pendente'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 truncate max-w-lg">{importItem.url}</div>
                        <div className="text-xs text-gray-400">{formatDate(importItem.created_at)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {importItem.status === 'success' && importItem.vehicle_id && (
                        <Button
                          onClick={() => router.push(`/vehicles/${importItem.vehicle_id}/edit`)}
                          variant="primary"
                          size="sm"
                          className="shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          👁️ Ver Veículo
                        </Button>
                      )}
                      {importItem.status === 'failed' && (
                        <Button
                          onClick={() => {
                            setImportUrl(importItem.url)
                            setSelectedSource(importItem.source)
                          }}
                          variant="outline"
                          size="sm"
                          className="shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          🔄 Tentar Novamente
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </AdminLayout>
  )
}
