// Configuração dos plugins do template para o portal
export interface PortalPlugin {
  name: string
  type: 'css' | 'js'
  path: string
  priority: number
  condition?: () => boolean
}

export const PORTAL_PLUGINS: PortalPlugin[] = [
  // jQuery - Biblioteca base (DEVE SER O PRIMEIRO)
  {
    name: 'jquery-js',
    type: 'js',
    path: '/portal/assets/plugins/jquery/jquery.min.js',
    priority: 1
  },

  // Boxicons - Ícones
  {
    name: 'boxicons-css',
    type: 'css',
    path: '/portal/assets/plugins/boxicons/css/boxicons.min.css',
    priority: 2
  },

  // FontAwesome - Ícones
  {
    name: 'fontawesome-css',
    type: 'css',
    path: '/portal/assets/plugins/fontawesome/css/all.min.css',
    priority: 3
  },

  // Fancybox - Galeria de imagens
  {
    name: 'fancybox-css',
    type: 'css',
    path: '/portal/assets/plugins/fancybox/fancybox.css',
    priority: 4
  },
  {
    name: 'fancybox-js',
    type: 'js',
    path: '/portal/assets/plugins/fancybox/fancybox.umd.js',
    priority: 5
  },

  // Flatpickr - Seletor de datas
  {
    name: 'flatpickr-css',
    type: 'css',
    path: '/portal/assets/plugins/flatpickr/flatpickr.min.css',
    priority: 6
  },
  {
    name: 'flatpickr-js',
    type: 'js',
    path: '/portal/assets/plugins/flatpickr/flatpickr.min.js',
    priority: 7
  },
  {
    name: 'flatpickr-locale-pt',
    type: 'js',
    path: '/portal/assets/plugins/flatpickr/locales/pt.js',
    priority: 8
  },

  // FullCalendar - Calendário
  {
    name: 'fullcalendar-js',
    type: 'js',
    path: '/portal/assets/plugins/fullcalendar/index.global.min.js',
    priority: 9
  },

  // AOS - Animações
  {
    name: 'aos-css',
    type: 'css',
    path: '/portal/assets/plugins/aos/aos.css',
    priority: 10
  },
  {
    name: 'aos-js',
    type: 'js',
    path: '/portal/assets/plugins/aos/aos.js',
    priority: 11
  },

  // Slick - Carrossel
  {
    name: 'slick-css',
    type: 'css',
    path: '/portal/assets/plugins/slick/slick.css',
    priority: 12
  },
  {
    name: 'slick-js',
    type: 'js',
    path: '/portal/assets/plugins/slick/slick.js',
    priority: 13
  },

  // Select2 - Select melhorado
  {
    name: 'select2-css',
    type: 'css',
    path: '/portal/assets/plugins/select2/css/select2.min.css',
    priority: 14
  },
  {
    name: 'select2-js',
    type: 'js',
    path: '/portal/assets/plugins/select2/js/select2.min.js',
    priority: 15
  },

  // DataTables - Tabelas
  {
    name: 'datatables-css',
    type: 'css',
    path: '/portal/assets/plugins/datatables/datatables.min.css',
    priority: 16
  },
  {
    name: 'datatables-js',
    type: 'js',
    path: '/portal/assets/plugins/datatables/datatables.min.js',
    priority: 17
  },

  // Ion Range Slider - Controle deslizante
  {
    name: 'ion-rangeslider-css',
    type: 'css',
    path: '/portal/assets/plugins/ion-rangeslider/css/ion.rangeSlider.min.css',
    priority: 18
  },
  {
    name: 'ion-rangeslider-js',
    type: 'js',
    path: '/portal/assets/plugins/ion-rangeslider/js/ion.rangeSlider.min.js',
    priority: 19
  },

  // Moment.js - Manipulação de datas
  {
    name: 'moment-js',
    type: 'js',
    path: '/portal/assets/plugins/moment/moment.min.js',
    priority: 20
  },

  // Theia Sticky Sidebar - Sidebar fixa
  {
    name: 'theia-sticky-sidebar-js',
    type: 'js',
    path: '/portal/assets/plugins/theia-sticky-sidebar/theia-sticky-sidebar.js',
    priority: 21
  },
  {
    name: 'theia-sticky-sidebar-resize-js',
    type: 'js',
    path: '/portal/assets/plugins/theia-sticky-sidebar/ResizeSensor.js',
    priority: 22
  }
]

