// Sistema de geração automática de URLs baseado nos patterns
export interface UrlPatternTemplate {
  id: string
  name: string
  pattern: string
  description: string
  category: 'vehicle' | 'article' | 'brand'
  variables: string[]
  example: string
}

export const URL_PATTERN_TEMPLATES: UrlPatternTemplate[] = [
  // ===== VEÍCULOS - SEM MARCA =====
  {
    id: 'vehicle-basic',
    name: 'Veículo Básico',
    pattern: '/{vehicle_id}-{slug-do-carro}',
    description: 'URL básica para veículo sem localização',
    category: 'vehicle',
    variables: ['vehicle_id', 'slug-do-carro'],
    example: '/123-honda-civic-2023'
  },
  {
    id: 'vehicle-city',
    name: 'Veículo com Cidade',
    pattern: '/{vehicle_id}-{slug-do-carro}/{cidade-uf}',
    description: 'URL para veículo com cidade',
    category: 'vehicle',
    variables: ['vehicle_id', 'slug-do-carro', 'cidade-uf'],
    example: '/123-honda-civic-2023/sao-paulo-sp'
  },
  {
    id: 'vehicle-city-neighborhood',
    name: 'Veículo com Cidade e Bairro',
    pattern: '/{vehicle_id}-{slug-do-carro}/{cidade}/{bairro-uf}',
    description: 'URL para veículo com cidade e bairro',
    category: 'vehicle',
    variables: ['vehicle_id', 'slug-do-carro', 'cidade', 'bairro-uf'],
    example: '/123-honda-civic-2023/sao-paulo/vila-madalena-sp'
  },

  // ===== VEÍCULOS - COM MARCA =====
  {
    id: 'brand-vehicle-basic',
    name: 'Marca + Veículo Básico',
    pattern: '/{slug-da-marca}/{vehicle_id}-{slug-do-carro}',
    description: 'URL para marca + veículo sem localização',
    category: 'vehicle',
    variables: ['slug-da-marca', 'vehicle_id', 'slug-do-carro'],
    example: '/honda/123-civic-2023'
  },
  {
    id: 'brand-vehicle-city',
    name: 'Marca + Veículo com Cidade',
    pattern: '/{slug-da-marca}/{vehicle_id}-{slug-do-carro}/{cidade-uf}',
    description: 'URL para marca + veículo com cidade',
    category: 'vehicle',
    variables: ['slug-da-marca', 'vehicle_id', 'slug-do-carro', 'cidade-uf'],
    example: '/honda/123-civic-2023/sao-paulo-sp'
  },
  {
    id: 'brand-vehicle-city-neighborhood',
    name: 'Marca + Veículo com Cidade e Bairro',
    pattern: '/{slug-da-marca}/{vehicle_id}-{slug-do-carro}/{cidade}/{bairro-uf}',
    description: 'URL para marca + veículo com cidade e bairro',
    category: 'vehicle',
    variables: ['slug-da-marca', 'vehicle_id', 'slug-do-carro', 'cidade', 'bairro-uf'],
    example: '/honda/123-civic-2023/sao-paulo/vila-madalena-sp'
  },

  // ===== VEÍCULOS - COM COMPRAR-CARRO =====
  {
    id: 'buy-vehicle-basic',
    name: 'Comprar Carro Básico',
    pattern: '/comprar-carro/{vehicle_id}-{slug-do-carro}',
    description: 'URL para comprar carro básico',
    category: 'vehicle',
    variables: ['vehicle_id', 'slug-do-carro'],
    example: '/comprar-carro/123-honda-civic-2023'
  },
  {
    id: 'buy-vehicle-seminovo',
    name: 'Comprar Carro Seminovo',
    pattern: '/comprar-carro-seminovo/{vehicle_id}-{slug-do-carro}',
    description: 'URL para comprar carro seminovo',
    category: 'vehicle',
    variables: ['vehicle_id', 'slug-do-carro'],
    example: '/comprar-carro-seminovo/123-honda-civic-2023'
  },
  {
    id: 'buy-vehicle-novo',
    name: 'Comprar Carro Novo',
    pattern: '/comprar-carro-novo/{vehicle_id}-{slug-do-carro}',
    description: 'URL para comprar carro novo',
    category: 'vehicle',
    variables: ['vehicle_id', 'slug-do-carro'],
    example: '/comprar-carro-novo/123-honda-civic-2023'
  },
  {
    id: 'buy-vehicle-usado',
    name: 'Comprar Carro Usado',
    pattern: '/comprar-carro-usado/{vehicle_id}-{slug-do-carro}',
    description: 'URL para comprar carro usado',
    category: 'vehicle',
    variables: ['vehicle_id', 'slug-do-carro'],
    example: '/comprar-carro-usado/123-honda-civic-2023'
  },

  // ===== VEÍCULOS - COMPRAR-CARRO COM CIDADE =====
  {
    id: 'buy-vehicle-city',
    name: 'Comprar Carro com Cidade',
    pattern: '/comprar-carro/{vehicle_id}-{slug-do-carro}/{cidade-uf}',
    description: 'URL para comprar carro com cidade',
    category: 'vehicle',
    variables: ['vehicle_id', 'slug-do-carro', 'cidade-uf'],
    example: '/comprar-carro/123-honda-civic-2023/sao-paulo-sp'
  },
  {
    id: 'buy-vehicle-seminovo-city',
    name: 'Comprar Carro Seminovo com Cidade',
    pattern: '/comprar-carro-seminovo/{vehicle_id}-{slug-do-carro}/{cidade-uf}',
    description: 'URL para comprar carro seminovo com cidade',
    category: 'vehicle',
    variables: ['vehicle_id', 'slug-do-carro', 'cidade-uf'],
    example: '/comprar-carro-seminovo/123-honda-civic-2023/sao-paulo-sp'
  },
  {
    id: 'buy-vehicle-novo-city',
    name: 'Comprar Carro Novo com Cidade',
    pattern: '/comprar-carro-novo/{vehicle_id}-{slug-do-carro}/{cidade-uf}',
    description: 'URL para comprar carro novo com cidade',
    category: 'vehicle',
    variables: ['vehicle_id', 'slug-do-carro', 'cidade-uf'],
    example: '/comprar-carro-novo/123-honda-civic-2023/sao-paulo-sp'
  },
  {
    id: 'buy-vehicle-usado-city',
    name: 'Comprar Carro Usado com Cidade',
    pattern: '/comprar-carro-usado/{vehicle_id}-{slug-do-carro}/{cidade-uf}',
    description: 'URL para comprar carro usado com cidade',
    category: 'vehicle',
    variables: ['vehicle_id', 'slug-do-carro', 'cidade-uf'],
    example: '/comprar-carro-usado/123-honda-civic-2023/sao-paulo-sp'
  },

  // ===== VEÍCULOS - COMPRAR-CARRO COM CIDADE E BAIRRO =====
  {
    id: 'buy-vehicle-city-neighborhood',
    name: 'Comprar Carro com Cidade e Bairro',
    pattern: '/comprar-carro/{vehicle_id}-{slug-do-carro}/{cidade}/{bairro-uf}',
    description: 'URL para comprar carro com cidade e bairro',
    category: 'vehicle',
    variables: ['vehicle_id', 'slug-do-carro', 'cidade', 'bairro-uf'],
    example: '/comprar-carro/123-honda-civic-2023/sao-paulo/vila-madalena-sp'
  },
  {
    id: 'buy-vehicle-seminovo-city-neighborhood',
    name: 'Comprar Carro Seminovo com Cidade e Bairro',
    pattern: '/comprar-carro-seminovo/{vehicle_id}-{slug-do-carro}/{cidade}/{bairro-uf}',
    description: 'URL para comprar carro seminovo com cidade e bairro',
    category: 'vehicle',
    variables: ['vehicle_id', 'slug-do-carro', 'cidade', 'bairro-uf'],
    example: '/comprar-carro-seminovo/123-honda-civic-2023/sao-paulo/vila-madalena-sp'
  },
  {
    id: 'buy-vehicle-novo-city-neighborhood',
    name: 'Comprar Carro Novo com Cidade e Bairro',
    pattern: '/comprar-carro-novo/{vehicle_id}-{slug-do-carro}/{cidade}/{bairro-uf}',
    description: 'URL para comprar carro novo com cidade e bairro',
    category: 'vehicle',
    variables: ['vehicle_id', 'slug-do-carro', 'cidade', 'bairro-uf'],
    example: '/comprar-carro-novo/123-honda-civic-2023/sao-paulo/vila-madalena-sp'
  },
  {
    id: 'buy-vehicle-usado-city-neighborhood',
    name: 'Comprar Carro Usado com Cidade e Bairro',
    pattern: '/comprar-carro-usado/{vehicle_id}-{slug-do-carro}/{cidade}/{bairro-uf}',
    description: 'URL para comprar carro usado com cidade e bairro',
    category: 'vehicle',
    variables: ['vehicle_id', 'slug-do-carro', 'cidade', 'bairro-uf'],
    example: '/comprar-carro-usado/123-honda-civic-2023/sao-paulo/vila-madalena-sp'
  },

  // ===== VEÍCULOS - MARCA + COMPRAR-CARRO =====
  {
    id: 'brand-buy-vehicle-basic',
    name: 'Marca + Comprar Carro Básico',
    pattern: '/{slug-da-marca}/comprar-carro/{vehicle_id}-{slug-do-carro}',
    description: 'URL para marca + comprar carro básico',
    category: 'vehicle',
    variables: ['slug-da-marca', 'vehicle_id', 'slug-do-carro'],
    example: '/honda/comprar-carro/123-civic-2023'
  },
  {
    id: 'brand-buy-vehicle-seminovo',
    name: 'Marca + Comprar Carro Seminovo',
    pattern: '/{slug-da-marca}/comprar-carro-seminovo/{vehicle_id}-{slug-do-carro}',
    description: 'URL para marca + comprar carro seminovo',
    category: 'vehicle',
    variables: ['slug-da-marca', 'vehicle_id', 'slug-do-carro'],
    example: '/honda/comprar-carro-seminovo/123-civic-2023'
  },
  {
    id: 'brand-buy-vehicle-novo',
    name: 'Marca + Comprar Carro Novo',
    pattern: '/{slug-da-marca}/comprar-carro-novo/{vehicle_id}-{slug-do-carro}',
    description: 'URL para marca + comprar carro novo',
    category: 'vehicle',
    variables: ['slug-da-marca', 'vehicle_id', 'slug-do-carro'],
    example: '/honda/comprar-carro-novo/123-civic-2023'
  },
  {
    id: 'brand-buy-vehicle-usado',
    name: 'Marca + Comprar Carro Usado',
    pattern: '/{slug-da-marca}/comprar-carro-usado/{vehicle_id}-{slug-do-carro}',
    description: 'URL para marca + comprar carro usado',
    category: 'vehicle',
    variables: ['slug-da-marca', 'vehicle_id', 'slug-do-carro'],
    example: '/honda/comprar-carro-usado/123-civic-2023'
  },

  // ===== VEÍCULOS - MARCA + COMPRAR-CARRO COM CIDADE =====
  {
    id: 'brand-buy-vehicle-city',
    name: 'Marca + Comprar Carro com Cidade',
    pattern: '/{slug-da-marca}/comprar-carro/{vehicle_id}-{slug-do-carro}/{cidade-uf}',
    description: 'URL para marca + comprar carro com cidade',
    category: 'vehicle',
    variables: ['slug-da-marca', 'vehicle_id', 'slug-do-carro', 'cidade-uf'],
    example: '/honda/comprar-carro/123-civic-2023/sao-paulo-sp'
  },
  {
    id: 'brand-buy-vehicle-seminovo-city',
    name: 'Marca + Comprar Carro Seminovo com Cidade',
    pattern: '/{slug-da-marca}/comprar-carro-seminovo/{vehicle_id}-{slug-do-carro}/{cidade-uf}',
    description: 'URL para marca + comprar carro seminovo com cidade',
    category: 'vehicle',
    variables: ['slug-da-marca', 'vehicle_id', 'slug-do-carro', 'cidade-uf'],
    example: '/honda/comprar-carro-seminovo/123-civic-2023/sao-paulo-sp'
  },
  {
    id: 'brand-buy-vehicle-novo-city',
    name: 'Marca + Comprar Carro Novo com Cidade',
    pattern: '/{slug-da-marca}/comprar-carro-novo/{vehicle_id}-{slug-do-carro}/{cidade-uf}',
    description: 'URL para marca + comprar carro novo com cidade',
    category: 'vehicle',
    variables: ['slug-da-marca', 'vehicle_id', 'slug-do-carro', 'cidade-uf'],
    example: '/honda/comprar-carro-novo/123-civic-2023/sao-paulo-sp'
  },
  {
    id: 'brand-buy-vehicle-usado-city',
    name: 'Marca + Comprar Carro Usado com Cidade',
    pattern: '/{slug-da-marca}/comprar-carro-usado/{vehicle_id}-{slug-do-carro}/{cidade-uf}',
    description: 'URL para marca + comprar carro usado com cidade',
    category: 'vehicle',
    variables: ['slug-da-marca', 'vehicle_id', 'slug-do-carro', 'cidade-uf'],
    example: '/honda/comprar-carro-usado/123-civic-2023/sao-paulo-sp'
  },

  // ===== VEÍCULOS - MARCA + COMPRAR-CARRO COM CIDADE E BAIRRO =====
  {
    id: 'brand-buy-vehicle-city-neighborhood',
    name: 'Marca + Comprar Carro com Cidade e Bairro',
    pattern: '/{slug-da-marca}/comprar-carro/{vehicle_id}-{slug-do-carro}/{cidade}/{bairro-uf}',
    description: 'URL para marca + comprar carro com cidade e bairro',
    category: 'vehicle',
    variables: ['slug-da-marca', 'vehicle_id', 'slug-do-carro', 'cidade', 'bairro-uf'],
    example: '/honda/comprar-carro/123-civic-2023/sao-paulo/vila-madalena-sp'
  },
  {
    id: 'brand-buy-vehicle-seminovo-city-neighborhood',
    name: 'Marca + Comprar Carro Seminovo com Cidade e Bairro',
    pattern: '/{slug-da-marca}/comprar-carro-seminovo/{vehicle_id}-{slug-do-carro}/{cidade}/{bairro-uf}',
    description: 'URL para marca + comprar carro seminovo com cidade e bairro',
    category: 'vehicle',
    variables: ['slug-da-marca', 'vehicle_id', 'slug-do-carro', 'cidade', 'bairro-uf'],
    example: '/honda/comprar-carro-seminovo/123-civic-2023/sao-paulo/vila-madalena-sp'
  },
  {
    id: 'brand-buy-vehicle-novo-city-neighborhood',
    name: 'Marca + Comprar Carro Novo com Cidade e Bairro',
    pattern: '/{slug-da-marca}/comprar-carro-novo/{vehicle_id}-{slug-do-carro}/{cidade}/{bairro-uf}',
    description: 'URL para marca + comprar carro novo com cidade e bairro',
    category: 'vehicle',
    variables: ['slug-da-marca', 'vehicle_id', 'slug-do-carro', 'cidade', 'bairro-uf'],
    example: '/honda/comprar-carro-novo/123-civic-2023/sao-paulo/vila-madalena-sp'
  },
  {
    id: 'brand-buy-vehicle-usado-city-neighborhood',
    name: 'Marca + Comprar Carro Usado com Cidade e Bairro',
    pattern: '/{slug-da-marca}/comprar-carro-usado/{vehicle_id}-{slug-do-carro}/{cidade}/{bairro-uf}',
    description: 'URL para marca + comprar carro usado com cidade e bairro',
    category: 'vehicle',
    variables: ['slug-da-marca', 'vehicle_id', 'slug-do-carro', 'cidade', 'bairro-uf'],
    example: '/honda/comprar-carro-usado/123-civic-2023/sao-paulo/vila-madalena-sp'
  },

  // ===== ARTIGOS =====
  {
    id: 'article-basic',
    name: 'Artigo Básico',
    pattern: '/{article_id}-{slug-do-artigo}',
    description: 'URL básica para artigo',
    category: 'article',
    variables: ['article_id', 'slug-do-artigo'],
    example: '/456-como-comprar-carro-usado'
  },
  {
    id: 'article-city',
    name: 'Artigo com Cidade',
    pattern: '/{article_id}-{slug-do-artigo}/{cidade-uf}',
    description: 'URL para artigo com cidade',
    category: 'article',
    variables: ['article_id', 'slug-do-artigo', 'cidade-uf'],
    example: '/456-como-comprar-carro-usado/sao-paulo-sp'
  },
  {
    id: 'article-related',
    name: 'Artigo Relacionado',
    pattern: '/{article_id}-{slug-do-artigo}/{slug-relacionado}',
    description: 'URL para artigo com conteúdo relacionado',
    category: 'article',
    variables: ['article_id', 'slug-do-artigo', 'slug-relacionado'],
    example: '/456-como-comprar-carro-usado/dicas-financiamento'
  },
  {
    id: 'article-related-city',
    name: 'Artigo Relacionado com Cidade',
    pattern: '/{article_id}-{slug-do-artigo}/{slug-relacionado}/{cidade-uf}',
    description: 'URL para artigo relacionado com cidade',
    category: 'article',
    variables: ['article_id', 'slug-do-artigo', 'slug-relacionado', 'cidade-uf'],
    example: '/456-como-comprar-carro-usado/dicas-financiamento/sao-paulo-sp'
  },
  {
    id: 'article-city-neighborhood',
    name: 'Artigo com Cidade e Bairro',
    pattern: '/{article_id}-{slug-do-artigo}/{cidade}/{bairro-uf}',
    description: 'URL para artigo com cidade e bairro',
    category: 'article',
    variables: ['article_id', 'slug-do-artigo', 'cidade', 'bairro-uf'],
    example: '/456-como-comprar-carro-usado/sao-paulo/vila-madalena-sp'
  },
  {
    id: 'article-related-city-neighborhood',
    name: 'Artigo Relacionado com Cidade e Bairro',
    pattern: '/{article_id}-{slug-do-artigo}/{slug-relacionado}/{cidade}/{bairro-uf}',
    description: 'URL para artigo relacionado com cidade e bairro',
    category: 'article',
    variables: ['article_id', 'slug-do-artigo', 'slug-relacionado', 'cidade', 'bairro-uf'],
    example: '/456-como-comprar-carro-usado/dicas-financiamento/sao-paulo/vila-madalena-sp'
  },

  // ===== MARCAS =====
  {
    id: 'brand-basic',
    name: 'Marca Básica',
    pattern: '/{brand_id}-{slug-da-marca}',
    description: 'URL básica para marca',
    category: 'brand',
    variables: ['brand_id', 'slug-da-marca'],
    example: '/789-honda'
  },
  {
    id: 'brand-city',
    name: 'Marca com Cidade',
    pattern: '/{brand_id}-{slug-da-marca}/{cidade-uf}',
    description: 'URL para marca com cidade',
    category: 'brand',
    variables: ['brand_id', 'slug-da-marca', 'cidade-uf'],
    example: '/789-honda/sao-paulo-sp'
  },
  {
    id: 'brand-city-neighborhood',
    name: 'Marca com Cidade e Bairro',
    pattern: '/{brand_id}-{slug-da-marca}/{cidade}/{bairro-uf}',
    description: 'URL para marca com cidade e bairro',
    category: 'brand',
    variables: ['brand_id', 'slug-da-marca', 'cidade', 'bairro-uf'],
    example: '/789-honda/sao-paulo/vila-madalena-sp'
  }
]

