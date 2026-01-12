import { URL_PATTERN_TEMPLATES, generateUrlFromPattern } from './url-patterns'
import { VehicleUrlGeneration, UrlGenerationRequest } from '@/types/vehicle-urls'

// Configurações padrão do SpinText
const DEFAULT_SPINTEXT_CONFIGS = [
  {
    name: 'comprar-carro',
    pattern: 'comprar-carro',
    variations: ['comprar-carro', 'comprar-carro-seminovo', 'comprar-carro-novo', 'comprar-carro-usado']
  },
  {
    name: 'slug-do-carro',
    pattern: '{brand_slug}-{model_slug}-{year}',
    variations: [
      '{brand_slug}-{model_slug}-{year}',
      '{brand_slug}-{model_slug}',
      '{model_slug}-{year}',
      '{model_slug}'
    ]
  },
  {
    name: 'cidade-uf',
    pattern: '{city_slug}-{state_slug}',
    variations: [
      '{city_slug}-{state_slug}',
      '{city_slug}',
      '{state_slug}'
    ]
  }
]

// Configurações padrão do SyntaxText
const DEFAULT_SYNTAXTEXT_CONFIGS = [
  {
    name: 'veiculo-basico',
    pattern: '{brand_slug}-{model_slug}-{year}',
    syntax_rules: [
      'lowercase',
      'replace-spaces-with-hyphens',
      'remove-special-chars',
      'remove-accents'
    ]
  },
  {
    name: 'veiculo-com-localizacao',
    pattern: '{brand_slug}-{model_slug}-{year}/{city_slug}-{state_slug}',
    syntax_rules: [
      'lowercase',
      'replace-spaces-with-hyphens',
      'remove-special-chars',
      'remove-accents',
      'add-location-suffix'
    ]
  },
  {
    name: 'veiculo-com-bairro',
    pattern: '{brand_slug}-{model_slug}-{year}/{city_slug}/{neighborhood_slug}-{state_slug}',
    syntax_rules: [
      'lowercase',
      'replace-spaces-with-hyphens',
      'remove-special-chars',
      'remove-accents',
      'add-neighborhood-suffix'
    ]
  }
]

/**
 * Gera todas as URLs possíveis para um veículo
 */
export function generateAllVehicleUrls(request: UrlGenerationRequest): VehicleUrlGeneration[] {
  const results: VehicleUrlGeneration[] = []

  // Gerar URLs para cada template
  URL_PATTERN_TEMPLATES.forEach((template) => {
      const generatedUrl = generateUrlFromPattern(template.pattern, {
        brand_slug: slugify(request.brand),
        model_slug: slugify(request.model),
        year: request.year.toString(),
        city_slug: request.city ? slugify(request.city) : '',
        state_slug: request.state ? slugify(request.state) : '',
        neighborhood_slug: request.neighborhood ? slugify(request.neighborhood) : ''
      })

      if (generatedUrl) {
        // Gerar variações do SpinText
        const spintextVariations = generateSpinTextVariations(generatedUrl, request)

        // Gerar variações do SyntaxText
        const syntaxtextVariations = generateSyntaxTextVariations(generatedUrl, request)

        results.push({
          vehicle_id: request.vehicle_id,
          brand_slug: slugify(request.brand),
          model_slug: slugify(request.model),
          year: request.year,
          city_slug: request.city ? slugify(request.city) : undefined,
          state_slug: request.state ? slugify(request.state) : undefined,
          neighborhood_slug: request.neighborhood ? slugify(request.neighborhood) : undefined,
          language: request.language || 'pt-BR',
          canonical_url: generatedUrl,
          related_urls: [...spintextVariations, ...syntaxtextVariations],
          spintext_variations: spintextVariations,
          syntaxtext_variations: syntaxtextVariations
        })
      }
  })

  return results
}

/**
 * Gera variações usando SpinText
 */
function generateSpinTextVariations(baseUrl: string, request: UrlGenerationRequest): string[] {
  const variations: string[] = []

  DEFAULT_SPINTEXT_CONFIGS.forEach(config => {
    config.variations.forEach(variation => {
      const generatedVariation = generateUrlFromPattern(variation, {
        brand_slug: slugify(request.brand),
        model_slug: slugify(request.model),
        year: request.year.toString(),
        city_slug: request.city ? slugify(request.city) : '',
        state_slug: request.state ? slugify(request.state) : '',
        neighborhood_slug: request.neighborhood ? slugify(request.neighborhood) : ''
      })

      if (generatedVariation && !variations.includes(generatedVariation)) {
        variations.push(generatedVariation)
      }
    })
  })

  return variations
}

