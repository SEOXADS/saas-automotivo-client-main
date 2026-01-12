// Sistema de cache inteligente para agilizar o site
interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number // Time to live em milissegundos
}

class SmartCache {
  private cache = new Map<string, CacheItem<unknown>>()
  private maxSize = 100 // Máximo de itens no cache

  // Adicionar item ao cache
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Limpar cache se estiver cheio
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

    // Obter item do cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) return null

    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  // Verificar se item existe e não expirou
  has(key: string): boolean {
    const item = this.cache.get(key)

    if (!item) return false

    // Verificar se expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  // Remover item específico
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Limpar cache expirado
  cleanup(): void {
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Limpar todo o cache
  clear(): void {
    this.cache.clear()
  }

  // Obter estatísticas do cache
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Instância global do cache
export const smartCache = new SmartCache()

// Funções utilitárias para cache
export const cacheUtils = {
  // Cache para veículos (5 minutos)
  vehicles: {
    key: (filters: Record<string, unknown>) => `vehicles:${JSON.stringify(filters)}`,
    ttl: 5 * 60 * 1000
  },

  // Cache para marcas (1 hora)
  brands: {
    key: () => 'brands:all',
    ttl: 60 * 60 * 1000
  },

  // Cache para modelos (30 minutos)
  models: {
    key: (brandId: number) => `models:${brandId}`,
    ttl: 30 * 60 * 1000
  },

  // Cache para dashboard (2 minutos)
  dashboard: {
    key: () => 'dashboard:stats',
    ttl: 2 * 60 * 1000
  },

  // Cache para leads (3 minutos)
  leads: {
    key: (filters: Record<string, unknown>) => `leads:${JSON.stringify(filters)}`,
    ttl: 3 * 60 * 1000
  }
}

// Função para pré-carregar dados importantes
export const preloadCriticalData = async () => {
  const criticalData = [
    { key: 'brands:all', ttl: 60 * 60 * 1000 },
    { key: 'dashboard:stats', ttl: 2 * 60 * 1000 }
  ]

  // Pré-carregar dados críticos em background
  criticalData.forEach(async (item) => {
    if (!smartCache.has(item.key)) {
      try {
        // Implementar busca de dados críticos
        console.log(`🔄 Pré-carregando: ${item.key}`)
      } catch (error) {
        console.error(`❌ Erro ao pré-carregar ${item.key}:`, error)
      }
    }
  })
}

// Função para limpar cache baseado em padrões
export const clearCachePattern = (pattern: string) => {
  const keys = Array.from(smartCache['cache'].keys())
  const matchingKeys = keys.filter(key => key.includes(pattern))

  matchingKeys.forEach(key => smartCache.delete(key))
  console.log(`🧹 Cache limpo para padrão: ${pattern} (${matchingKeys.length} itens)`)
}

export default smartCache
