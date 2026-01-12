/**
 * Utilitários para geração e manipulação de slugs de veículos
 */

export interface VehicleSlugData {
  id: number
  brand: string
  model: string
  year?: number
  fuel_type?: string
  transmission?: string
  color?: string
  title?: string
}

/**
 * Gera um slug amigável para um veículo (com ID)
 * Formato: marca-modelo-cambio-combustivel-cor-ano-id
 * Exemplo: toyota-corolla-automatico-gasolina-prata-2020-123
 */
export function generateVehicleSlug(vehicle: VehicleSlugData): string {
  const parts: string[] = []

  // Marca (obrigatório)
  if (vehicle.brand) {
    parts.push(slugify(vehicle.brand))
  }

  // Modelo (obrigatório)
  if (vehicle.model) {
    parts.push(slugify(vehicle.model))
  }

  // Câmbio
  if (vehicle.transmission) {
    const transmissionSlug = normalizeTransmission(vehicle.transmission)
    if (transmissionSlug) {
      parts.push(transmissionSlug)
    }
  }

  // Combustível
  if (vehicle.fuel_type) {
    const fuelSlug = normalizeFuelType(vehicle.fuel_type)
    if (fuelSlug) {
      parts.push(fuelSlug)
    }
  }

  // Cor
  if (vehicle.color) {
    parts.push(slugify(vehicle.color))
  }

  // Ano
  if (vehicle.year) {
    parts.push(vehicle.year.toString())
  }

  // Se não temos informações suficientes, usar o título
  if (parts.length < 2 && vehicle.title) {
    const titleSlug = slugify(vehicle.title)
    if (titleSlug) {
      parts.push(titleSlug)
    }
  }

  // Adicionar ID no final para garantir unicidade
  if (vehicle.id) {
    parts.push(vehicle.id.toString())
  }

  return parts.join('-')
}

/**
 * Converte uma string em slug amigável
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Remove acentos
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Substitui espaços e caracteres especiais por hífens
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    // Remove hífens múltiplos
    .replace(/\-\-+/g, '-')
    // Remove hífens do início e fim
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Normaliza tipos de transmissão para slugs consistentes
 */
export function normalizeTransmission(transmission: string): string {
  const normalized = transmission.toLowerCase().trim()

  const mappings: { [key: string]: string } = {
    'automático': 'automatico',
    'automatica': 'automatico',
    'automatic': 'automatico',
    'manual': 'manual',
    'cvt': 'cvt',
    'semi-automático': 'semi-automatico',
    'semi-automatic': 'semi-automatico',
    'automática': 'automatico',
    // 'manual': 'manual',
    'manuais': 'manual'
  }

  return mappings[normalized] || slugify(transmission)
}

/**
 * Normaliza tipos de combustível para slugs consistentes
 */
export function normalizeFuelType(fuelType: string): string {
  const normalized = fuelType.toLowerCase().trim()

  const mappings: { [key: string]: string } = {
    'gasolina': 'gasolina',
    'gasoline': 'gasolina',
    'diesel': 'diesel',
    'etanol': 'etanol',
    'ethanol': 'etanol',
    'flex': 'flex',
    'flex fuel': 'flex',
    'híbrido': 'hibrido',
    'hybrid': 'hibrido',
    'elétrico': 'eletrico',
    'electric': 'eletrico',
    'gnv': 'gnv',
    'gás natural': 'gnv',
    'natural gas': 'gnv'
  }

  return mappings[normalized] || slugify(fuelType)
}

/**
 * Normaliza transmissão para exibição (formato masculino)
 */
export function normalizeTransmissionDisplay(transmission: string): string {
  if (!transmission) return ''

  const normalized = transmission.toLowerCase().trim()

  // Mapeamento para formato masculino
  const transmissionMap: Record<string, string> = {
    'automatico': 'Automático',
    'automatica': 'Automático',
    'automatic': 'Automático',
    'manual': 'Manual',
    'manuais': 'Manual',
    'cvt': 'CVT',
    'semi-automatico': 'Semi-automático',
    'semi-automatica': 'Semi-automático',
    'semi-automatic': 'Semi-automático'
  }

  return transmissionMap[normalized] || transmission
}

/**
 * Normaliza tipo de combustível para exibição (formato masculino, exceto gasolina)
 */
