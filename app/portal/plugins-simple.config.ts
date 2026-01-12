// Configuração simplificada dos plugins - começando apenas com ícones
export interface SimplePlugin {
  name: string
  type: 'css' | 'js'
  path: string
  priority: number
  condition?: () => boolean
}

import { ASSET_PATHS } from '@/lib/asset-config'

// Plugins básicos: ícones + Slick + Fancybox
export const BASIC_PLUGINS: SimplePlugin[] = [
  // jQuery - Biblioteca base (DEVE SER O PRIMEIRO)
  {
    name: 'jquery-js',
    type: 'js',
    path: ASSET_PATHS.JQUERY_JS,
    priority: 1
  },

  // Boxicons - Ícones
  {
    name: 'boxicons-css',
    type: 'css',
    path: ASSET_PATHS.BOXICONS_CSS,
    priority: 2
  },

  // FontAwesome - Ícones
  {
    name: 'fontawesome-css',
    type: 'css',
    path: ASSET_PATHS.FONTAWESOME_CSS,
    priority: 3
  },

  // Slick Carousel - CSS
  {
    name: 'slick-css',
    type: 'css',
    path: ASSET_PATHS.SLICK_CSS,
    priority: 4
  },

  // Slick Carousel - JS
  {
    name: 'slick-js',
    type: 'js',
    path: ASSET_PATHS.SLICK_JS,
    priority: 5
  },

  // Fancybox - CSS
  {
    name: 'fancybox-css',
    type: 'css',
    path: ASSET_PATHS.FANCYBOX_CSS,
    priority: 6
  },

  // Fancybox - JS
  {
    name: 'fancybox-js',
    type: 'js',
    path: ASSET_PATHS.FANCYBOX_JS,
    priority: 7
  }
]

// Função para carregar jQuery primeiro
const loadJQuery = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Verificar se jQuery já está carregado
    if (typeof window !== 'undefined' && (window as unknown as { jQuery?: unknown }).jQuery) {
      console.log('✅ jQuery já está carregado')
      resolve()
      return
    }

    // Verificar se já existe um script jQuery
    const existingScript = document.querySelector('script[src*="jquery"]')
    if (existingScript) {
      // Aguardar o carregamento
      existingScript.addEventListener('load', () => {
        console.log('✅ jQuery carregado via script existente')
        resolve()
      })
      existingScript.addEventListener('error', () => {
        console.error('❌ Erro ao carregar jQuery existente')
        reject(new Error('Failed to load existing jQuery'))
      })
      return
    }

    // Carregar jQuery
    const script = document.createElement('script')
    script.src = '/portal/assets/plugins/jquery/jquery.min.js'
    script.async = false // Carregamento síncrono
    script.onload = () => {
      console.log('✅ jQuery carregado com sucesso')
      resolve()
    }
    script.onerror = () => {
      console.error('❌ Erro ao carregar jQuery')
      reject(new Error('Failed to load jQuery'))
    }
    document.head.appendChild(script)
  })
}

// Função para carregar plugins básicos (ícones + Slick + Fancybox)
export const loadBasicPlugins = async (plugins: SimplePlugin[] = BASIC_PLUGINS) => {
  console.log('🎨 Carregando plugins básicos (ícones + Slick + Fancybox)...')

  try {
    // Carregar jQuery primeiro
    await loadJQuery()

    // Aguardar um pouco para garantir que jQuery está disponível
    await new Promise(resolve => setTimeout(resolve, 100))

    // Carregar outros plugins
    const otherPlugins = plugins.filter(plugin => plugin.name !== 'jquery-js')
    const loadPromises = otherPlugins
      .filter(plugin => !plugin.condition || plugin.condition())
      .sort((a, b) => a.priority - b.priority)
      .map(plugin => {
        return new Promise<void>((resolve, reject) => {
          if (plugin.type === 'css') {
            // Verificar se já foi carregado
            const existingLink = document.querySelector(`link[href="${plugin.path}"]`)
            if (existingLink) {
              console.log(`✅ CSS já carregado: ${plugin.name}`)
              resolve()
              return
            }

            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = plugin.path
            link.onload = () => {
              console.log(`✅ CSS carregado: ${plugin.name}`)
              resolve()
            }
            link.onerror = () => {
              console.error(`❌ Erro ao carregar CSS: ${plugin.name} - ${plugin.path}`)
              reject(new Error(`Failed to load CSS: ${plugin.path}`))
            }
            document.head.appendChild(link)
          } else if (plugin.type === 'js') {
            // Verificar se já foi carregado
            const existingScript = document.querySelector(`script[src="${plugin.path}"]`)
            if (existingScript) {
              console.log(`✅ JS já carregado: ${plugin.name}`)
              resolve()
              return
            }

            const script = document.createElement('script')
            script.src = plugin.path
            script.async = true
            script.defer = true
            script.onload = () => {
              console.log(`✅ JS carregado: ${plugin.name}`)
              resolve()
            }
            script.onerror = () => {
              console.error(`❌ Erro ao carregar JS: ${plugin.name} - ${plugin.path}`)
              reject(new Error(`Failed to load JS: ${plugin.path}`))
            }
            document.head.appendChild(script)
          }
        })
      })

    await Promise.all(loadPromises)
    console.log('🎉 Todos os plugins básicos carregados com sucesso!')
    console.log('📋 Plugins carregados:', plugins.map(p => p.name))
  } catch (error) {
    console.error('💥 Erro ao carregar plugins básicos:', error)
  }
}