/**
 * Resolve conflitos entre nomes de cidade e bairro idênticos
 * Se cidade e bairro têm o mesmo nome, adiciona o estado completo ao bairro
 */
export function resolveCityNeighborhoodConflict(
  cityName: string,
  neighborhoodName: string,
  stateName: string
): string {
  const citySlug = cityName.toLowerCase().replace(/\s+/g, '-')
  const neighborhoodSlug = neighborhoodName.toLowerCase().replace(/\s+/g, '-')

  if (citySlug === neighborhoodSlug) {
    // Se cidade e bairro têm nomes idênticos, adiciona o estado completo
    return `${neighborhoodSlug}-${stateName.toLowerCase().replace(/\s+/g, '-')}`
  }
  return neighborhoodSlug
}

/**
 * Gera slug para cidade com UF
 */
export function generateCityUfSlug(cityName: string, stateCode: string): string {
  const citySlug = cityName.toLowerCase().replace(/\s+/g, '-')
  return `${citySlug}-${stateCode.toLowerCase()}`
}

/**
 * Gera slug para bairro com UF (resolvendo conflitos com cidade)
 */
export function generateNeighborhoodUfSlug(
  neighborhoodName: string,
  cityName: string,
  stateName: string
): string {
  return resolveCityNeighborhoodConflict(cityName, neighborhoodName, stateName)
}

/**
 * Gera URL a partir de um pattern e variáveis
 */
export function generateUrlFromPattern(pattern: string, variables: Record<string, string>): string {
  let url = pattern

  // Substitui todas as variáveis no pattern
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`
    url = url.replace(new RegExp(placeholder, 'g'), value)
  })

  return url
}