export function normalizeFuelTypeDisplay(fuelType: string): string {
  if (!fuelType) return ''

  const normalized = fuelType.toLowerCase().trim()

  // Mapeamento para formato masculino
  const fuelMap: Record<string, string> = {
    'gasolina': 'Gasolina', // Feminino - manter
    'flex': 'Flex',
    'alcool': 'Álcool',
    'alcohol': 'Álcool',
    'etanol': 'Etanol',
    'ethanol': 'Etanol',
    'diesel': 'Diesel',
    'eletrico': 'Elétrico',
    'eletrica': 'Elétrico',
    'electric': 'Elétrico',
    'hibrido': 'Híbrido',
    'hybrid': 'Híbrido',
    'gnv': 'GNV',
    'gpl': 'GPL'
  }

  return fuelMap[normalized] || fuelType
}

/**
 * Normaliza cores do inglês para português
 */
export function normalizeColorDisplay(color: string): string {
  if (!color) return ''

  const normalized = color.toLowerCase().trim()

  // Mapeamento de cores principais
  const colorMap: Record<string, string> = {
    // Cores primárias
    'white': 'Branco',
    'black': 'Preto',
    'red': 'Vermelho',
    'blue': 'Azul',
    'green': 'Verde',
    'yellow': 'Amarelo',

    // Cores secundárias
    'silver': 'Prata',
    'gray': 'Cinza',
    'grey': 'Cinza',
    'brown': 'Marrom',
    'orange': 'Laranja',
    'purple': 'Roxo',
    'pink': 'Rosa',

    // Cores específicas de veículos
    'beige': 'Bege',
    'gold': 'Dourado',
    'champagne': 'Champagne',
    'pearl': 'Perolado',
    'metallic': 'Metálico',

    // Tons específicos
    'dark': 'Escuro',
    'light': 'Claro',
    'bright': 'Brilhante',
    'matte': 'Fosco'
  }

  return colorMap[normalized] || color
}

/**
 * Extrai dados do veículo a partir de um slug (com ID)
 */
export function parseVehicleSlug(slug: string): Partial<VehicleSlugData> {
  const parts = slug.split('-')
  const data: Partial<VehicleSlugData> = {}

  // O último elemento é sempre o ID
  if (parts.length > 0) {
    const lastPart = parts[parts.length - 1]
    const id = parseInt(lastPart)
    if (!isNaN(id)) {
      data.id = id
      parts.pop() // Remove o ID dos parts
    }
  }

  // O primeiro elemento é sempre a marca
  if (parts.length > 0) {
    data.brand = parts[0]
    parts.shift()
  }

  // O segundo elemento é sempre o modelo
  if (parts.length > 0) {
    data.model = parts[0]
    parts.shift()
  }

  // Processar elementos restantes
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]

    // Verificar se é ano (número de 4 dígitos)
    if (/^\d{4}$/.test(part)) {
      data.year = parseInt(part)
      continue
    }

    // Verificar se é transmissão conhecida
    if (['automatico', 'manual', 'cvt', 'semi-automatico'].includes(part)) {
      data.transmission = part
      continue
    }

    // Verificar se é combustível conhecido
    if (['gasolina', 'diesel', 'etanol', 'flex', 'hibrido', 'eletrico', 'gnv'].includes(part)) {
      data.fuel_type = part
      continue
    }

    // Se não for nenhum dos anteriores, pode ser cor
    if (!data.color) {
      data.color = part
    }
  }

  return data
}

/**
 * Gera URL amigável para um veículo
 */
export function generateVehicleUrl(vehicle: VehicleSlugData): string {
  const slug = generateVehicleSlug(vehicle)
  return `/comprar-carro/${slug}`
}

/**
 * Gera URL para lista de veículos
 */
export function generateVehiclesListUrl(filters?: {
  brand?: string
  model?: string
  year?: number
  fuel_type?: string
  transmission?: string
  color?: string
}): string {
  const params = new URLSearchParams()

  if (filters?.brand) params.append('marca', filters.brand)
  if (filters?.model) params.append('modelo', filters.model)
  if (filters?.year) params.append('ano', filters.year.toString())
  if (filters?.fuel_type) params.append('combustivel', filters.fuel_type)
  if (filters?.transmission) params.append('cambio', filters.transmission)
  if (filters?.color) params.append('cor', filters.color)

  const queryString = params.toString()
  return queryString ? `/comprar-carro?${queryString}` : '/comprar-carro'
}

/**
 * Valida se um slug de veículo é válido
 */
export function isValidVehicleSlug(slug: string): boolean {
  // Slug deve ter pelo menos marca-modelo-id
  const parts = slug.split('-')
  return parts.length >= 3 && !isNaN(parseInt(parts[parts.length - 1]))
}

/**
 * Exemplos de slugs gerados:
 * toyota-corolla-automatico-gasolina-prata-2020-123
 * honda-civic-manual-flex-branco-2019-456
 * volkswagen-golf-cvt-diesel-azul-2021-789
 */
