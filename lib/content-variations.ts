/**
 * Helper para processar conteúdo com variações (spintext/sintaxtext)
 * Converte sintaxe {opção1 | opção2 | opção3} em uma opção aleatória
 */

/**
 * Processa um texto com variações e retorna uma versão com opções aleatórias selecionadas
 * @param text - Texto com sintaxe de variação {opção1 | opção2 | opção3}
 * @param seed - Semente opcional para gerar resultados consistentes (útil para SEO)
 * @returns Texto processado com uma opção aleatória selecionada de cada variação
 */
export function processContentVariations(text: string, seed?: string): string {
  if (!text) return ''

  // Regex para encontrar padrões {opção1 | opção2 | opção3}
  const variationPattern = /\{([^}]+)\}/g

  const result = text.replace(variationPattern, (match, variations) => {
    // Dividir as opções por |
    const options = variations.split('|').map((option: string) => option.trim())

    // Se não há opções válidas, retornar o texto original
    if (options.length === 0) return match

    // Gerar índice aleatório baseado na semente (para consistência)
    const randomIndex = generateSeededRandom(options.length, seed)

    // Retornar a opção selecionada
    return options[randomIndex]
  })


  return result
}

/**
 * Gera um número aleatório baseado em uma semente para consistência
 * @param max - Valor máximo (exclusivo)
 * @param seed - Semente opcional
 * @returns Número aleatório entre 0 e max-1
 */
function generateSeededRandom(max: number, seed?: string): number {
  if (!seed) {
    return Math.floor(Math.random() * max)
  }

  // Usar a semente para gerar um hash simples
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Usar o hash para gerar um número "aleatório" consistente
  return Math.abs(hash) % max
}

/**
 * Processa múltiplos textos com variações
 * @param texts - Array de textos com variações
 * @param seed - Semente opcional para consistência
 * @returns Array de textos processados
 */
export function processMultipleContentVariations(texts: string[], seed?: string): string[] {
  return texts.map(text => processContentVariations(text, seed))
}

/**
 * Processa um objeto com textos que podem ter variações
 * @param content - Objeto com propriedades de texto
 * @param seed - Semente opcional para consistência
 * @returns Objeto com textos processados
 */
export function processObjectContentVariations<T extends Record<string, unknown>>(
  content: T,
  seed?: string
): T {
  const processed = { ...content }

  for (const key in processed) {
    if (typeof processed[key] === 'string') {
      processed[key] = processContentVariations(processed[key] as string, seed) as T[Extract<keyof T, string>]
    }
  }

  return processed
}

/**
 * Cria uma função de processamento com semente fixa para reutilização
 * @param seed - Semente fixa
 * @returns Função que processa texto com a semente fixa
 */
export function createSeededProcessor(seed: string) {
  return (text: string) => processContentVariations(text, seed)
}

/**
 * Processa conteúdo específico para páginas de veículos
 * @param vehicleData - Dados do veículo
 * @param content - Conteúdo com variações
 * @returns Conteúdo processado com dados do veículo
 */
export function processVehicleContent(
  vehicleData: {
    brand?: string | { name: string }
    model?: string | { name: string }
    year?: number
    fuel_type?: string
    transmission?: string
    mileage?: number
    price?: number
  },
  content: string
): string {
  // Criar semente baseada nos dados do veículo para consistência
  const brandName = typeof vehicleData.brand === 'string' ? vehicleData.brand : vehicleData.brand?.name || 'Veículo'
  const modelName = typeof vehicleData.model === 'string' ? vehicleData.model : vehicleData.model?.name || 'Modelo'
  const seed = `${brandName}-${modelName}-${vehicleData.year || '2024'}`

  // Processar variações
  let processedContent = processContentVariations(content, seed)

  // Substituir variáveis específicas do veículo
  processedContent = processedContent
    .replace(/\$\{brandName\}/g, brandName)
    .replace(/\$\{modelName\}/g, modelName)
    .replace(/\$\{year\}/g, String(vehicleData.year || '2024'))
    .replace(/\$\{fuelType\}/g, vehicleData.fuel_type || 'Flex')
    .replace(/\$\{transmission\}/g, vehicleData.transmission || 'Automático')
    .replace(/\$\{mileage\}/g, vehicleData.mileage ? vehicleData.mileage.toLocaleString('pt-BR') : '0')
    .replace(/\$\{price\}/g, vehicleData.price ? `R$ ${vehicleData.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Consulte')

  return processedContent
}

/**
 * Exemplos de uso:
 *
 * // Processamento básico
 * const text = "Este {carro | veículo | automóvel} é {perfeito | ideal | excelente}"
 * const result = processContentVariations(text)
 * // Resultado: "Este carro é perfeito" (ou outras combinações)
 *
 * // Processamento com semente (consistente)
 * const result1 = processContentVariations(text, "veiculo-123")
 * const result2 = processContentVariations(text, "veiculo-123")
 * // result1 === result2 (sempre o mesmo resultado para a mesma semente)
 *
 * // Processamento para veículos
 * const vehicleContent = processVehicleContent(vehicleData, content)
 */