/**
 * Gera variações usando SyntaxText
 */
function generateSyntaxTextVariations(baseUrl: string, request: UrlGenerationRequest): string[] {
  const variations: string[] = []

  DEFAULT_SYNTAXTEXT_CONFIGS.forEach(config => {
    const generatedVariation = generateUrlFromPattern(config.pattern, {
      brand_slug: slugify(request.brand),
      model_slug: slugify(request.model),
      year: request.year.toString(),
      city_slug: request.city ? slugify(request.city) : '',
      state_slug: request.state ? slugify(request.state) : '',
      neighborhood_slug: request.neighborhood ? slugify(request.neighborhood) : ''
    })

    if (generatedVariation && !variations.includes(generatedVariation)) {
      variations.push(generatedVariation)
    }
  })

  return variations
}

/**
 * Converte texto para slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, '') // Remove hífens do início e fim
}

/**
 * Verifica duplicidades de URLs
 */
export function checkUrlDuplicates(urls: string[]): { url: string; is_duplicate: boolean; duplicates: string[] }[] {
  const results: { url: string; is_duplicate: boolean; duplicates: string[] }[] = []
  const urlMap = new Map<string, string[]>()

  // Agrupar URLs similares
  urls.forEach(url => {
    const normalizedUrl = normalizeUrl(url)
    if (!urlMap.has(normalizedUrl)) {
      urlMap.set(normalizedUrl, [])
    }
    urlMap.get(normalizedUrl)!.push(url)
  })

  // Verificar duplicidades
  urls.forEach(url => {
    const normalizedUrl = normalizeUrl(url)
    const duplicates = urlMap.get(normalizedUrl) || []
    const isDuplicate = duplicates.length > 1

    results.push({
      url,
      is_duplicate: isDuplicate,
      duplicates: isDuplicate ? duplicates.filter(d => d !== url) : []
    })
  })

  return results
}

/**
 * Normaliza URL para comparação
 */
function normalizeUrl(url: string): string {
  return url
    .toLowerCase()
    .replace(/\/$/, '') // Remove barra final
    .replace(/\/+/g, '/') // Remove barras duplicadas
    .replace(/[?&].*$/, '') // Remove query parameters
}

/**
 * Gera URLs para múltiplas linguagens
 */
export function generateMultilanguageUrls(baseUrls: string[], languages: string[]): Record<string, string[]> {
  const result: Record<string, string[]> = {}

  languages.forEach(lang => {
    result[lang] = baseUrls.map(url => {
      // Adicionar prefixo de linguagem se necessário
      if (lang !== 'pt-BR') {
        return `/${lang}${url}`
      }
      return url
    })
  })

  return result
}

/**
 * Atualiza sitemap com mudanças de URL
 */
export function createSitemapUpdateRequest(
  vehicleId: number,
  urlChanges: { old_url: string; new_url: string; change_type: 'created' | 'updated' | 'redirected' | 'deleted' }[]
): { vehicle_id: number; url_changes: typeof urlChanges; update_timestamp: string } {
  return {
    vehicle_id: vehicleId,
    url_changes: urlChanges,
    update_timestamp: new Date().toISOString()
  }
}

/**
 * Valida se uma URL é válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url, 'https://example.com')
    return true
  } catch {
    return false
  }
}

/**
 * Gera URLs canônicas para um veículo
 */
export function generateCanonicalUrls(request: UrlGenerationRequest): string[] {
  const canonicalUrls: string[] = []

  // URL principal do veículo
  const mainUrl = `/${slugify(request.brand)}/${slugify(request.model)}-${request.year}`
  canonicalUrls.push(mainUrl)

  // URL com localização se disponível
  if (request.city && request.state) {
    const locationUrl = `${mainUrl}/${slugify(request.city)}-${slugify(request.state)}`
    canonicalUrls.push(locationUrl)

    // URL com bairro se disponível
    if (request.neighborhood) {
      const neighborhoodUrl = `${mainUrl}/${slugify(request.city)}/${slugify(request.neighborhood)}-${slugify(request.state)}`
      canonicalUrls.push(neighborhoodUrl)
    }
  }

  return canonicalUrls
}