// Função para inicializar Slick Carousel
export const initializeSlickCarousel = () => {
  console.log('🎠 Inicializando Slick Carousel...')

  if (typeof window !== 'undefined' && (window as unknown as { jQuery?: unknown }).jQuery) {
    const $ = (window as unknown as { jQuery: unknown }).jQuery as unknown as (selector: string) => {
      hasClass: (className: string) => boolean
      attr: (attribute: string) => string | undefined
      each: (callback: (this: HTMLElement) => void) => void
      slick: (options: Record<string, unknown>) => void
    }

    // Inicializar carrosséis com classe .slick-carousel
    $('.slick-carousel').each(function(this: HTMLElement) {
      const $this = $(this as unknown as string)
      if (!$this.hasClass('slick-initialized')) {
        $this.slick({
          dots: true,
          infinite: true,
          speed: 300,
          slidesToShow: 1,
          slidesToScroll: 1,
          adaptiveHeight: true,
          autoplay: true,
          autoplaySpeed: 3000,
          arrows: true,
          prevArrow: '<button type="button" class="slick-prev"><i class="bx bx-chevron-left"></i></button>',
          nextArrow: '<button type="button" class="slick-next"><i class="bx bx-chevron-right"></i></button>'
        })
        console.log('✅ Slick Carousel inicializado:', $this.attr('class'))
      }
    })

    console.log('🎉 Slick Carousel inicializado com sucesso!')
  } else {
    console.warn('⚠️ jQuery não encontrado para inicializar Slick Carousel')
  }
}

// Função para inicializar Fancybox
export const initializeFancybox = () => {
  console.log('🖼️ Inicializando Fancybox...')

  if (typeof window !== 'undefined' && (window as unknown as { Fancybox?: unknown }).Fancybox) {
    const Fancybox = (window as unknown as { Fancybox: unknown }).Fancybox as unknown as {
      bind: (selector: string, options: Record<string, unknown>) => void
    }

    // Inicializar Fancybox para galerias de imagens
    Fancybox.bind('[data-fancybox]', {
      // Configurações do Fancybox
      Toolbar: {
        display: {
          left: ['infobar'],
          middle: ['zoomIn', 'zoomOut', 'toggle1to1', 'rotateCCW', 'rotateCW', 'flipX', 'flipY'],
          right: ['slideshow', 'thumbs', 'close']
        }
      },
      Thumbs: {
        autoStart: false
      },
      Carousel: {
        transition: 'slide',
        preload: 2
      },
      Images: {
        zoom: true
      },
      // Tradução para português
      l10n: {
        CLOSE: 'Fechar',
        NEXT: 'Próximo',
        PREV: 'Anterior',
        MODAL: 'Você pode fechar este modal pressionando ESC',
        ERROR: 'Algo deu errado. Por favor, tente novamente mais tarde.',
        IMAGE_ERROR: 'Imagem não encontrada',
        ELEMENT_NOT_FOUND: 'Elemento HTML não encontrado',
        AJAX_NOT_FOUND: 'Erro ao carregar AJAX: Não encontrado',
        AJAX_FORBIDDEN: 'Erro ao carregar AJAX: Proibido',
        IFRAME_ERROR: 'Erro ao carregar iframe',
        TOGGLE_ZOOM: 'Alternar nível de zoom',
        TOGGLE_THUMBS: 'Alternar miniaturas',
        TOGGLE_SLIDESHOW: 'Alternar apresentação de slides',
        TOGGLE_FULLSCREEN: 'Alternar tela cheia',
        DOWNLOAD: 'Download'
      }
    })

    console.log('🎉 Fancybox inicializado com sucesso!')
  } else {
    console.warn('⚠️ Fancybox não encontrado para inicializar')
  }
}

// Função para verificar se os plugins estão carregados
export const checkPluginsLoaded = () => {
  console.log('🔍 Verificando carregamento dos plugins...')

  // Verificar se os estilos foram carregados
  const boxiconsLoaded = document.querySelector('link[href*="boxicons"]')
  const fontawesomeLoaded = document.querySelector('link[href*="fontawesome"]')
  const slickLoaded = document.querySelector('link[href*="slick"]')
  const fancyboxLoaded = document.querySelector('link[href*="fancybox"]')

  console.log('📋 Status dos CSS:')
  console.log('- Boxicons:', boxiconsLoaded ? '✅ Carregado' : '❌ Não carregado')
  console.log('- FontAwesome:', fontawesomeLoaded ? '✅ Carregado' : '❌ Não carregado')
  console.log('- Slick:', slickLoaded ? '✅ Carregado' : '❌ Não carregado')
  console.log('- Fancybox:', fancyboxLoaded ? '✅ Carregado' : '❌ Não carregado')

  return {
    boxicons: !!boxiconsLoaded,
    fontawesome: !!fontawesomeLoaded,
    slick: !!slickLoaded,
    fancybox: !!fancyboxLoaded
  }
}