// Função para carregar plugins dinamicamente
export const loadPortalPlugins = async (plugins: PortalPlugin[] = PORTAL_PLUGINS) => {
  const loadPromises = plugins
    .filter(plugin => !plugin.condition || plugin.condition())
    .sort((a, b) => a.priority - b.priority)
    .map(plugin => {
      return new Promise<void>((resolve, reject) => {
        if (plugin.type === 'css') {
          // Verificar se já foi carregado
          const existingLink = document.querySelector(`link[href="${plugin.path}"]`)
          if (existingLink) {
            resolve()
            return
          }

          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = plugin.path
          link.onload = () => resolve()
          link.onerror = () => reject(new Error(`Failed to load CSS: ${plugin.path}`))
          document.head.appendChild(link)
        } else if (plugin.type === 'js') {
          // Verificar se já foi carregado
          const existingScript = document.querySelector(`script[src="${plugin.path}"]`)
          if (existingScript) {
            resolve()
            return
          }

          const script = document.createElement('script')
          script.src = plugin.path
          // jQuery deve ser carregado de forma síncrona para que outros plugins possam usá-lo
          script.async = plugin.name !== 'jquery-js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error(`Failed to load JS: ${plugin.path}`))
          document.head.appendChild(script)
        }
      })
    })

  try {
    await Promise.all(loadPromises)
    console.log('✅ Plugins do portal carregados com sucesso')
    console.log('📋 Plugins carregados:', plugins.map(p => p.name))
  } catch (error) {
    console.error('❌ Erro ao carregar plugins:', error)
    console.error('🔍 Detalhes do erro:', error)
  }
}

// Função para inicializar plugins específicos
export const initializePlugins = () => {
  // Inicializar AOS (Animate On Scroll)
  if (typeof window !== 'undefined' && (window as unknown as { AOS?: { init: (options: Record<string, unknown>) => void } }).AOS) {
    (window as unknown as { AOS: { init: (options: Record<string, unknown>) => void } }).AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    })
  }

  // Inicializar Fancybox
  if (typeof window !== 'undefined' && (window as unknown as { Fancybox?: { bind: (selector: string, options: Record<string, unknown>) => void } }).Fancybox) {
    (window as unknown as { Fancybox: { bind: (selector: string, options: Record<string, unknown>) => void } }).Fancybox.bind('[data-fancybox]', {
      // Configurações do Fancybox
    })
  }

  // Inicializar Slick Carousel
  if (typeof window !== 'undefined' && (window as unknown as { $?: (selector: string) => { slick: (options: Record<string, unknown>) => void } }).$) {
    const $ = (window as unknown as { $: (selector: string) => { slick: (options: Record<string, unknown>) => void } }).$
    // Inicializar carrosséis com classe .slick-carousel
    $('.slick-carousel').slick({
      dots: true,
      infinite: true,
      speed: 300,
      slidesToShow: 1,
      adaptiveHeight: true
    })
  }

  // Inicializar Select2
  if (typeof window !== 'undefined' && (window as unknown as { $?: (selector: string) => { select2: (options: Record<string, unknown>) => void } }).$) {
    const $ = (window as unknown as { $: (selector: string) => { select2: (options: Record<string, unknown>) => void } }).$
    $('.select2').select2({
      theme: 'default',
      width: '100%'
    })
  }

  // Inicializar DataTables
  if (typeof window !== 'undefined' && (window as unknown as { $?: (selector: string) => { DataTable: (options: Record<string, unknown>) => void } }).$) {
    const $ = (window as unknown as { $: (selector: string) => { DataTable: (options: Record<string, unknown>) => void } }).$
    $('.datatable').DataTable({
      responsive: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.25/i18n/Portuguese-Brasil.json'
      }
    })
  }

  // Inicializar Flatpickr
  if (typeof window !== 'undefined' && (window as unknown as { flatpickr?: (selector: string, options: Record<string, unknown>) => void }).flatpickr) {
    (window as unknown as { flatpickr: (selector: string, options: Record<string, unknown>) => void }).flatpickr('.flatpickr', {
      dateFormat: 'd/m/Y',
      locale: 'pt'
    })
  }

  console.log('✅ Plugins inicializados com sucesso')
}
