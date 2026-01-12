// Sistema de performance para agilizar o site do cliente
import { smartCache } from './cache'

// Configurações de performance
export const PERFORMANCE_CONFIG = {
  // Cache TTL (Time To Live) em milissegundos
  CACHE_TTL: {
    VEHICLES: 5 * 60 * 1000,      // 5 minutos
    BRANDS: 60 * 60 * 1000,       // 1 hora
    MODELS: 30 * 60 * 1000,       // 30 minutos
    DASHBOARD: 2 * 60 * 1000,     // 2 minutos
    LEADS: 3 * 60 * 1000,         // 3 minutos
    USER_PROFILE: 15 * 60 * 1000, // 15 minutos
  },

  // Configurações de pré-carregamento
  PRELOAD: {
    ENABLED: true,
    PRIORITY_ITEMS: ['brands', 'dashboard', 'user-profile'],
    DELAY: 1000, // 1 segundo após carregamento da página
  },

  // Configurações de lazy loading
  LAZY_LOAD: {
    ENABLED: true,
    THRESHOLD: 0.1, // 10% da tela
    ROOT_MARGIN: '50px',
  },

  // Configurações de debounce
  DEBOUNCE: {
    SEARCH: 300,      // 300ms para busca
    SCROLL: 100,      // 100ms para scroll
    RESIZE: 250,      // 250ms para redimensionamento
  }
}

// Função para pré-carregar dados críticos
export const preloadCriticalData = async () => {
  if (!PERFORMANCE_CONFIG.PRELOAD.ENABLED) return

  console.log('🚀 Iniciando pré-carregamento de dados críticos...')

  try {
    // Pré-carregar marcas (usado em formulários)
    await preloadBrands()

    // Pré-carregar dashboard (usado na página inicial)
    await preloadDashboard()

    // Pré-carregar perfil do usuário
    await preloadUserProfile()

    console.log('✅ Pré-carregamento concluído com sucesso!')
  } catch (error) {
    console.error('❌ Erro no pré-carregamento:', error)
  }
}

// Pré-carregar marcas
const preloadBrands = async () => {
  try {
    const cacheKey = 'brands:all'

    if (!smartCache.has(cacheKey)) {
      console.log('🔄 Pré-carregando marcas...')

      // Simular busca de marcas (implementar com API real)
      const mockBrands = [
        { id: 1, name: 'Honda', slug: 'honda' },
        { id: 2, name: 'Toyota', slug: 'toyota' },
        { id: 3, name: 'Volkswagen', slug: 'volkswagen' }
      ]

      smartCache.set(cacheKey, mockBrands, PERFORMANCE_CONFIG.CACHE_TTL.BRANDS)
      console.log('✅ Marcas pré-carregadas')
    }
  } catch (error) {
    console.error('❌ Erro ao pré-carregar marcas:', error)
  }
}

// Pré-carregar dashboard
const preloadDashboard = async () => {
  try {
    const cacheKey = 'dashboard:stats'

    if (!smartCache.has(cacheKey)) {
      console.log('🔄 Pré-carregando dashboard...')

      // Simular dados do dashboard (implementar com API real)
      const mockDashboard = {
        total_vehicles: 25,
        active_vehicles: 20,
        total_leads: 45,
        new_leads: 12
      }

      smartCache.set(cacheKey, mockDashboard, PERFORMANCE_CONFIG.CACHE_TTL.DASHBOARD)
      console.log('✅ Dashboard pré-carregado')
    }
  } catch (error) {
    console.error('❌ Erro ao pré-carregar dashboard:', error)
  }
}

// Pré-carregar perfil do usuário
const preloadUserProfile = async () => {
  try {
    const cacheKey = 'user:profile'

    if (!smartCache.has(cacheKey)) {
      console.log('🔄 Pré-carregando perfil do usuário...')

      // Simular dados do usuário (implementar com API real)
      const mockUser = {
        id: 1,
        name: 'Usuário Demo',
        email: 'usuario@demo.com',
        role: 'admin'
      }

      smartCache.set(cacheKey, mockUser, PERFORMANCE_CONFIG.CACHE_TTL.USER_PROFILE)
      console.log('✅ Perfil do usuário pré-carregado')
    }
  } catch (error) {
    console.error('❌ Erro ao pré-carregar perfil:', error)
  }
}

// Função para otimizar imagens
export const optimizeImages = () => {
  // Configurar lazy loading para imagens
  if (typeof window !== 'undefined' && PERFORMANCE_CONFIG.LAZY_LOAD.ENABLED) {
    const images = document.querySelectorAll('img[data-src]')

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src || ''
          img.classList.remove('lazy')
          observer.unobserve(img)
        }
      })
    }, {
      threshold: PERFORMANCE_CONFIG.LAZY_LOAD.THRESHOLD,
      rootMargin: PERFORMANCE_CONFIG.LAZY_LOAD.ROOT_MARGIN
    })

    images.forEach(img => imageObserver.observe(img))
  }
}

// Função para debounce
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Função para throttle
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Função para medir performance
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now()
  fn()
  const end = performance.now()

  console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`)

  return end - start
}

// Função para otimizar scroll
export const optimizeScroll = () => {
  if (typeof window === 'undefined') return

  const debouncedScroll = debounce(() => {
    // Otimizações de scroll aqui
    console.log('🔄 Scroll otimizado')
  }, PERFORMANCE_CONFIG.DEBOUNCE.SCROLL)

  window.addEventListener('scroll', debouncedScroll, { passive: true })
}

// Função para otimizar redimensionamento
export const optimizeResize = () => {
  if (typeof window === 'undefined') return

  const debouncedResize = debounce(() => {
    // Otimizações de redimensionamento aqui
    console.log('🔄 Redimensionamento otimizado')
  }, PERFORMANCE_CONFIG.DEBOUNCE.RESIZE)

  window.addEventListener('resize', debouncedResize, { passive: true })
}

// Função para inicializar otimizações
export const initializePerformance = () => {
  console.log('🚀 Inicializando otimizações de performance...')

  // Pré-carregar dados críticos
  setTimeout(preloadCriticalData, PERFORMANCE_CONFIG.PRELOAD.DELAY)

  // Otimizar scroll e resize
  optimizeScroll()
  optimizeResize()

  // Otimizar imagens
  optimizeImages()

  console.log('✅ Otimizações de performance inicializadas!')
}

// Exportar configurações
export default PERFORMANCE_CONFIG
